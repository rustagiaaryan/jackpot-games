import { secureInt } from "@/lib/random";
import {
  DOOR_COUNTS,
  TOTAL_LEVELS,
  type DoorsSecret,
  type PublicDoorsState,
} from "@/lib/games/types";

// Doors Challenge engine. Levels have 1, 2, 4, 8, 16, 32, 64, then 2 doors.
// The correct door for a level is generated server-side when the player
// ENTERS that level and stored only in secretState — the client never sees
// it. Level 1 has a single door, so it is always correct (by design: the
// player still clicks through it to set the tone).

export function startDoors(): { secret: DoorsSecret; progress: number } {
  // Generate level 1's answer on entry (index 0 of 1 door).
  return { secret: { answers: [secureInt(DOOR_COUNTS[0])] }, progress: 0 };
}

export interface DoorsPickResult {
  correct: boolean;
  correctDoor: number; // safe to reveal: the level is over either way
  clearedLevel: number; // the level just attempted (1-based)
  newProgress: number;
  won: boolean;
  lost: boolean;
}

export function applyDoorsPick(
  secret: DoorsSecret,
  progress: number,
  doorIndex: number
): DoorsPickResult {
  const level = progress + 1;
  const doorCount = DOOR_COUNTS[progress];
  if (!Number.isInteger(doorIndex) || doorIndex < 0 || doorIndex >= doorCount) {
    throw new Error("Invalid door index.");
  }
  const answer = secret.answers[progress];
  const correct = doorIndex === answer;
  const newProgress = correct ? progress + 1 : progress;
  const won = correct && newProgress === TOTAL_LEVELS;

  // Entering the next level: generate its answer now (and only now).
  if (correct && !won) {
    secret.answers.push(secureInt(DOOR_COUNTS[newProgress]));
  }
  return { correct, correctDoor: answer, clearedLevel: level, newProgress, won, lost: !correct };
}

export function doorsPublicState(progress: number): PublicDoorsState {
  const levelIndex = Math.min(progress, TOTAL_LEVELS - 1);
  return {
    level: levelIndex + 1,
    doorCount: DOOR_COUNTS[levelIndex],
    levelsCleared: progress,
    doorCounts: DOOR_COUNTS,
  };
}
