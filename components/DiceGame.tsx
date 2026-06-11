"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GAME_META } from "@/lib/games/meta";
import { DICE_SUMS, DICE_TOTAL_SUMS } from "@/lib/games/types";
import { useGame } from "@/components/game/useGame";
import { GameShell } from "@/components/game/GameShell";
import { LossPanel } from "@/components/game/LossPanel";
import { Die3D, DieSlot, DIE_ROLL_MS } from "@/components/game/Die";
import type { SponsorInfo } from "@/components/SponsorBanner";

const meta = GAME_META.dice;

interface TurnOutcome {
  sum: number;
  collected: boolean;
  sumsCollected: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DiceGame({ sponsor }: { sponsor: SponsorInfo | null }) {
  const game = useGame("dice");
  const { state, phase } = game;

  // Three dice slots for the current turn. null = not rolled yet.
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [rollKeys, setRollKeys] = useState<[number, number, number]>([0, 0, 0]);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<TurnOutcome | null>(null);
  const [lastLoss, setLastLoss] = useState<TurnOutcome | null>(null);
  const [preRollCollected, setPreRollCollected] = useState<number[]>([]);
  const [seenSession, setSeenSession] = useState<string | null>(null);

  // While dice are tumbling the server is already a roll ahead — keep showing
  // the pre-roll board until the animation settles (no spoilers).
  const serverCollected = state?.dice?.collected ?? [];
  const collected = busy ? preRollCollected : serverCollected;
  const count = collected.length;

  // New session (fresh game or resume after refresh, PRD §23.2): reset the
  // felt and restore any mid-turn dice the server remembers. Render-time
  // derived state, keyed by sessionId.
  if (state && state.sessionId !== seenSession) {
    setSeenSession(state.sessionId);
    const pending = state.dice?.pending ?? [];
    setSlots([pending[0] ?? null, pending[1] ?? null, pending[2] ?? null]);
    setOutcome(null);
  }

  const rolledCount = slots.filter((v) => v !== null).length;
  const partialSum = slots.reduce<number>((a, v) => a + (v ?? 0), 0);
  const turnInProgress = rolledCount > 0 && rolledCount < 3;

  // With one die left, the player can see exactly which totals to dodge.
  const dangers =
    turnInProgress && rolledCount === 2
      ? [1, 2, 3, 4, 5, 6].map((v) => partialSum + v).filter((s) => collected.includes(s))
      : [];

  const roll = async (mode: "one" | "all") => {
    if (busy || phase !== "playing") return;

    // Starting a fresh turn? Clear last turn's dice off the felt.
    let cur = slots;
    if (!cur.includes(null)) {
      cur = [null, null, null];
      setSlots(cur);
      setOutcome(null);
    }
    const empty = cur.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
    const filling = mode === "one" ? empty.slice(0, 1) : empty;

    setBusy(true);
    setPreRollCollected(serverCollected);
    const res = await game.act("/api/games/dice/roll", { mode });
    if (!res) {
      setBusy(false);
      return;
    }
    const rolled = res.result.rolled as number[];
    const next = [...cur];
    const keys = [...rollKeys] as [number, number, number];
    filling.forEach((slotIdx, j) => {
      next[slotIdx] = rolled[j];
      keys[slotIdx] = keys[slotIdx] + 1;
    });
    setSlots(next);
    setRollKeys(keys);

    // Let the cubes land (staggered) before the verdict hits the board.
    await sleep(DIE_ROLL_MS + (filling.length - 1) * 140 + 80);
    if (res.result.turnComplete) {
      const o: TurnOutcome = {
        sum: res.result.sum as number,
        collected: res.result.collected as boolean,
        sumsCollected: res.result.sumsCollected as number,
      };
      setOutcome(o);
      if (!o.collected) setLastLoss(o);
    }
    setBusy(false);
  };

  const diceLeft = slots.includes(null) ? 3 - rolledCount : 3;

  return (
    <GameShell meta={meta} game={game} holdOverlays={busy}>
      <div className="panel relative overflow-hidden p-5 sm:p-8">
        <div className="relative flex flex-col items-center">
          {/* Totals board: lock in every total from 3 to 18 */}
          <div className="grid w-full max-w-xl grid-cols-8 gap-1.5 sm:gap-2">
            {DICE_SUMS.map((s) => {
              const got = collected.includes(s);
              const justGot = !busy && outcome?.collected && outcome.sum === s;
              const fatal = !busy && outcome && !outcome.collected && outcome.sum === s;
              const danger = dangers.includes(s) && !busy;
              return (
                <motion.span
                  key={s}
                  animate={
                    justGot
                      ? { scale: [1, 1.4, 1] }
                      : fatal
                      ? { x: [0, -5, 5, -3, 3, 0] }
                      : danger
                      ? { scale: [1, 1.08, 1] }
                      : {}
                  }
                  transition={danger ? { repeat: Infinity, duration: 0.9 } : { duration: 0.5 }}
                  className={`grid h-10 place-items-center rounded-lg font-display text-base font-extrabold sm:h-12 sm:text-lg ${
                    fatal
                      ? "border-2 border-danger bg-danger/25 text-red-200"
                      : danger
                      ? "bg-gold text-black ring-2 ring-danger shadow-[0_0_16px_rgba(255,77,109,0.6)]"
                      : got
                      ? "bg-gold text-black shadow-[0_0_14px_rgba(255,210,63,0.45)]"
                      : "border-2 border-white/20 bg-white/[0.05] text-white/70"
                  }`}
                >
                  {s}
                </motion.span>
              );
            })}
          </div>
          <p className="mt-2.5 text-base font-bold text-white/90">
            {phase === "lost" ? (
              `You locked in ${count} / ${DICE_TOTAL_SUMS} totals.`
            ) : turnInProgress ? (
              dangers.length > 0 ? (
                <>
                  Sitting at <span className="text-gold">{partialSum}</span> — dodge{" "}
                  <span className="text-danger">{dangers.join(", ")}</span>!
                </>
              ) : rolledCount === 2 ? (
                <>
                  Sitting at <span className="text-gold">{partialSum}</span> — every roll is
                  safe. Send it! 🚀
                </>
              ) : (
                <>
                  Sitting at <span className="text-gold">{partialSum}</span> with {3 - rolledCount}{" "}
                  dice to go.
                </>
              )
            ) : count === 0 ? (
              "Roll your first total to start the sweep!"
            ) : (
              <>
                <span className="text-gold">{count} / {DICE_TOTAL_SUMS}</span> locked in ·{" "}
                {DICE_TOTAL_SUMS - count} to go
              </>
            )}
          </p>

          {/* The felt: sponsor-branded table (PRD §7.2) */}
          <div
            className={`relative mt-5 w-full max-w-xl overflow-hidden rounded-[2rem] border-4 transition-shadow duration-500 ${
              outcome?.collected && !busy
                ? "border-win/80 shadow-[0_0_44px_rgba(0,230,92,0.4)]"
                : "border-[#0a2b20] shadow-2xl"
            }`}
            style={{
              background:
                "radial-gradient(420px 200px at 50% 25%, rgba(255,255,255,0.10), transparent 70%), radial-gradient(ellipse at center, #14543c 0%, #0c3a29 60%, #07271b 100%)",
            }}
          >
            {/* sponsor watermark on the felt */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              {sponsor?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sponsor.logoUrl} alt="" className="max-h-24 opacity-20" />
              ) : (
                <span className="select-none font-display text-2xl font-extrabold uppercase tracking-[0.3em] text-white/15 sm:text-3xl">
                  {sponsor?.name ?? "1K ARCADE"}
                </span>
              )}
            </div>

            <div className="relative flex h-52 items-center justify-center gap-6 sm:h-60 sm:gap-10">
              {slots.map((v, i) =>
                v === null ? (
                  <DieSlot key={`slot-${i}`} />
                ) : (
                  <Die3D
                    key={`die-${i}`}
                    value={v}
                    rollKey={rollKeys[i]}
                    delay={i * 0.14}
                    glow={!!outcome?.collected && !busy}
                  />
                )
              )}
            </div>

            {/* Turn verdict */}
            <div className="relative pb-4 text-center">
              {outcome && !busy ? (
                <motion.p
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`font-display text-2xl font-extrabold ${
                    outcome.collected ? "text-win" : "text-red-300"
                  }`}
                >
                  {slots.join(" + ")} = {outcome.sum}{" "}
                  {outcome.collected
                    ? outcome.sumsCollected >= DICE_TOTAL_SUMS
                      ? "— FULL SWEEP! 🏆"
                      : "— LOCKED IN! 🔒"
                    : "— already locked. 💥"}
                </motion.p>
              ) : (
                <p className="text-base font-bold text-white/60">
                  {busy ? "Dice are flying…" : turnInProgress ? "Keep it going…" : "Your table. Your roll."}
                </p>
              )}
            </div>
          </div>

