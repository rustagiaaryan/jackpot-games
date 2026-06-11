import type { GameType } from "@/lib/games/types";

// Client-safe display metadata for the games (no server imports).
//
// COPY RULES (PRD): never say "jackpot" — every winner gets the $1,000 prize,
// no strings attached. Never describe the games as hard, impossible, or
// unlikely — keep every word inviting and winnable.

export interface GameMeta {
  type: GameType;
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  /** Positive vibe chip shown on game cards. */
  vibe: string;
  description: string;
  /** Bold numbered rules shown bulletin-board style before play. */
  rules: string[];
  /** Format a progress value for leaderboards / profiles, e.g. "23 cards". */
  bestLabel: (n: number) => string;
  winnerLabel: string;
  maxProgress: number;
}

export const GAME_META: Record<GameType, GameMeta> = {
  highlow: {
    type: "highlow",
    slug: "high-low",
    name: "High Low",
    emoji: "🃏",
    tagline: "Call it higher or lower. Ride the deck.",
    vibe: "Trust your gut",
    description:
      "One card is face up. Call the next one higher or lower and keep the streak rolling. Make it through the deck and the $1,000 is yours.",
    rules: [
      "One card starts face up.",
      "Call the next card HIGHER or LOWER.",
      "Ace is the lowest. King is the highest.",
      "A wrong call — or an equal card — ends the run.",
      "Clear all 52 cards and you win $1,000. Instantly.",
    ],
    bestLabel: (n) => `${n} card${n === 1 ? "" : "s"}`,
    winnerLabel: "WINNER — 52 cards completed",
    maxProgress: 52,
  },
  dice: {
    type: "dice",
    slug: "dice-sweep",
    name: "Dice Sweep",
    emoji: "🎲",
    tagline: "Sweep every total from 3 to 18. Your roll, your way.",
    vibe: "Ride the streak",
    description:
      "Roll three dice and light up every total from 3 to 18, in any order. Roll all three at once or one at a time — sweep the board and win $1,000.",
    rules: [
      "Each turn you roll three dice — all at once, or one at a time for the slow reveal.",
      "Every total from 3 to 18 is on your board.",
      "Roll a NEW total → it locks in gold. Keep rolling.",
      "Roll a total you already locked → the run ends.",
      "Light up all 16 totals and you win $1,000. Instantly.",
    ],
    bestLabel: (n) => `${n} / 16 totals`,
    winnerLabel: "WINNER — swept all 16 totals",
    maxProgress: 16,
  },
};

export const GAME_LIST: GameMeta[] = [GAME_META.highlow, GAME_META.dice];

export function metaBySlug(slug: string): GameMeta | undefined {
  return GAME_LIST.find((g) => g.slug === slug);
}
