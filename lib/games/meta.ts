import type { GameType } from "@/lib/games/types";

// Client-safe display metadata for the three games (no server imports).

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
    slug: "dice-staircase",
    name: "Dice Staircase",
    emoji: "🎲",
    tagline: "Roll 8 → 7 → 6 → 5 → 4 → 3 → 2. In order.",
    difficulty: "Brutally unlikely",
    description:
      "Roll two dice and hit the exact sums 8, 7, 6, 5, 4, 3, 2 — in order. One wrong sum and the staircase collapses.",
    instructions:
      "Roll two dice and hit the sums in order: 8, 7, 6, 5, 4, 3, 2. If you roll the wrong sum, the game ends. Complete the full staircase to win the jackpot.",
    bestLabel: (n) => `${n} / 7 steps`,
    winnerLabel: "WINNER — completed 8 → 2 staircase",
    maxProgress: 7,
  },
  doors: {
    type: "doors",
    slug: "doors",
    name: "Doors Challenge",
    emoji: "🚪",
    tagline: "Eight rooms. One safe path. Don’t fall.",
    difficulty: "Astronomically rare",
    description:
      "Each room hides one correct door among 1, 2, 4, 8, 16, 32, 64… then a final 2. Pick wrong and you fall into the abyss.",
    instructions:
      "Pick the correct door to move to the next room. The number of doors increases each level until Level 7, then the final level has 2 doors. Choose wrong and you fall into the abyss. Complete all 8 levels to win the jackpot.",
    bestLabel: (n) => (n === 0 ? "Level 1" : `Cleared Level ${n}`),
    winnerLabel: "WINNER — cleared Level 8",
    maxProgress: 8,
  },
};

export const GAME_LIST: GameMeta[] = [GAME_META.highlow, GAME_META.dice, GAME_META.doors];

export function metaBySlug(slug: string): GameMeta | undefined {
  return GAME_LIST.find((g) => g.slug === slug);
}
