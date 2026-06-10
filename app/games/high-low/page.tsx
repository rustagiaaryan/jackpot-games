import { getTodaySponsor } from "@/lib/sponsor";
import { HighLowGame } from "@/components/HighLowGame";

export const dynamic = "force-dynamic";

export const metadata = { title: "High Low — Jackpot Arcade" };

export default async function HighLowPage() {
  const sponsor = await getTodaySponsor();
  return (
    <HighLowGame
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
