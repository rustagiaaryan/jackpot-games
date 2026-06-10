"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GameController } from "@/components/game/useGame";

/**
 * Shared loss state (PRD §18.3): why you lost, how far you got, instant
 * restart — or the friendly daily-limit message when plays run out.
 */
export function LossPanel({
  game,
  reason,
  progressText,
}: {
  game: GameController;
  reason: string;
  progressText: string;
}) {
  const noPlays = game.me?.playsRemaining === 0 || game.dailyLimitReached;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="panel mx-auto mt-5 max-w-md border-red-400/25 p-5 text-center"
    >
      <p className="font-display text-lg font-bold text-red-300">{reason}</p>
      <p className="mt-1.5 text-sm text-white/70">{progressText}</p>
      {noPlays ? (
        <p className="mt-4 rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white/70">
          You’ve used all {game.me?.dailyLimit ?? 500} plays for today. Come back tomorrow when
          your limit resets. 🌙
        </p>
      ) : (
        <button onClick={() => game.start()} className="btn-gold mt-4 !px-8">
          Play Again
        </button>
      )}
      <div className="mt-3">
        <Link href="/games" className="text-xs text-white/45 hover:text-white/70">
          ← All games
        </Link>
      </div>
      {game.error && <p className="mt-2 text-xs text-red-300">{game.error}</p>}
    </motion.div>
  );
}
