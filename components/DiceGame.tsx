"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GAME_META } from "@/lib/games/meta";
import { DICE_TARGETS } from "@/lib/games/types";
import { useGame } from "@/components/game/useGame";
import { GameShell } from "@/components/game/GameShell";
import { LossPanel } from "@/components/game/LossPanel";
import { Die } from "@/components/game/Die";
import type { SponsorInfo } from "@/components/SponsorBanner";

const meta = GAME_META.dice;
const ROLL_MS = 950;

interface RollOutcome {
  d1: number;
  d2: number;
  sum: number;
  target: number;
  correct: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DiceGame({ sponsor }: { sponsor: SponsorInfo | null }) {
  const game = useGame("dice");
  const { state, phase } = game;
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<[number, number]>([4, 4]);
  const [outcome, setOutcome] = useState<RollOutcome | null>(null);
  const [tilt] = useState(() => [Math.random() * 14 - 7, Math.random() * 14 - 7]);
  const [lastLoss, setLastLoss] = useState<RollOutcome | null>(null);
  const [preRollSteps, setPreRollSteps] = useState(0);

  // While the dice are tumbling the server state is already one step ahead —
  // keep showing the pre-roll staircase until the animation settles.
  const serverSteps = state?.dice?.stepsCompleted ?? 0;
  const steps = rolling ? preRollSteps : serverSteps;

  // Tumble: cycle random faces while the roll animation plays.
  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => {
      setDice([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);
    }, 90);
    return () => clearInterval(id);
  }, [rolling]);

  const roll = async () => {
    if (rolling || phase !== "playing") return;
    setPreRollSteps(serverSteps);
    setRolling(true);
    setOutcome(null);
    // Server decides the roll instantly; the animation plays for ROLL_MS so
    // the result lands with the dice.
    const [res] = await Promise.all([game.act("/api/games/dice/roll", {}), sleep(ROLL_MS)]);
    if (res) {
      const r = res.result as unknown as RollOutcome;
      setDice([r.d1, r.d2]);
      setOutcome(r);
      if (!r.correct) setLastLoss(r);
    }
    setRolling(false);
  };

  const glow = !!outcome?.correct && !rolling;

  return (
    <GameShell meta={meta} game={game} holdOverlays={rolling}>
      <div className="panel relative overflow-hidden p-5 sm:p-8">
        <div className="relative flex flex-col items-center">
          {/* Staircase progress (PRD §9.3: target, completed, remaining) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DICE_TARGETS.map((t, i) => {
              const done = i < steps;
              const current = i === steps && phase !== "lost";
              return (
                <div key={t} className="flex items-center gap-2">
                  <motion.span
                    animate={done && glow && i === steps - 1 ? { scale: [1, 1.3, 1] } : {}}
                    className={`grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-bold transition-all sm:h-12 sm:w-12 ${
                      done
                        ? "bg-gold text-black shadow-[0_0_18px_rgba(246,197,68,0.5)]"
                        : current
                        ? "border-2 border-gold bg-gold/10 text-gold animate-glow-pulse"
                        : "border border-white/15 bg-white/[0.04] text-white/40"
                    }`}
                  >
                    {t}
                  </motion.span>
                  {i < DICE_TARGETS.length - 1 && <span className="text-white/25">→</span>}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-white/45">
            {phase === "lost"
              ? `You completed ${steps} / 7 steps.`
              : steps === 0
              ? "First target: roll a sum of 8."
              : `Next target: roll a sum of ${DICE_TARGETS[steps] ?? "—"} · ${steps} / 7 done`}
          </p>

          {/* Velvet mat with sponsor branding (PRD §7.2, §9.3) */}
          <div
            className={`relative mt-6 w-full max-w-xl overflow-hidden rounded-[2rem] border-4 transition-shadow duration-500 ${
              glow ? "border-gold/70 shadow-[0_0_44px_rgba(246,197,68,0.35)]" : "border-[#3a2c12]/80 shadow-2xl"
            }`}
            style={{
              background:
                "radial-gradient(420px 200px at 50% 30%, rgba(255,255,255,0.08), transparent 70%), radial-gradient(ellipse at center, #3b1227 0%, #25081a 60%, #1a0512 100%)",
            }}
          >
            {/* sponsor watermark on the mat */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              {sponsor?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sponsor.logoUrl} alt="" className="max-h-20 opacity-15" />
              ) : (
                <span className="select-none font-display text-2xl font-extrabold uppercase tracking-[0.3em] text-white/[0.08] sm:text-3xl">
                  {sponsor?.name ?? "Jackpot Arcade"}
                </span>
              )}
            </div>

            <div className="relative flex h-56 items-center justify-center gap-8 sm:h-64">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={
                    rolling
                      ? {
                          x: [i ? 90 : -90, i ? -25 : 25, 0],
                          y: [-70, 25, 0],
                          rotate: [0, i ? -420 : 420, i ? 360 + tilt[i] : 360 + tilt[i]],
                        }
                      : { rotate: tilt[i] }
                  }
                  transition={
                    rolling
                      ? { duration: ROLL_MS / 1000, ease: [0.2, 0.8, 0.3, 1] }
                      : { type: "spring", stiffness: 220, damping: 18 }
                  }
                >
                  <Die value={dice[i]} glow={glow} />
                </motion.div>
              ))}
            </div>

            {/* Last roll readout */}
            <div className="relative pb-4 text-center">
              {outcome && !rolling ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`font-display text-lg font-bold ${
                    outcome.correct ? "text-gold" : "text-red-300"
                  }`}
                >
                  {outcome.d1} + {outcome.d2} = {outcome.sum}{" "}
                  {outcome.correct
                    ? steps >= 7
                      ? "— staircase complete! 🏆"
                      : `— correct! Next target: ${DICE_TARGETS[steps]}`
                    : `— needed ${outcome.target}. Game over.`}
                </motion.p>
              ) : (
                <p className="text-sm text-white/35">{rolling ? "Rolling…" : "Ready when you are."}</p>
              )}
            </div>
          </div>

          <button
            onClick={roll}
            disabled={rolling || phase !== "playing"}
            className="btn-gold mt-6 w-full max-w-xs !py-4 !text-lg"
          >
            {rolling ? "Rolling…" : `🎲 Roll for ${DICE_TARGETS[steps] ?? 2}`}
          </button>
        </div>
      </div>

      {phase === "lost" && !rolling && (
        <LossPanel
          game={game}
          reason={
            lastLoss
              ? `Needed ${lastLoss.target}, rolled ${lastLoss.sum}. Game over.`
              : "Wrong sum. Game over."
          }
          progressText={`You completed ${steps} / 7 steps. A perfect win is 7 / 7.`}
        />
      )}
    </GameShell>
  );
}
