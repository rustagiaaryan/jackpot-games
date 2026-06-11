import { secureInt } from "@/lib/random";
import {
  DICE_TOTAL_SUMS,
  type DiceSecret,
  type PublicDiceState,
} from "@/lib/games/types";

// Dice Sweep engine. Roll three dice and collect every sum from 3 to 18 in
// any order — repeating a sum you already collected ends the game. Dice
// values are generated server-side AT ROLL TIME with a CSPRNG — future rolls
// never exist anywhere before the roll.

export function startDice(): { secret: DiceSecret; progress: number } {
  return { secret: { collected: [] }, progress: 0 };
}

export interface DiceRollResult {
  d1: number;
  d2: number;
  d3: number;
  sum: number;
  /** true if this sum was new (collected), false if it was a repeat (loss) */
  collected: boolean;
  newProgress: number;
  won: boolean;
  lost: boolean;
}

/** Mutates `secret.collected` when the sum is new. */
export function applyDiceRoll(secret: DiceSecret): DiceRollResult {
  const d1 = secureInt(6) + 1;
  const d2 = secureInt(6) + 1;
  const d3 = secureInt(6) + 1;
  const sum = d1 + d2 + d3;
  const repeat = secret.collected.includes(sum);
  if (!repeat) secret.collected.push(sum);
  const newProgress = secret.collected.length;
  const won = !repeat && newProgress === DICE_TOTAL_SUMS;
  return { d1, d2, d3, sum, collected: !repeat, newProgress, won, lost: repeat };
}

export function dicePublicState(
  secret: DiceSecret,
  lastRoll: { d1: number; d2: number; d3: number; sum: number } | null
): PublicDiceState {
  return {
    collected: [...secret.collected],
    sumsCollected: secret.collected.length,
    totalSums: DICE_TOTAL_SUMS,
    lastRoll,
  };
}
