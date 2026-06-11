"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GameController } from "@/components/game/useGame";
import type { SponsorInfo } from "@/components/SponsorBanner";

// Loss popup (PRD §18.3): pops up ON TOP of the game the moment a run ends —
// no scrolling to find the restart button. The modal is wrapped in a moving
// glow border and a scrolling strip carrying today's sponsor, so every loss
// is also a sponsor impression.

function SponsorMarquee({ sponsor }: { sponsor: SponsorInfo | null }) {
  const label = sponsor ? `✦ ${sponsor.name}` : "✦ 1K ARCADE";
  const items = Array.from({ length: 6 }, () => label);
  return (
    <div className="overflow-hidden bg-black/45 py-1.5">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {items.map((text, i) => (
              <span
                key={`${copy}-${i}`}
                className="mx-4 whitespace-nowrap font-display text-xs font-extrabold uppercase tracking-[0.22em] text-gold"
              >
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LossPanel({
  game,
  reason,
  progressText,
  sponsor,
}: {
  game: GameController;
  reason: string;
  progressText: string;
  sponsor: SponsorInfo | null;
}) {
  const noPlays = game.me?.playsRemaining === 0 || game.dailyLimitReached;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative w-full max-w-md overflow-hidden rounded-[1.6rem] shadow-[0_18px_60px_rgba(0,0,0,0.6)]"
      >
        {/* moving border: an oversized spinning conic gradient behind the card */}
        <div
          aria-hidden
          className="animate-border-spin absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, var(--gold) 40deg, transparent 80deg, transparent 160deg, var(--pink) 200deg, transparent 240deg, transparent 320deg, var(--cyan) 350deg, transparent 360deg)",
          }}
        />
        <div className="relative m-[3px] overflow-hidden rounded-[1.45rem] bg-[#13242f]">
          <SponsorMarquee sponsor={sponsor} />
          <div className="p-6 text-center sm:p-7">
            <motion.div
              initial={{ rotate: -12, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="text-5xl"
            >
              💥
            </motion.div>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-red-400">
              {noPlays ? "OUT OF PLAYS" : "SO CLOSE!"}
            </h2>
            <p className="mt-2 text-lg font-extrabold text-white">{reason}</p>
            <p className="mt-1 text-base font-bold text-white/85">{progressText}</p>

            {noPlays ? (
              <p className="mt-5 rounded-xl border-2 border-white/20 bg-white/[0.07] px-4 py-3 text-base font-bold text-white">
                That’s all {game.me?.dailyLimit ?? 500} plays for today. Come back tomorrow for
                a fresh set! 🌙
              </p>
            ) : (
              <button onClick={() => game.start()} className="btn-win mt-5 w-full !py-4 !text-xl">
                ▶ PLAY AGAIN
              </button>
            )}
            <div className="mt-3 flex items-center justify-center gap-5 text-sm font-bold">
              <Link href="/games" className="text-white/70 hover:text-white">
                ← All games
              </Link>
              <Link href="/leaderboards" className="text-white/70 hover:text-white">
                Leaderboards
              </Link>
            </div>
            {game.error && (
              <p className="mt-2 text-sm font-bold text-red-300">{game.error}</p>
            )}
          </div>
          <SponsorMarquee sponsor={sponsor} />
        </div>
      </motion.div>
    </motion.div>
  );
}
