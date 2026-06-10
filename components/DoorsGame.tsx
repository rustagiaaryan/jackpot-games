"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_META } from "@/lib/games/meta";
import { DOOR_COUNTS } from "@/lib/games/types";
import { useGame } from "@/components/game/useGame";
import { GameShell } from "@/components/game/GameShell";
import { LossPanel } from "@/components/game/LossPanel";
import type { SponsorInfo } from "@/components/SponsorBanner";

const meta = GAME_META.doors;

interface PickOutcome {
  correct: boolean;
  correctDoor: number;
  won: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Door size shrinks as rooms get more crowded.
function doorSize(count: number): string {
  if (count <= 2) return "h-44 w-28";
  if (count <= 4) return "h-36 w-24";
  if (count <= 8) return "h-32 w-20";
  if (count <= 16) return "h-24 w-16";
  if (count <= 32) return "h-20 w-12";
  return "h-16 w-10";
}

export function DoorsGame({ sponsor }: { sponsor: SponsorInfo | null }) {
  const game = useGame("doors");
  const { state, phase } = game;

  const [view, setView] = useState({ level: 1, doorCount: 1 });
  const [picking, setPicking] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<PickOutcome | null>(null);
  const [falling, setFalling] = useState(false);
  const [lastLossLevel, setLastLossLevel] = useState(1);

  const animating = picking !== null || falling;
  const serverDoors = state?.doors;

  // Sync the displayed room with the server only between animations, so the
  // next room (or the loss) never flashes in before its transition plays.
  useEffect(() => {
    if (!animating && serverDoors) {
      setView({ level: serverDoors.level, doorCount: serverDoors.doorCount });
    }
  }, [animating, serverDoors, serverDoors?.level, serverDoors?.doorCount]);

  const pick = async (i: number) => {
    if (animating || phase !== "playing") return;
    setPicking(i);
    // Door swings open while the server decides (outcome generated at level
    // entry, server-side only — the client learns it just now).
    const [res] = await Promise.all([
      game.act("/api/games/doors/pick", { doorIndex: i }),
      sleep(550),
    ]);
    if (!res) {
      setPicking(null);
      return;
    }
    const r = res.result as unknown as PickOutcome;
    setOutcome(r);
    if (r.correct) {
      await sleep(650); // bask in the doorway light
      setOutcome(null);
      setPicking(null); // effect advances the room → zoom transition
    } else {
      setLastLossLevel(view.level);
      await sleep(700); // abyss revealed behind the door + correct-door glow
      setFalling(true);
      await sleep(1500);
      setOutcome(null);
      setPicking(null);
      setFalling(false); // loss panel appears
    }
  };

  const levelsCleared = serverDoors?.levelsCleared ?? 0;

  return (
    <GameShell meta={meta} game={game} holdOverlays={animating}>
      <div className="panel relative overflow-hidden p-5 sm:p-8">
        {/* Level progression strip */}
        <div className="relative flex flex-wrap items-center justify-center gap-1.5">
          {DOOR_COUNTS.map((c, i) => {
            const lvl = i + 1;
            const done = lvl < view.level || phase === "won";
            const current = lvl === view.level && phase !== "won";
            return (
              <span
                key={lvl}
                title={`Level ${lvl}: ${c} door${c > 1 ? "s" : ""}`}
                className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 font-display text-xs font-bold ${
                  done
                    ? "bg-gold text-black"
                    : current
                    ? "border-2 border-gold bg-gold/10 text-gold animate-glow-pulse"
                    : "border border-white/15 text-white/35"
                }`}
              >
                {c}
              </span>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-white/45">
          Level <span className="font-bold text-gold">{view.level}</span> of 8 ·{" "}
          {view.doorCount} door{view.doorCount > 1 ? "s" : ""} · one is safe
        </p>

        {/* The room */}
        <div
          className="perspective-1200 relative mt-5 overflow-hidden rounded-2xl border border-white/10"
          style={{
            background:
              "linear-gradient(180deg, #171225 0%, #1d1830 55%, #0e0a18 56%, #1a1428 100%)",
          }}
        >
          {/* floor sheen */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[45%] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(246,197,68,0.07),transparent)]" />

          {/* Sponsor banner hanging in the room (PRD §7.2) */}
          <div className="relative mx-auto mt-4 w-fit rounded-lg border border-gold/25 bg-black/40 px-4 py-1 text-center shadow-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              This room is brought to you by
            </span>
            <div className="flex items-center justify-center gap-1.5 font-display text-xs font-bold text-gold">
              {sponsor?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sponsor.logoUrl} alt="" className="h-3.5 w-auto" />
              ) : (
                <span aria-hidden>✦</span>
              )}
              {sponsor?.name ?? "Jackpot Arcade"}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view.level}
              initial={{ scale: 0.62, opacity: 0, filter: "brightness(2)" }}
              animate={{ scale: 1, opacity: 1, filter: "brightness(1)" }}
              exit={{ scale: 1.6, opacity: 0, filter: "brightness(2.2)" }}
              transition={{ duration: 0.55, ease: [0.3, 0.9, 0.3, 1] }}
              className="nice-scroll max-h-[420px] overflow-y-auto px-4 py-8"
            >
              <div className="flex flex-wrap items-end justify-center gap-2.5 sm:gap-3">
                {Array.from({ length: view.doorCount }, (_, i) => (
                  <Door
                    key={`${view.level}-${i}`}
                    index={i}
                    size={doorSize(view.doorCount)}
                    open={picking === i}
                    outcome={picking === i ? outcome : null}
                    revealCorrect={!!outcome && !outcome.correct && outcome.correctDoor === i}
                    disabled={animating || phase !== "playing"}
                    onPick={() => pick(i)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {view.level === 1 && phase === "playing" && (
          <p className="mt-3 text-center text-xs text-white/40">
            Level 1 has a single door — it’s safe. Step in to begin. 🚪
          </p>
        )}
      </div>

      {/* The fall into the abyss (PRD §10.5: dramatic but fun) */}
      <AnimatePresence>
        {falling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden bg-black"
          >
            <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(91,33,182,0.3),black)]" />
            <motion.div
              initial={{ y: "-15vh", scale: 1.6, rotate: 0 }}
              animate={{ y: "75vh", scale: 0.18, rotate: 540 }}
              transition={{ duration: 1.35, ease: "easeIn" }}
              className="absolute left-1/2 -translate-x-1/2 text-7xl"
            >
              😱
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="absolute bottom-16 left-0 right-0 text-center font-display text-xl font-bold text-white/80"
            >
              Wrong door… into the abyss! 🕳️
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "lost" && !animating && (
        <LossPanel
          game={game}
          reason={`Wrong door on Level ${lastLossLevel}.`}
          progressText={`You reached Level ${lastLossLevel}${
            levelsCleared > 0 ? ` and cleared ${levelsCleared}` : ""
          }. A perfect win clears Level 8.`}
        />
      )}
    </GameShell>
  );
}

function Door({
  index,
  size,
  open,
  outcome,
  revealCorrect,
  disabled,
  onPick,
}: {
  index: number;
  size: string;
  open: boolean;
  outcome: PickOutcome | null;
  revealCorrect: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <motion.button
      onClick={onPick}
      disabled={disabled && !open}
      whileHover={!disabled ? { y: -5 } : undefined}
      className={`perspective-800 relative shrink-0 cursor-pointer disabled:cursor-default ${size}`}
      aria-label={`Door ${index + 1}`}
    >
      {/* doorway behind the door: unknown → light (safe) or abyss (fall) */}
      <div
        className={`absolute inset-0 rounded-t-[40%_12%] rounded-b-sm transition-colors duration-300 ${
          open && outcome
            ? outcome.correct
              ? "bg-gradient-to-b from-amber-100 via-gold to-amber-500 shadow-[0_0_40px_rgba(246,197,68,0.8)]"
              : "bg-[radial-gradient(ellipse_at_center,#1e1033_0%,#000_75%)]"
            : "bg-black/80"
        }`}
      >
        {open && outcome && !outcome.correct && (
          <span className="absolute inset-0 grid place-items-center text-xs opacity-70">🕳️</span>
        )}
      </div>

      {/* the door itself */}
      <motion.div
        animate={open ? { rotateY: -84 } : { rotateY: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: "left center" }}
        className={`preserve-3d absolute inset-0 rounded-t-[40%_12%] rounded-b-sm border shadow-xl ${
          revealCorrect
            ? "border-gold bg-gradient-to-b from-amber-500 to-amber-800 animate-glow-pulse"
            : "border-amber-950/80 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 hover:from-amber-600"
        }`}
      >
        {/* panels + knob */}
        <div className="absolute inset-[12%] rounded-[inherit] border border-amber-950/50" />
        <div className="absolute right-[14%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_6px_rgba(246,197,68,0.9)]" />
      </motion.div>

      {revealCorrect && (
        <span className="absolute -top-5 left-0 right-0 text-center text-[9px] font-bold uppercase tracking-wide text-gold">
          it was this one
        </span>
      )}
    </motion.button>
  );
}
