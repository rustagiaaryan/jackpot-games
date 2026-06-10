import { db } from "@/lib/db";
import { getDayKey } from "@/lib/day";
import type { GameType } from "@/lib/games/types";

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  best: number; // progress metric (cards / steps / levels)
  attemptsToday: number;
  won: boolean;
}

/**
 * Daily top 10 for one game (PRD §12): winners first, then best progress,
 * then earliest time that best was achieved. Aggregation is done in JS — at
 * MVP scale this is a single indexed day query per game.
 * PRODUCTION TODO: if traffic grows, materialize this into a daily_scores
 * table updated on game end, or cache with a short TTL.
 */
export async function getDailyLeaderboard(
  gameType: GameType,
  dayKey: string = getDayKey()
): Promise<LeaderboardEntry[]> {
  const sessions = await db.gameSession.findMany({
    where: { gameType, dayKey },
    select: {
      userId: true,
      progress: true,
      status: true,
      endedAt: true,
      lastActionAt: true,
      user: { select: { displayName: true } },
    },
  });

  const byUser = new Map<
    string,
    { displayName: string; best: number; bestAt: number; attempts: number; won: boolean }
  >();

  for (const s of sessions) {
    const at = (s.endedAt ?? s.lastActionAt).getTime();
    const cur = byUser.get(s.userId);
    const won = s.status === "won";
    if (!cur) {
      byUser.set(s.userId, {
        displayName: s.user.displayName,
        best: s.progress,
        bestAt: at,
        attempts: 1,
        won,
      });
    } else {
      cur.attempts += 1;
      cur.won = cur.won || won;
      if (s.progress > cur.best) {
        cur.best = s.progress;
        cur.bestAt = at;
      } else if (s.progress === cur.best && at < cur.bestAt) {
        cur.bestAt = at;
      }
    }
  }

  return [...byUser.values()]
    .sort((a, b) => {
      if (a.won !== b.won) return a.won ? -1 : 1;
      if (a.best !== b.best) return b.best - a.best;
      return a.bestAt - b.bestAt;
    })
    .slice(0, 10)
    .map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      best: e.best,
      attemptsToday: e.attempts,
      won: e.won,
    }));
}

/** Best progress achieved today for a game — shown on game cards. */
export async function getBestToday(gameType: GameType): Promise<number | null> {
  const top = await db.gameSession.findFirst({
    where: { gameType, dayKey: getDayKey() },
    orderBy: { progress: "desc" },
    select: { progress: true },
  });
  return top?.progress ?? null;
}
