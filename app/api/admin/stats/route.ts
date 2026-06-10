import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { withErrors } from "@/lib/api";
import { getDayKey } from "@/lib/day";
import { GAME_TYPES } from "@/lib/games/types";
import { getSiteStats } from "@/lib/stats";
import { getBestToday } from "@/lib/leaderboard";

/** Owner analytics (PRD §21, §22). */
export const GET = withErrors(async () => {
  await requireAdmin();
  const today = getDayKey();
  const site = await getSiteStats();

  const perGame = await Promise.all(
    GAME_TYPES.map(async (gameType) => {
      const [total, todayCount, avg, best] = await Promise.all([
        db.gameSession.count({ where: { gameType } }),
        db.gameSession.count({ where: { gameType, dayKey: today } }),
        db.gameSession.aggregate({ where: { gameType }, _avg: { progress: true } }),
        getBestToday(gameType),
      ]);
      return {
        gameType,
        totalPlays: total,
        playsToday: todayCount,
        avgProgress: Math.round((avg._avg.progress ?? 0) * 10) / 10,
        bestToday: best ?? 0,
      };
    })
  );

  const [winnersToday, sponsorClicks, flaggedUsers] = await Promise.all([
    db.win.count({ where: { wonAt: { gte: new Date(`${today}T00:00:00`) } } }),
    db.sponsor.aggregate({ _sum: { clickCount: true } }),
    db.user.count({ where: { flagged: true } }),
  ]);

  return NextResponse.json({
    ...site,
    winnersToday,
    perGame,
    sponsorClicksTotal: sponsorClicks._sum.clickCount ?? 0,
    flaggedUsers,
  });
});
