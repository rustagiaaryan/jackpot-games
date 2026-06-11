import { db } from "@/lib/db";
import { getDayKey } from "@/lib/day";
import { DAILY_PLAY_LIMIT, getJackpotAmount } from "@/lib/settings";
import { humanCheckDue, issueHumanCheck, recordActionTiming } from "@/lib/antibot";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";
import { notifyOwner } from "@/lib/notifications";
import { maskPhone } from "@/lib/phone";
import {
  isGameType,
  type GameType,
  type GameStatus,
  type HistoryEntry,
  type PublicSessionState,
  type HighLowSecret,
  type DiceSecret,
} from "@/lib/games/types";
import { startHighLow, applyHighLowGuess, highLowPublicState } from "@/lib/games/highlow";
import { startDice, applyDiceRoll, dicePublicState } from "@/lib/games/dice";
import type { User, GameSession } from "@prisma/client";

// Session orchestration shared by all game API routes.
//
// Invariants enforced here:
//  • Hidden state never leaves the server (responses built from Public* only).
//  • One active session per (user, game) — opening a second tab abandons the
//    first attempt rather than duplicating it.
//  • The 500/day limit is checked when a game STARTS; an in-flight game may
//    finish even if the limit is reached mid-game (PRD §23.4).
//  • Every action is appended to the session history with a timestamp, giving
//    a full replay for fraud review on any winning attempt.

export class GameError extends Error {
  constructor(message: string, public code: string = "game_error", public extra?: unknown) {
    super(message);
  }
}

export async function playsUsedToday(userId: string): Promise<number> {
  return db.gameSession.count({ where: { userId, dayKey: getDayKey() } });
}

interface Ctx {
  playsUsedToday: number;
  jackpot: number;
}

async function buildCtx(userId: string): Promise<Ctx> {
  const [used, jackpot] = await Promise.all([playsUsedToday(userId), getJackpotAmount()]);
  return { playsUsedToday: used, jackpot };
}

function toPublic(session: GameSession, ctx: Ctx): PublicSessionState {
  const status = session.status as GameStatus;
  const base: PublicSessionState = {
    sessionId: session.id,
    gameType: session.gameType as GameType,
    status,
    progress: session.progress,
    playsUsedToday: ctx.playsUsedToday,
    playsRemaining: Math.max(0, DAILY_PLAY_LIMIT - ctx.playsUsedToday),
    jackpot: ctx.jackpot,
  };
  const lost = status === "lost";
  if (session.gameType === "highlow") {
    const secret = JSON.parse(session.secretState) as HighLowSecret;
    base.highlow = highLowPublicState(secret, session.progress, lost);
  } else if (session.gameType === "dice") {
    const secret = JSON.parse(session.secretState) as DiceSecret;
    const history = JSON.parse(session.history) as HistoryEntry[];
    const rolls = history.filter((h) => h.t === "roll");
    const last = rolls[rolls.length - 1];
    base.dice = dicePublicState(
      secret,
      last
        ? {
            d1: last.d1 as number,
            d2: last.d2 as number,
            d3: last.d3 as number,
            sum: last.sum as number,
          }
        : null
    );
  }
  return base;
}

// ── Start ───────────────────────────────────────────────────────────────────

export async function startGame(user: User, gameTypeRaw: string): Promise<PublicSessionState> {
  if (!isGameType(gameTypeRaw)) throw new GameError("Unknown game.", "bad_request");
  const gameType: GameType = gameTypeRaw;

  if (user.banned) throw new GameError("This account has been suspended.", "banned");

  // Cooldown between starts + burst protection (anti spam/bot).
  const cd = checkRateLimit(`start:${user.id}`, LIMITS.gameStart.max, LIMITS.gameStart.windowMs);
  if (!cd.allowed) {
    throw new GameError("You're starting games too quickly. One moment…", "rate_limited", {
      retryAfterMs: cd.retryAfterMs,
    });
  }
  const burst = checkRateLimit(
    `startburst:${user.id}`,
    LIMITS.gameStartBurst.max,
    LIMITS.gameStartBurst.windowMs
  );
  if (!burst.allowed) {
    throw new GameError("Too many games started this minute. Take a short breather.", "rate_limited", {
      retryAfterMs: burst.retryAfterMs,
    });
  }

  // Periodic human verification (PRD §15.4).
  if (humanCheckDue(user)) {
    const challenge = await issueHumanCheck(user.id);
    throw new GameError("Quick human check required.", "human_check_required", challenge);
  }

  // 500 attempts/day across all games (PRD §6).
  const used = await playsUsedToday(user.id);
  if (used >= DAILY_PLAY_LIMIT) {
    throw new GameError(
      `You've used all ${DAILY_PLAY_LIMIT} plays for today. Come back tomorrow when your limit resets.`,
      "daily_limit"
    );
  }

  // Abandon any still-active session of this game (refresh / multi-tab safety:
  // the old attempt is closed, never duplicated or resumed into a win).
  await db.gameSession.updateMany({
    where: { userId: user.id, gameType, status: "active" },
    data: { status: "abandoned", endedAt: new Date() },
  });

  const started = gameType === "highlow" ? startHighLow() : startDice();

  const history: HistoryEntry[] = [{ t: "start", at: Date.now() }];
  const session = await db.gameSession.create({
    data: {
      userId: user.id,
      gameType,
      secretState: JSON.stringify(started.secret),
      progress: started.progress,
      history: JSON.stringify(history),
      dayKey: getDayKey(),
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { playsSinceHumanCheck: { increment: 1 } },
  });

  const ctx = await buildCtx(user.id);
  return toPublic(session, ctx);
}

/** Resume the player's active session for a game (page refresh, PRD §23.2). */
export async function getActiveSession(
  user: User,
  gameTypeRaw: string
): Promise<PublicSessionState | null> {
  if (!isGameType(gameTypeRaw)) throw new GameError("Unknown game.", "bad_request");
  const session = await db.gameSession.findFirst({
    where: { userId: user.id, gameType: gameTypeRaw, status: "active" },
    orderBy: { startedAt: "desc" },
  });
  if (!session) return null;
  const ctx = await buildCtx(user.id);
  return toPublic(session, ctx);
}

// ── Actions ─────────────────────────────────────────────────────────────────

async function loadActiveSession(user: User, sessionId: string, gameType: GameType) {
  const rl = checkRateLimit(`action:${user.id}`, LIMITS.gameAction.max, LIMITS.gameAction.windowMs);
  if (!rl.allowed) throw new GameError("Slow down a little.", "rate_limited");

  const session = await db.gameSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== user.id || session.gameType !== gameType) {
    throw new GameError("Game session not found.", "not_found");
  }
  if (session.status !== "active") {
    // Finished sessions cannot be replayed or re-submitted (PRD §15.2).
    throw new GameError("This game has already ended. Start a new one!", "session_over");
  }
  return session;
}

