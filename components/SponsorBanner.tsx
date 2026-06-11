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
 * Global sponsor banner (PRD §7.1): big, bold, and impossible to miss — it
 * stays stuck to the top of every page (the sticky wrapper lives in the
 * layout). It never overlaps game controls; it just owns its strip.
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
    <div className="relative w-full overflow-hidden border-b-2 border-violet/40 bg-gradient-to-r from-[#2a1654] via-[#3b1d77] to-[#2a1654]">
      {/* moving shine so the strip always catches the eye */}
      <div
        className="pointer-events-none absolute inset-0 animate-shimmer"
        style={{
          background:
            "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        {sponsor ? (
          <button
            onClick={visit}
            className="group flex min-w-0 items-center gap-3 cursor-pointer"
            title={`Visit ${sponsor.name}`}
          >
            <span className="hidden shrink-0 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white sm:inline">
              Today’s Sponsor
            </span>
            {sponsor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sponsor.logoUrl} alt={sponsor.name} className="h-6 w-auto rounded" />
            ) : (
              <span aria-hidden className="text-lg text-gold">✦</span>
            )}
            <span className="truncate font-display text-base font-extrabold text-white group-hover:underline sm:text-lg">
              {sponsor.name}
            </span>
            {sponsor.tagline && (
              <span className="hidden truncate text-sm font-semibold text-white/85 md:inline">
                — {sponsor.tagline}
              </span>
            )}
            <span className="hidden shrink-0 rounded-lg bg-gold px-2.5 py-1 text-xs font-extrabold text-black transition-transform group-hover:scale-105 sm:inline">
              VISIT →
            </span>
          </button>
        ) : (
          <span className="font-display text-base font-extrabold text-white">
            <span aria-hidden className="text-gold">✦</span> Your brand could own this spot all
            day
          </span>
        )}
        <Link
          href="/sponsor"
          className="shrink-0 rounded-lg border-2 border-gold/60 bg-gold/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-black"
        >
          Want to be a sponsor?
        </Link>
      </div>
    </div>
  );
}
