import { secureShuffle } from "@/lib/random";
import type { Card, HighLowSecret, PublicHighLowState } from "@/lib/games/types";

// High Low engine. Ace is LOW: A=1, 2…10, J=11, Q=12, K=13.
// Equal next card is an automatic loss. Revealing all 52 cards wins.

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit });
  }
  return deck;
}

export function startHighLow(): { secret: HighLowSecret; progress: number } {
  // Cryptographically shuffled, stored server-side only. The client receives
  // exactly one card now and one more per correct guess.
  return { secret: { deck: secureShuffle(buildDeck()) }, progress: 1 };
}

export type HighLowOutcome = "correct" | "wrong" | "equal";

export interface HighLowGuessResult {
  outcome: HighLowOutcome;
  revealedCard: Card;
  previousCard: Card;
  newProgress: number;
  won: boolean;
  lost: boolean;
}

export function applyHighLowGuess(
  secret: HighLowSecret,
  progress: number,
  guess: "higher" | "lower"
): HighLowGuessResult {
  const previousCard = secret.deck[progress - 1];
  const revealedCard = secret.deck[progress];

  let outcome: HighLowOutcome;
  if (revealedCard.rank === previousCard.rank) outcome = "equal";
  else if (revealedCard.rank > previousCard.rank) outcome = guess === "higher" ? "correct" : "wrong";
  else outcome = guess === "lower" ? "correct" : "wrong";

  const newProgress = outcome === "correct" ? progress + 1 : progress;
  const won = outcome === "correct" && newProgress === 52;
  return { outcome, revealedCard, previousCard, newProgress, won, lost: outcome !== "correct" };
}

/** Public state: only the cards already revealed (plus the losing card, if any). */
export function highLowPublicState(
  secret: HighLowSecret,
  progress: number,
  lost: boolean
): PublicHighLowState {
  // After a loss the card that ended the game is shown too (it was revealed).
  const visibleCount = lost ? progress + 1 : progress;
  return {
    revealed: secret.deck.slice(0, visibleCount),
    cardsRevealed: progress,
    totalCards: 52,
  };
}

export const CARD_RANK_LABELS: Record<number, string> = {
  1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
  8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};