interface ActionOutcome {
  state: PublicSessionState;
  result: Record<string, unknown>;
}

async function finalizeAction(
  user: User,
  session: GameSession,
  entry: HistoryEntry,
  update: { progress: number; won: boolean; lost: boolean; secret?: unknown },
  result: Record<string, unknown>
): Promise<ActionOutcome> {
  const history = [...(JSON.parse(session.history) as HistoryEntry[]), entry];
  const timing = await recordActionTiming(session, history as { at: number }[]);

  const status: GameStatus = update.won ? "won" : update.lost ? "lost" : "active";
  const updated = await db.gameSession.update({
    where: { id: session.id },
    data: {
      progress: update.progress,
      status,
      history: JSON.stringify(history),
      lastActionAt: new Date(),
      endedAt: status === "active" ? null : new Date(),
      suspicious: timing.suspicious,
      suspicionReason: timing.reason ?? null,
      ...(update.secret !== undefined ? { secretState: JSON.stringify(update.secret) } : {}),
    },
  });

  if (update.won) await recordWin(user, updated);

  const ctx = await buildCtx(user.id);
  return { state: toPublic(updated, ctx), result };
}

export async function highLowGuess(
  user: User,
  sessionId: string,
  guess: "higher" | "lower"
): Promise<ActionOutcome> {
  const session = await loadActiveSession(user, sessionId, "highlow");
  const secret = JSON.parse(session.secretState) as HighLowSecret;
  const r = applyHighLowGuess(secret, session.progress, guess);
  return finalizeAction(
    user,
    session,
    { t: "guess", at: Date.now(), guess, revealed: r.revealedCard, outcome: r.outcome },
    { progress: r.newProgress, won: r.won, lost: r.lost },
    {
      outcome: r.outcome,
      revealedCard: r.revealedCard,
      previousCard: r.previousCard,
      won: r.won,
      lost: r.lost,
    }
  );
}

export async function diceRoll(user: User, sessionId: string): Promise<ActionOutcome> {
  const session = await loadActiveSession(user, sessionId, "dice");
  const secret = JSON.parse(session.secretState) as DiceSecret;
  const r = applyDiceRoll(secret);
  return finalizeAction(
    user,
    session,
    { t: "roll", at: Date.now(), d1: r.d1, d2: r.d2, d3: r.d3, sum: r.sum, collected: r.collected },
    { progress: r.newProgress, won: r.won, lost: r.lost, secret },
    {
      d1: r.d1,
      d2: r.d2,
      d3: r.d3,
      sum: r.sum,
      collected: r.collected,
      sumsCollected: r.newProgress,
      won: r.won,
      lost: r.lost,
    }
  );
}

// ── Winner flow ─────────────────────────────────────────────────────────────

const GAME_NAMES: Record<GameType, string> = {
  highlow: "High Low",
  dice: "Dice Sweep",
};

async function recordWin(user: User, session: GameSession): Promise<void> {
  const jackpot = await getJackpotAmount();
  const payout = await db.payoutInfo.findUnique({ where: { userId: user.id } });

  // Every win starts in needs_review: the owner verifies the session replay
  // and fraud indicators before approving payout (PRD §14.4, §21).
  await db.win.create({
    data: {
      userId: user.id,
      gameSessionId: session.id,
      gameType: session.gameType,
      jackpotAmount: jackpot,
      payoutStatus: "pending",
      reviewStatus: "needs_review",
      fraudNotes: session.suspicious ? session.suspicionReason : null,
      payoutMethod: payout?.method ?? null,
      payoutHandle: payout?.handle ?? null,
      payoutName: payout?.fullName ?? null,
    },
  });

  const gameName = GAME_NAMES[session.gameType as GameType];
  await notifyOwner({
    type: "jackpot_win",
    title: `🏆 JACKPOT WIN — ${user.displayName} completed ${gameName}!`,
    body: [
      `Player: ${user.displayName}`,
      `Phone: ${user.phone} (masked publicly as ${maskPhone(user.phone)})`,
      `Game: ${gameName}`,
      `Won at: ${new Date().toISOString()}`,
      `Session: ${session.id}`,
      `Jackpot: $${jackpot}`,
      `Payout info on file: ${payout ? `${payout.method} — ${payout.handle} (${payout.fullName})` : "none yet"}`,
      `Fraud indicators: ${session.suspicious ? session.suspicionReason : "none detected"}`,
    ].join("\n"),
    payload: {
      userId: user.id,
      gameSessionId: session.id,
      gameType: session.gameType,
      history: JSON.parse(session.history),
    },
  });
}
