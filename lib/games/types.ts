// Shared game types.
//
// SECURITY MODEL: every game attempt is a GameSession row. Server-authoritative
// game state (shuffled deck order, collected dice sums) lives ONLY in the
// row's `secretState` column. API responses are built exclusively from the
// Public* types below, which contain nothing about future outcomes. Dice
// rolls are generated server-side at the moment of the roll, so they never
// exist ahead of time at all.

export type GameType = "highlow" | "dice";

export const GAME_TYPES: readonly GameType[] = ["highlow", "dice"] as const;

export function isGameType(v: string): v is GameType {
  return (GAME_TYPES as readonly string[]).includes(v);
}

// ── High Low ────────────────────────────────────────────────────────────────

/** rank: 1 (Ace, low) … 13 (King). suit: 0♠ 1♥ 2♦ 3♣ */
export interface Card {
  rank: number;
  suit: number;
}

export interface HighLowSecret {
  deck: Card[]; // full shuffled 52 — server only
}

export interface PublicHighLowState {
  /** Cards revealed so far, oldest first. Only PAST cards — never future ones. */
  revealed: Card[];
  cardsRevealed: number; // == progress; 52 = win
  totalCards: 52;
}

// ── Dice Sweep ──────────────────────────────────────────────────────────────
// Three dice. Collect every sum from 3 to 18 in ANY order; rolling a sum you
// already collected ends the game. All 16 sums = win.

export const DICE_MIN_SUM = 3;
export const DICE_MAX_SUM = 18;
export const DICE_TOTAL_SUMS = DICE_MAX_SUM - DICE_MIN_SUM + 1; // 16

/** All sums in display order: 3, 4, … 18. */
export const DICE_SUMS: readonly number[] = Array.from(
  { length: DICE_TOTAL_SUMS },
  (_, i) => DICE_MIN_SUM + i
);

export interface DiceSecret {
  /** Sums collected so far. Server-authoritative; each roll is generated at
   *  roll time, never ahead. */
  collected: number[];
}

export interface PublicDiceState {
  collected: number[]; // sums already rolled (the player's own history)
  sumsCollected: number; // == progress; 16 = win
  totalSums: number;
  lastRoll: { d1: number; d2: number; d3: number; sum: number } | null;
}

// ── Shared envelope ─────────────────────────────────────────────────────────

export type GameStatus = "active" | "won" | "lost";

export interface PublicSessionState {
  sessionId: string;
  gameType: GameType;
  status: GameStatus;
  progress: number;
  playsUsedToday: number;
  playsRemaining: number;
  jackpot: number;
  highlow?: PublicHighLowState;
  dice?: PublicDiceState;
}

/** One entry in the per-session action log (used for replay + fraud review). */
export interface HistoryEntry {
  t: string; // event type
  at: number; // epoch ms
  [key: string]: unknown;
}
