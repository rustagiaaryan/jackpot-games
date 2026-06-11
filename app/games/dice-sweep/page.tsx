import { getTodaySponsor } from "@/lib/sponsor";
import { DiceGame } from "@/components/DiceGame";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dice Sweep — Jackpot Arcade" };

export default async function DiceSweepPage() {
  const sponsor = await getTodaySponsor();
  return (
    <DiceGame
      sponsor={
        sponsor
          ? {
              id: sponsor.id,
              name: sponsor.name,
              logoUrl: sponsor.logoUrl,
              websiteUrl: sponsor.websiteUrl,
              tagline: sponsor.tagline,
            }
          : null
      }
    />
  );
}
