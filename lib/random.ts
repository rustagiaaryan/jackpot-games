import { randomInt, randomBytes } from "crypto";

// All game randomness uses Node's CSPRNG (crypto.randomInt), never Math.random,
// so outcomes cannot be predicted from a seed. Randomness only ever lives
// server-side — see lib/games/* for how hidden state is stored.

/** Cryptographically secure integer in [0, maxExclusive). */
export function secureInt(maxExclusive: number): number {
  return randomInt(maxExclusive);
}

/** Cryptographically secure Fisher–Yates shuffle (returns a new array). */
export function secureShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** URL-safe random token (auth sessions, etc.). */
export function secureToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** 6-digit one-time code for SMS verification. */
export function secureOtp(): string {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}
