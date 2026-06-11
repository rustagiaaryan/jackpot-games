import { db } from "@/lib/db";

/** Hard product rule: total game attempts per user per day, across all games. */
export const DAILY_PLAY_LIMIT = 500;

/** A quick human check is required after this many game starts. */
export const HUMAN_CHECK_EVERY = 25;

const DEFAULT_PRIZE = Number(process.env.PRIZE_AMOUNT ?? 1000);

/**
 * Prize for beating ANY game, in whole dollars — every winner gets this, no
 * strings attached (never call it a "jackpot" in copy: that sounds like only
 * one person can win it). Stored in the Setting table so the owner can update
 * it live from /admin; falls back to the PRIZE_AMOUNT env var.
 */
export async function getPrizeAmount(): Promise<number> {
  const row = await db.setting.findUnique({ where: { key: "prizeAmount" } });
  const parsed = row ? Number(row.value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRIZE;
}

export async function setPrizeAmount(amount: number): Promise<void> {
  await db.setting.upsert({
    where: { key: "prizeAmount" },
    update: { value: String(amount) },
    create: { key: "prizeAmount", value: String(amount) },
  });
}
