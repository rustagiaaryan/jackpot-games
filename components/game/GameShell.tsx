"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { GameMeta } from "@/lib/games/meta";
import type { GameController } from "@/components/game/useGame";
import { WinOverlay } from "@/components/game/WinOverlay";

// Shared chrome for all games (PRD §11): pre-game bulletin-board rules with a
// big Start button, rules collapsing into an always-available info icon,
// login gate, human-check modal, daily-limit handling, and the win overlay.

/** Bold numbered rules, bulletin-board style (PRD §11). */
function RulesBoard({ meta }: { meta: GameMeta }) {
  return (
    <div className="rounded-2xl border-2 border-gold/50 bg-[#10222f] p-1.5 shadow-[0_0_34px_rgba(255,210,63,0.15)]">
      <div className="rounded-xl border-2 border-dashed border-gold/40 px-4 py-4 sm:px-6">
        <h3 className="font-display text-center text-xl font-extrabold uppercase tracking-[0.18em] text-gold">
          📌 How to play
        </h3>
        <ol className="mt-4 space-y-3 text-left">
          {meta.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold font-display text-base font-extrabold text-black shadow-[0_3px_0_var(--gold-deep)]">
                {i + 1}
              </span>
              <span className="pt-1 text-base font-bold leading-snug text-white">{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

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

  const prize = state?.prize ?? me?.prize ?? 1000;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Game header: title, info icon, prize + plays (PRD §4, §6.1) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
            {meta.emoji} {meta.name}
          </h1>
          <button
            aria-label="Game rules"
            onClick={() => setInfoOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/35 text-sm font-extrabold text-white/85 transition-colors hover:border-gold hover:text-gold cursor-pointer"
          >
            i
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip border-gold/60 bg-gold/15 text-gold">
            💰 WIN ${prize.toLocaleString()}
          </span>
          {me?.user && me.playsRemaining !== undefined && (
            <span className="chip">
              {me.playsRemaining} / {me.dailyLimit} plays
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-6">
        {children}

        {/* Pre-game rules overlay (collapses into the info icon) */}
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="absolute inset-0 z-20 grid place-items-center overflow-y-auto rounded-2xl bg-[#0c1a26]/92 backdrop-blur-sm"
            >
              <div className="w-full max-w-md p-4 py-6 text-center sm:p-6">
                <RulesBoard meta={meta} />
                <p className="mt-4 text-base font-extrabold text-white">
                  Beat it and <span className="text-gold">${prize.toLocaleString()}</span> is
                  yours. No strings attached.
                </p>
                {loggedIn ? (
                  <StartButton game={game} label="▶ START GAME" big />
                ) : (
                  <div className="mt-5">
                    <p className="text-lg font-extrabold text-white">
                      Create a free account to play.
                    </p>
                    <Link
                      href={`/login?next=/games/${meta.slug}`}
                      className="btn-win mt-3 !px-8 !py-3.5"
                    >
                      Sign up with your phone →
                    </Link>
                    <p className="mt-2 text-sm font-semibold text-white/70">
                      Takes 30 seconds. Browsing is free — playing needs a verified number.
                    </p>
                  </div>
                )}
                {game.error && <ErrorNote text={game.error} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info modal (PRD §11: rules available any time during play) */}
      <AnimatePresence>
        {infoOpen && (
          <Modal onClose={() => setInfoOpen(false)}>
            <RulesBoard meta={meta} />
            <button onClick={() => setInfoOpen(false)} className="btn-win mt-5 w-full">
              GOT IT
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Quick human check (PRD §15.4). PRODUCTION TODO: swap for Turnstile. */}
      <AnimatePresence>
        {humanCheck && (
          <Modal>
            <h2 className="font-display text-xl font-extrabold">🧍 Quick human check</h2>
            <p className="mt-2 text-base font-semibold text-white/80">
              Just making sure you’re not a robot — happens once in a while.
            </p>
            <p className="mt-4 text-center font-display text-3xl font-extrabold text-gold">
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
                className="input text-center text-xl"
                placeholder="Answer"
              />
              <button type="submit" className="btn-win">GO</button>
            </form>
            {checkError && (
              <p className="animate-shake mt-2 text-sm font-bold text-red-300">
                Not quite — try again.
              </p>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* $1,000 win celebration + payout flow (PRD §14) */}
      {phase === "won" && state && !holdOverlays && (
        <WinOverlay prize={prize} gameSessionId={state.sessionId} meta={meta} />
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
      <p className="mx-auto mt-5 max-w-xs rounded-xl border-2 border-white/20 bg-white/[0.07] px-4 py-3 text-base font-bold text-white">
        That’s all {game.me?.dailyLimit ?? 500} plays for today! Come back tomorrow for a fresh
        set. 🌙
      </p>
    );
  }
  return (
    <button
      onClick={() => game.start()}
      className={`btn-win mt-5 ${big ? "!px-12 !py-4 !text-xl" : ""}`}
    >
      {label}
    </button>
  );
}

export function ErrorNote({ text }: { text: string }) {
  return (
    <p className="animate-shake mx-auto mt-4 max-w-sm rounded-xl border-2 border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200">
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
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
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
