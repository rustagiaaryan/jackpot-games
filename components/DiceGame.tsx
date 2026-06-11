"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GAME_META } from "@/lib/games/meta";
import { DICE_SUMS, DICE_TOTAL_SUMS } from "@/lib/games/types";
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
  d3: number;
  sum: number;
  collected: boolean; // false = repeated sum = loss
  sumsCollected: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DiceGame({ sponsor }: { sponsor: SponsorInfo | null }) {
  const game = useGame("dice");
  const { state, phase } = game;
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<[number, number, number]>([3, 5, 2]);
  const [outcome, setOutcome] = useState<RollOutcome | null>(null);
  const [tilt] = useState(() => [0, 1, 2].map(() => Math.random() * 14 - 7));
  const [lastLoss, setLastLoss] = useState<RollOutcome | null>(null);
  const [preRollCollected, setPreRollCollected] = useState<number[]>([]);

  // While the dice are tumbling the server state is already one roll ahead —
  // keep showing the pre-roll board until the animation settles.
  const serverCollected = state?.dice?.collected ?? [];
  const collected = rolling ? preRollCollected : serverCollected;
  const count = collected.length;

  // Tumble: cycle random faces while the roll animation plays.
  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => {
      setDice([
        1 + Math.floor(Math.random() * 6),
        1 + Math.floor(Math.random() * 6),
        1 + Math.floor(Math.random() * 6),
      ]);
    }, 90);
    return () => clearInterval(id);
  }, [rolling]);

  const roll = async () => {
    if (rolling || phase !== "playing") return;
    setPreRollCollected(serverCollected);
    setRolling(true);
    setOutcome(null);
    // Server decides the roll instantly; the animation plays for ROLL_MS so
    // the result lands with the dice.
    const [res] = await Promise.all([game.act("/api/games/dice/roll", {}), sleep(ROLL_MS)]);
    if (res) {
      const r = res.result as unknown as RollOutcome;
      setDice([r.d1, r.d2, r.d3]);
      setOutcome(r);
      if (!r.collected) setLastLoss(r);
    }
    setRolling(false);
  };

  const glow = !!outcome?.collected && !rolling;

  return (
    <GameShell meta={meta} game={game} holdOverlays={rolling}>
      <div className="panel relative overflow-hidden p-5 sm:p-8">
        <div className="relative flex flex-col items-center">
          {/* Sum board (PRD-style progress: collected vs. remaining sums) */}
          <div className="grid w-full max-w-xl grid-cols-8 gap-1.5 sm:gap-2">
            {DICE_SUMS.map((s) => {
              const got = collected.includes(s);
              const justGot = !rolling && outcome?.collected && outcome.sum === s;
              const fatal = !rolling && outcome && !outcome.collected && outcome.sum === s;
              return (
                <motion.span
                  key={s}
                  animate={
                    justGot
                      ? { scale: [1, 1.35, 1] }
                      : fatal
                      ? { x: [0, -5, 5, -3, 3, 0] }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  className={`grid h-9 place-items-center rounded-lg font-display text-sm font-bold sm:h-11 sm:text-base ${
                    fatal
                      ? "border-2 border-red-500 bg-red-500/20 text-red-300"
                      : got
                      ? "bg-gold text-black shadow-[0_0_14px_rgba(246,197,68,0.45)]"
                      : "border border-white/15 bg-white/[0.04] text-white/40"
                  }`}
                >
                  {s}
                </motion.span>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-white/45">
            {phase === "lost"
              ? `You collected ${count} / ${DICE_TOTAL_SUMS} sums.`
              : count === 0
              ? "Any sum starts your sweep — every later repeat ends it."
              : `${count} / ${DICE_TOTAL_SUMS} sums collected · ${DICE_TOTAL_SUMS - count} to go — avoid the gold ones!`}
          </p>

          {/* Velvet mat with sponsor branding (PRD §7.2) */}
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

            <div className="relative flex h-56 items-center justify-center gap-4 sm:h-64 sm:gap-7">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={
                    rolling
                      ? {
                          x: [(i - 1) * -110, (i - 1) * 30, 0],
                          y: [-70, 25, 0],
                          rotate: [0, i % 2 ? -420 : 420, (i % 2 ? 360 : -360) + tilt[i]],
                        }
                      : { rotate: tilt[i] }
                  }
                  transition={
                    rolling
                      ? { duration: ROLL_MS / 1000, ease: [0.2, 0.8, 0.3, 1], delay: i * 0.04 }
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
                    outcome.collected ? "text-gold" : "text-red-300"
                  }`}
                >
                  {outcome.d1} + {outcome.d2} + {outcome.d3} = {outcome.sum}{" "}
                  {outcome.collected
                    ? outcome.sumsCollected >= DICE_TOTAL_SUMS
                      ? "— full sweep! 🏆"
                      : "— new sum, collected!"
                    : `— already collected. Game over.`}
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
            {rolling ? "Rolling…" : "🎲 Roll three dice"}
          </button>
        </div>
      </div>

      {phase === "lost" && !rolling && (
        <LossPanel
          game={game}
          reason={
            lastLoss
              ? `Rolled ${lastLoss.sum} again — already collected. Game over.`
              : "Repeated sum. Game over."
          }
          progressText={`You collected ${count} / ${DICE_TOTAL_SUMS} sums. A perfect win sweeps all ${DICE_TOTAL_SUMS}.`}
        />
      )}
    </GameShell>
  );
}