          {/* Roll your way: all at once, or one at a time (PRD §9) */}
          <div className="mt-5 grid w-full max-w-xl grid-cols-2 gap-3">
            <button
              onClick={() => roll("all")}
              disabled={busy || phase !== "playing"}
              className="btn-win !py-4 !text-lg"
            >
              ⚡ ROLL {turnInProgress ? `THE REST (${diceLeft})` : "ALL 3"}
            </button>
            <button
              onClick={() => roll("one")}
              disabled={busy || phase !== "playing"}
              className="btn-gold !py-4 !text-lg"
            >
              🎯 ROLL ONE{turnInProgress ? ` (${rolledCount}/3)` : " AT A TIME"}
            </button>
          </div>
          <p className="mt-2 text-sm font-bold text-white/65">
            Feeling bold? Send all three. Want the sweat? Roll them one by one.
          </p>
        </div>
      </div>

      {phase === "lost" && !busy && (
        <LossPanel
          game={game}
          sponsor={sponsor}
          reason={
            lastLoss
              ? `Rolled ${lastLoss.sum} — that total was already locked.`
              : "Repeated total."
          }
          progressText={`You locked in ${count} of ${DICE_TOTAL_SUMS} totals. Run it back!`}
        />
      )}
    </GameShell>
  );
}
