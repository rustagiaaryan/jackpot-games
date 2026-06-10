import { getTodaySponsor } from "@/lib/sponsor";
import { DoorsGame } from "@/components/DoorsGame";

export const dynamic = "force-dynamic";

export const metadata = { title: "Doors Challenge — Jackpot Arcade" };

export default async function DoorsPage() {
  const sponsor = await getTodaySponsor();
  return (
    <DoorsGame
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
