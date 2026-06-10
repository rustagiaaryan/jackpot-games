"use client";

import Link from "next/link";

export interface SponsorInfo {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string;
  tagline: string | null;
}

/**
 * Slim global sponsor strip above the nav (PRD §7.1). Gracefully collapses to
 * a "become a sponsor" invitation when no sponsor is set for today, and always
 * carries the sponsor-acquisition link on the right.
 */
export function SponsorBanner({ sponsor }: { sponsor: SponsorInfo | null }) {
  const visit = () => {
    if (!sponsor) return;
    // Count the click, then open — never block the navigation on tracking.
    fetch("/api/sponsor/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sponsorId: sponsor.id }),
      keepalive: true,
    }).catch(() => {});
    window.open(sponsor.websiteUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full border-b border-white/[0.07] bg-gradient-to-r from-violet-950/60 via-[#141022] to-violet-950/60 text-[13px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5">
        {sponsor ? (
          <button
            onClick={visit}
            className="group flex min-w-0 items-center gap-2 text-white/75 transition-colors hover:text-white cursor-pointer"
            title={`Visit ${sponsor.name}`}
          >
            <span className="hidden text-white/45 sm:inline">Today’s Sponsor</span>
            {sponsor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sponsor.logoUrl} alt={sponsor.name} className="h-4 w-auto rounded-sm" />
            ) : (
              <span aria-hidden className="text-gold">✦</span>
            )}
            <span className="truncate font-semibold text-white/90 group-hover:underline">
              {sponsor.name}
            </span>
            {sponsor.tagline && (
              <span className="hidden truncate text-white/45 md:inline">— {sponsor.tagline}</span>
            )}
            <span className="hidden text-gold/90 sm:inline">Visit →</span>
          </button>
        ) : (
          <span className="text-white/55">
            <span aria-hidden className="text-gold">✦</span> This spot is waiting for your brand
          </span>
        )}
        <Link
          href="/sponsor"
          className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 font-medium text-gold transition-colors hover:bg-gold/20"
        >
          Want to be a sponsor?
        </Link>
      </div>
    </div>
  );
}
