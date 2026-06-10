import { db } from "@/lib/db";
import { getDayKey } from "@/lib/day";
import { GAME_TYPES, type GameType } from "@/lib/games/types";

export interface PerGameStats {
  gameType: GameType;
  totalAttempts: number;
  bestEver: number;
  bestToday: number;
  average: number;
  wins: number;
}

/** Per-game lifetime + daily stats for the profile page (PRD §13.2). */
export async function getUserGameStats(userId: string): Promise<PerGameStats[]> {
  const today = getDayKey();
  const out: PerGameStats[] = [];
  for (const gameType of GAME_TYPES) {
    const [agg, todayAgg, wins] = await Promise.all([
      db.gameSession.aggregate({
        where: { userId, gameType },
        _count: true,
        _max: { progress: true },
        _avg: { progress: true },
      }),
      db.gameSession.aggregate({
        where: { userId, gameType, dayKey: today },
        _max: { progress: true },
      }),
      db.win.count({ where: { userId, gameType } }),
    ]);
    out.push({
      gameType,
      totalAttempts: agg._count,
      bestEver: agg._max.progress ?? 0,
      bestToday: todayAgg._max.progress ?? 0,
      average: Math.round((agg._avg.progress ?? 0) * 10) / 10,
      wins,
    });
  }
  return out;
}

export interface SiteStats {
  totalUsers: number;
  totalGames: number;
  gamesToday: number;
  totalWinners: number;
}

/** Public site stats teased on the home page (PRD §22). */
export async function getSiteStats(): Promise<SiteStats> {
  const [totalUsers, totalGames, gamesToday, totalWinners] = await Promise.all([
    db.user.count(),
    db.gameSession.count(),
    db.gameSession.count({ where: { dayKey: getDayKey() } }),
    db.win.count(),
  ]);
  return { totalUsers, totalGames, gamesToday, totalWinners };
}
