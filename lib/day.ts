// Day bucketing for daily limits, leaderboards, and sponsor-of-the-day.
// All "daily" logic shares this boundary so resets stay consistent.

const TZ = process.env.APP_TIMEZONE || "America/Los_Angeles";

/** YYYY-MM-DD in the app timezone for a given instant (default: now). */
export function getDayKey(date: Date = new Date()): string {
  // en-CA locale formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
