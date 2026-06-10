import { db } from "@/lib/db";
import { getDayKey } from "@/lib/day";
import type { Sponsor } from "@prisma/client";

/**
 * Sponsor of the day. The site gracefully handles `null` (no sponsor set):
 * the banner collapses to a "Become a sponsor" invitation and in-game
 * branding falls back to the house mark.
 */
export async function getTodaySponsor(): Promise<Sponsor | null> {
  return db.sponsor.findFirst({ where: { activeDate: getDayKey() } });
}
