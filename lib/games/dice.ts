import { secureInt } from "@/lib/random";
import { DICE_TARGETS, type DiceSecret, type PublicDiceState } from "@/lib/games/types";

// Dice Staircase engine. Roll sums 8 → 7 → 6 → 5 → 4 → 3 → 2 in exact order.
// Any wrong sum ends the game. Dice values are generated server-side AT ROLL
// TIME with a CSPRNG — future rolls never exist anywhere before the roll.

export function startDice(): { secret: DiceSecret; progress: number } {
  return { secret: { _: null }, progress: 0 };
}

export interface DiceRollResult {
  d1: number;
  d2: number;
  sum: number;
  target: number;
  correct: boolean;
  newProgress: number;
  won: boolean;
  lost: boolean;
}

export function applyDiceRoll(progress: number): DiceRollResult {
  const d1 = secureInt(6) + 1;
  const d2 = secureInt(6) + 1;
  const sum = d1 + d2;
  const target = DICE_TARGETS[progress];
  const correct = sum === target;
  const newProgress = correct ? progress + 1 : progress;
  const won = correct && newProgress === DICE_TARGETS.length;
  return { d1, d2, sum, target, correct, newProgress, won, lost: !correct };
}

export function dicePublicState(
  progress: number,
  lastRoll: { d1: number; d2: number; sum: number } | null
): PublicDiceState {
  return { targets: DICE_TARGETS, stepsCompleted: progress, lastRoll };
}
