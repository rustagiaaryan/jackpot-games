import { db } from "@/lib/db";

/** Hard product rule: total game attempts per user per day, across all games. */
export const DAILY_PLAY_LIMIT = 500;

/** A quick human check is required after this many game starts. */
export const HUMAN_CHECK_EVERY = 25;

const DEFAULT_JACKPOT = Number(process.env.JACKPOT_AMOUNT ?? 1000);

/**
 * Current jackpot in whole dollars. Stored in the Setting table so the owner
 * can update it live from /admin; falls back to the JACKPOT_AMOUNT env var.
 */
export async function getJackpotAmount(): Promise<number> {
  const row = await db.setting.findUnique({ where: { key: "jackpotAmount" } });
  const parsed = row ? Number(row.value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_JACKPOT;
}

export async function setJackpotAmount(amount: number): Promise<void> {
  await db.setting.upsert({
    where: { key: "jackpotAmount" },
    update: { value: String(amount) },
    create: { key: "jackpotAmount", value: String(amount) },
  });
}
