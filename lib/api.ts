import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";
import { GameError } from "@/lib/games/engine";

/** Uniform JSON error envelope: { error, code, extra? }. */
export function apiError(message: string, status = 400, code = "bad_request", extra?: unknown) {
  return NextResponse.json({ error: message, code, ...(extra ? { extra } : {}) }, { status });
}

/** Wrap a route handler with shared error mapping. */
export function withErrors<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof AuthError) return apiError(err.message, 401, "unauthorized");
      if (err instanceof GameError) {
        const status =
          err.code === "rate_limited" ? 429 :
          err.code === "human_check_required" ? 428 :
          err.code === "daily_limit" ? 403 :
          err.code === "not_found" ? 404 : 400;
        return apiError(err.message, status, err.code, err.extra);
      }
      console.error("API error:", err);
      return apiError("Something went wrong. Please try again.", 500, "internal");
    }
  };
}

/** Best-effort client IP for rate limiting (works behind common proxies). */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}
