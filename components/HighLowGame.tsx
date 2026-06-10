"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_META } from "@/lib/games/meta";
import type { Card } from "@/lib/games/types";
import { useGame } from "@/components/game/useGame";
import { GameShell } from "@/components/game/GameShell";
import { LossPanel } from "@/components/game/LossPanel";
import { CardFace, CardBack, cardLabel } from "@/components/game/PlayingCard";
import type { SponsorInfo } from "@/components/SponsorBanner";

const meta = GAME_META.highlow;
const FLIP_MS = 650;

interface FlipState {
  card: Card;
  outcome: "correct" | "wrong" | "equal";
}

export function HighLowGame({ sponsor }: { sponsor: SponsorInfo | null }) {
  const game = useGame("highlow");
  const { state, phase } = game;
  const [flip, setFlip] = useState<FlipState | null>(null);
  const [lastOutcome, setLastOutcome] = useState<FlipState | null>(null);
  const [settled, setSettled] = useState(true); // false while the flip animation runs
  const trayRef = useRef<HTMLDivElement>(null);

  const hl = state?.highlow;
  // While a flip is animating, the server state is already one card ahead —
  // show the previous card as "current" until the animation commits.
  const revealed = hl?.revealed ?? [];
  const shownRevealed = flip ? revealed.slice(0, -1) : revealed;
  const currentCard = shownRevealed[shownRevealed.length - 1] ?? null;

  const guess = async (dir: "higher" | "lower") => {
    if (!settled || phase !== "playing") return;
    setSettled(false);
    const res = await game.act("/api/games/highlow/guess", { guess: dir });
    if (!res) {
      setSettled(true);
      return;
    }
    const f: FlipState = {
      card: res.result.revealedCard as Card,
      outcome: res.result.outcome as FlipState["outcome"],
    };
    setLastOutcome(f);
    setFlip(f);
    window.setTimeout(() => {
      setFlip(null);
      setSettled(true);
    }, FLIP_MS + 250);
  };

  // Keep the history tray scrolled to the newest card.
  useEffect(() => {
    trayRef.current?.scrollTo({ left: trayRef.current.scrollWidth, behavior: "smooth" });
  }, [shownRevealed.length]);

  const cardsRevealed = hl?.cardsRevealed ?? 1;
  const lossReason =
    lastOutcome?.outcome === "equal"
      ? `Equal card (${cardLabel(lastOutcome.card)}). Game over.`
      : `Wrong guess${lastOutcome ? ` — it was ${cardLabel(lastOutcome.card)}` : ""}. Game over.`;

  return (
    <GameShell meta={meta} game={game} holdOverlays={!settled}>
      <div className="panel relative overflow-hidden p-5 sm:p-8">
        {/* felt table glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_50%_20%,rgba(16,84,60,0.35),transparent)]" />

        <div className="relative flex flex-col items-center">
          <div className="chip mb-5">
            <span className="font-bold text-gold">{cardsRevealed}</span>/52 cards revealed
          </div>

          {/* Table: deck (sponsor card back) + current card + flip overlay */}
          <div className="perspective-1200 flex items-center justify-center gap-5 sm:gap-10">
            <div className="relative">
              {/* deck stack */}
              <div className="absolute -left-1.5 top-1.5 opacity-60">
                <CardBack sponsorName={sponsor?.name} sponsorLogoUrl={sponsor?.logoUrl} />
              </div>
              <div className="absolute -left-0.5 top-0.5 opacity-80">
                <CardBack sponsorName={sponsor?.name} sponsorLogoUrl={sponsor?.logoUrl} />
              </div>
              <AnimatePresence mode="popLayout">
                {flip ? (
                  <motion.div
                    key={`flip-${cardsRevealed}-${flip.card.rank}-${flip.card.suit}`}
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: FLIP_MS / 1000, ease: [0.3, 1.2, 0.4, 1] }}
                    className="preserve-3d relative"
                  >
                    <div className="backface-hidden">
                      <CardFace
                        card={flip.card}
                        ring={flip.outcome === "correct" ? "gold" : "red"}
                      />
                    </div>
                    <div className="backface-hidden absolute inset-0" style={{ transform: "rotateY(180deg)" }}>
                      <CardBack sponsorName={sponsor?.name} sponsorLogoUrl={sponsor?.logoUrl} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="deck-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CardBack sponsorName={sponsor?.name} sponsorLogoUrl={sponsor?.logoUrl} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-2xl text-white/25">→</div>

            {/* Current card */}
            <div className="relative">
              {currentCard ? (
                <motion.div
                  key={cardLabel(currentCard)}
                  initial={{ scale: 0.92, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CardFace card={currentCard} ring={phase === "playing" && settled ? "gold" : null} />
                </motion.div>
              ) : (
                <div className="grid h-44 w-32 place-items-center rounded-2xl border border-dashed border-white/20 text-white/30 sm:h-52 sm:w-36">
                  ?
                </div>
              )}
              <div className="absolute -bottom-6 left-0 right-0 text-center text-[11px] uppercase tracking-wider text-white/40">
                Current card
              </div>
            </div>
          </div>

          {/* Guess buttons (PRD §8.3: two large buttons) */}
          <div className="mt-12 grid w-full max-w-md grid-cols-2 gap-3">
            <button
              onClick={() => guess("higher")}
              disabled={!settled || phase !== "playing"}
              className="btn-gold !py-4 !text-lg"
            >
              ▲ Higher
            </button>
            <button
              onClick={() => guess("lower")}
              disabled={!settled || phase !== "playing"}
              className="btn-ghost !py-4 !text-lg hover:!border-gold/50"
            >
              ▼ Lower
            </button>
          </div>
          <p className="mt-3 text-[11px] text-white/40">
            Ace is low (A=1 · K=13). An equal card loses automatically.
          </p>

          {/* Revealed-cards history tray (PRD §8.6) */}
          {shownRevealed.length > 0 && (
            <div className="mt-6 w-full">
              <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wider text-white/40">
                <span>Cards so far</span>
                <span>{shownRevealed.length} shown</span>
              </div>
              <div ref={trayRef} className="nice-scroll flex gap-2 overflow-x-auto pb-2">
                {shownRevealed.map((c, i) => (
                  <motion.div
                    key={`${i}-${c.rank}-${c.suit}`}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="shrink-0"
                  >
                    <CardFace
                      card={c}
                      size="sm"
                      dimmed={i < shownRevealed.length - 1}
                      ring={
                        phase === "lost" && i === shownRevealed.length - 1 && settled
                          ? "red"
                          : i === shownRevealed.length - 1
                          ? "gold"
                          : null
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {phase === "lost" && settled && (
        <LossPanel
          game={game}
          reason={lossReason}
          progressText={`You reached ${cardsRevealed} card${cardsRevealed === 1 ? "" : "s"}. A perfect win is 52.`}
        />
      )}
    </GameShell>
  );
}
