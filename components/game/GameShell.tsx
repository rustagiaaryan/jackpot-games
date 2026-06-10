"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { GameMeta } from "@/lib/games/meta";
import type { GameController } from "@/components/game/useGame";
import { WinOverlay } from "@/components/game/WinOverlay";

// Shared chrome for all three games (PRD §11): pre-game instructions with a
// Start button, instructions collapsing into an always-available info icon,
// login gate, human-check modal, daily-limit handling, and the win overlay.

export function GameShell({
  meta,
  game,
  holdOverlays = false,
  children,
}: {
  meta: GameMeta;
  game: GameController;
  /** Keep the win overlay back while an in-game animation finishes. */
  holdOverlays?: boolean;
  children: ReactNode;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [checkAnswer, setCheckAnswer] = useState("");
  const [checkError, setCheckError] = useState(false);
  const { me, loggedIn, phase, state, humanCheck } = game;

  const jackpot = state?.jackpot ?? me?.jackpot ?? 1000;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Game header: title, info icon, jackpot + plays (PRD §4, §6.1) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            {meta.emoji} {meta.name}
          </h1>
          <button
            aria-label="Game instructions"
            onClick={() => setInfoOpen(true)}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/25 text-xs text-white/60 transition-colors hover:border-gold hover:text-gold cursor-pointer"
          >
            i
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip border-gold/40 bg-gold/10 text-gold">
            💰 ${jackpot.toLocaleString()} jackpot
          </span>
          {me?.user && me.playsRemaining !== undefined && (
            <span className="chip">
              {me.playsRemaining} / {me.dailyLimit} plays left
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-6">
        {children}

        {/* Pre-game instructions overlay (collapses into the info icon) */}
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-[#08080f]/85 backdrop-blur-sm"
            >
              <div className="max-w-md p-6 text-center">
                <span className="text-4xl">{meta.emoji}</span>
                <h2 className="font-display mt-3 text-xl font-bold">How to play</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{meta.instructions}</p>
                <p className="mt-3 text-xs text-white/45">
                  Complete the game to win the{" "}
                  <span className="font-semibold text-gold">${jackpot.toLocaleString()} jackpot</span>.
                </p>
                {loggedIn ? (
                  <StartButton game={game} label="Start Game" big />
                ) : (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-white/85">
                      Create a free account to play.
                    </p>
                    <Link
                      href={`/login?next=/games/${meta.slug}`}
                      className="btn-gold mt-3 !px-8 !py-3"
                    >
                      Sign up with your phone →
                    </Link>
                    <p className="mt-2 text-[11px] text-white/40">
                      Browsing is free — playing needs a verified phone number.
                    </p>
                  </div>
                )}
                {game.error && <ErrorNote text={game.error} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info modal (PRD §11: instructions available any time during play) */}
      <AnimatePresence>
        {infoOpen && (
          <Modal onClose={() => setInfoOpen(false)}>
            <h2 className="font-display text-lg font-bold">
              {meta.emoji} {meta.name} — instructions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{meta.instructions}</p>
            <button onClick={() => setInfoOpen(false)} className="btn-gold mt-5 w-full">
              Got it
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Quick human check (PRD §15.4). PRODUCTION TODO: swap for Turnstile. */}
      <AnimatePresence>
        {humanCheck && (
          <Modal>
            <h2 className="font-display text-lg font-bold">🧍 Quick human check</h2>
            <p className="mt-2 text-sm text-white/60">
              Just making sure you’re not a robot — happens once in a while.
            </p>
            <p className="mt-4 text-center font-display text-2xl font-bold text-gold">
              {humanCheck}
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await game.submitHumanCheck(checkAnswer);
                setCheckError(!ok);
                setCheckAnswer("");
                if (ok) game.start();
              }}
              className="mt-4 flex gap-2"
            >
              <input
                autoFocus
                inputMode="numeric"
                value={checkAnswer}
                onChange={(e) => setCheckAnswer(e.target.value)}
                className="input text-center text-lg"
                placeholder="Answer"
              />
              <button type="submit" className="btn-gold">Continue</button>
            </form>
            {checkError && (
              <p className="animate-shake mt-2 text-xs text-red-300">Not quite — try again.</p>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Jackpot win celebration + payout flow (PRD §14) */}
      {phase === "won" && state && !holdOverlays && (
        <WinOverlay jackpot={jackpot} gameSessionId={state.sessionId} meta={meta} />
      )}
    </div>
  );
}

export function StartButton({
  game,
  label,
  big = false,
}: {
  game: GameController;
  label: string;
  big?: boolean;
}) {
  const noPlays = game.dailyLimitReached || game.me?.playsRemaining === 0;
  if (noPlays) {
    return (
      <p className="mx-auto mt-6 max-w-xs rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white/70">
        You’ve used all {game.me?.dailyLimit ?? 500} plays for today. Come back tomorrow when
        your limit resets. 🌙
      </p>
    );
  }
  return (
    <button
      onClick={() => game.start()}
      className={`btn-gold mt-6 ${big ? "!px-10 !py-3.5 !text-base" : ""}`}
    >
      {label}
    </button>
  );
}

export function ErrorNote({ text }: { text: string }) {
  return (
    <p className="animate-shake mx-auto mt-4 max-w-sm rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
      {text}
    </p>
  );
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="panel w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
