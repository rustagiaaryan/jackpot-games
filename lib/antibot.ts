import { db } from "@/lib/db";
import { secureInt } from "@/lib/random";
import { HUMAN_CHECK_EVERY } from "@/lib/settings";
import { notifyOwner } from "@/lib/notifications";
import type { User, GameSession } from "@prisma/client";

// Anti-bot / anti-cheat layer.
//
// Three mechanisms, layered:
//  1. Rate limits on every sensitive endpoint (lib/rateLimit.ts).
//  2. A quick human check after every HUMAN_CHECK_EVERY game starts.
//  3. Per-action timing heuristics that flag inhumanly fast play.
//
// PRODUCTION TODO: replace the built-in arithmetic human check with Cloudflare
// Turnstile (invisible for most users) — verify the Turnstile token in
// verifyHumanCheck() instead of comparing answers. Also consider adding
// device fingerprinting (e.g. FingerprintJS) to catch multi-account farms,
// and IP reputation / VPN detection on signup.

export interface HumanChallenge {
  prompt: string;
}

/** True if this user must pass a human check before starting another game. */
export function humanCheckDue(user: User): boolean {
  return user.playsSinceHumanCheck >= HUMAN_CHECK_EVERY;
}

/** Create and store a simple arithmetic challenge for the user. */
export async function issueHumanCheck(userId: string): Promise<HumanChallenge> {
  const a = secureInt(9) + 1;
  const b = secureInt(9) + 1;
  await db.user.update({
    where: { id: userId },
    data: { humanCheckAnswer: String(a + b) },
  });
  return { prompt: `What is ${a} + ${b}?` };
}

export async function verifyHumanCheck(user: User, answer: string): Promise<boolean> {
  if (!user.humanCheckAnswer) return false;
  const ok = answer.trim() === user.humanCheckAnswer;
  if (ok) {
    await db.user.update({
      where: { id: user.id },
      data: { humanCheckAnswer: null, playsSinceHumanCheck: 0 },
    });
  }
  return ok;
}

/** Fastest plausible human interval between deliberate game actions (ms). */
const MIN_HUMAN_ACTION_MS = 250;
/** How many too-fast actions in one session before we flag it. */
const FAST_ACTION_FLAG_THRESHOLD = 5;

/**
 * Timing heuristic, called on every in-game action. Counts inhumanly fast
 * actions in the session history; flags the session (and user) when the
 * threshold is crossed. Flagged wins are routed to manual review.
 */
export async function recordActionTiming(
  session: GameSession,
  history: { at: number }[]
): Promise<{ suspicious: boolean; reason?: string }> {
  if (history.length < 2) return { suspicious: session.suspicious };
  let fastCount = 0;
  for (let i = 1; i < history.length; i++) {
    if (history[i].at - history[i - 1].at < MIN_HUMAN_ACTION_MS) fastCount++;
  }
  if (fastCount >= FAST_ACTION_FLAG_THRESHOLD && !session.suspicious) {
    const reason = `Inhuman action speed: ${fastCount} actions under ${MIN_HUMAN_ACTION_MS}ms apart`;
    await db.user.update({
      where: { id: session.userId },
      data: { flagged: true, flagReason: reason },
    });
    await notifyOwner({
      type: "suspicious_activity",
      title: "Suspicious play speed detected",
      body: `User ${session.userId} flagged during a ${session.gameType} session: ${reason}`,
      payload: { userId: session.userId, gameSessionId: session.id },
    });
    return { suspicious: true, reason };
  }
  return { suspicious: session.suspicious, reason: session.suspicionReason ?? undefined };
}
