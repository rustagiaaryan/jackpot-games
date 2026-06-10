// Sliding-window rate limiter.
//
// In-memory implementation — correct for a single Node server (next start)
// and for local development.
// PRODUCTION TODO: back this with Redis (e.g. Upstash @upstash/ratelimit) so
// limits hold across multiple instances / serverless invocations. The call
// sites only use `checkRateLimit`, so this file is the single swap point.

interface Window {
  timestamps: number[];
}

const windows = new Map<string, Window>();

// Periodic cleanup so the map doesn't grow unbounded in long-running dev.
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

/**
 * Allow at most `max` events per `windowMs` for the given key.
 * Keys are namespaced by caller, e.g. `otp:+15551234567` or `start:user_abc`.
 */
export function checkRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    for (const [k, w] of windows) {
      if (w.timestamps.length === 0 || now - w.timestamps[w.timestamps.length - 1] > 60 * 60 * 1000) {
        windows.delete(k);
      }
    }
  }

  let win = windows.get(key);
  if (!win) {
    win = { timestamps: [] };
    windows.set(key, win);
  }
  win.timestamps = win.timestamps.filter((t) => now - t < windowMs);

  if (win.timestamps.length >= max) {
    const oldest = win.timestamps[0];
    return { allowed: false, retryAfterMs: Math.max(0, oldest + windowMs - now) };
  }
  win.timestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

/** Named limits so policies live in one place. */
export const LIMITS = {
  /** OTP requests per phone number */
  otpPerPhone: { max: 5, windowMs: 10 * 60 * 1000 },
  /** OTP requests per IP — blunts mass account creation */
  otpPerIp: { max: 12, windowMs: 10 * 60 * 1000 },
  /** Code verification attempts per phone — blunts brute force */
  verifyPerPhone: { max: 10, windowMs: 10 * 60 * 1000 },
  /** Game starts per user — cooldown between games while keeping replay fun */
  gameStart: { max: 1, windowMs: 1200 },
  /** Burst of game starts per user per minute */
  gameStartBurst: { max: 30, windowMs: 60 * 1000 },
  /** In-game actions (guess/roll/pick) per user — anti spam-click */
  gameAction: { max: 6, windowMs: 1000 },
} as const;
