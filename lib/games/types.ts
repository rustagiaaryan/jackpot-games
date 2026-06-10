// Shared game types.
//
// SECURITY MODEL: every game attempt is a GameSession row. The hidden outcomes
// (shuffled deck order, correct door indexes) live ONLY in the row's
// `secretState` column. API responses are built exclusively from the Public*
// types below, which contain nothing about future outcomes. Dice rolls are
// generated server-side at the moment of the roll, so they never exist ahead
// of time at all.

export type GameType = "highlow" | "dice" | "doors";

export const GAME_TYPES: readonly GameType[] = ["highlow", "dice", "doors"] as const;

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

// ── Dice Staircase ──────────────────────────────────────────────────────────

export const DICE_TARGETS = [8, 7, 6, 5, 4, 3, 2] as const;

export interface DiceSecret {
  // Intentionally empty: each roll is generated at roll time, never ahead.
  _: null;
}

export interface PublicDiceState {
  targets: readonly number[];
  stepsCompleted: number; // == progress; 7 = win
  lastRoll: { d1: number; d2: number; sum: number } | null;
}

// ── Doors Challenge ─────────────────────────────────────────────────────────

export const DOOR_COUNTS = [1, 2, 4, 8, 16, 32, 64, 2] as const;
export const TOTAL_LEVELS = DOOR_COUNTS.length; // 8

export interface DoorsSecret {
  /** answers[i] = correct door for level i+1. Generated lazily per level entry. */
  answers: number[];
}

export interface PublicDoorsState {
  level: number; // current level, 1-based
  doorCount: number;
  levelsCleared: number; // == progress; 8 = win
  doorCounts: readonly number[];
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
  doors?: PublicDoorsState;
}

/** One entry in the per-session action log (used for replay + fraud review). */
export interface HistoryEntry {
  t: string; // event type
  at: number; // epoch ms
  [key: string]: unknown;
}
