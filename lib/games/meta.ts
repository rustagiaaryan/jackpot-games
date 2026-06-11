import type { GameType } from "@/lib/games/types";

// Client-safe display metadata for the games (no server imports).

export interface GameMeta {
  type: GameType;
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  difficulty: string;
  description: string;
  instructions: string;
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
    tagline: "Call higher or lower through all 52 cards.",
    difficulty: "Nearly impossible",
    description:
      "One card starts face up. Guess if the next is higher or lower — Ace is low, equal cards lose. Survive the entire deck to win the jackpot.",
    instructions:
      "A shuffled 52-card deck is used and the first card starts face up. For each next card, guess whether it will be HIGHER or LOWER than the current card. Ace is low (A=1, K=13). A wrong guess ends the game — and an equal card loses automatically. Reveal all 52 cards to win the jackpot.",
    bestLabel: (n) => `${n} card${n === 1 ? "" : "s"}`,
    winnerLabel: "WINNER — 52 cards completed",
    maxProgress: 52,
  },
  dice: {
    type: "dice",
    slug: "dice-sweep",
    name: "Dice Sweep",
    emoji: "🎲",
    tagline: "Three dice. Sweep every sum from 3 to 18. Never repeat.",
    difficulty: "Brutally unlikely",
    description:
      "Roll three dice and collect every sum from 3 to 18 — in any order. The moment you repeat a sum you've already collected, it's over.",
    instructions:
      "Roll three dice and collect every sum from 3 to 18, in any order. Each new sum lights up on the board. If you roll a sum you've already collected, the game ends. Sweep all 16 sums to win the jackpot.",
    bestLabel: (n) => `${n} / 16 sums`,
    winnerLabel: "WINNER — swept all 16 sums",
    maxProgress: 16,
  },
};

export const GAME_LIST: GameMeta[] = [GAME_META.highlow, GAME_META.dice];

export function metaBySlug(slug: string): GameMeta | undefined {
  return GAME_LIST.find((g) => g.slug === slug);
}
