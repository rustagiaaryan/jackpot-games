"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/SessionProvider";
import type { GameType, PublicSessionState } from "@/lib/games/types";

// Client game-session hook shared by all three games.
// Responsibilities: resume active sessions on refresh, start games, send
// actions, surface human-check / daily-limit / login gates, and keep the
// nav's plays-left chip in sync with every server response.

export type GamePhase = "boot" | "idle" | "playing" | "won" | "lost";

export interface ActionResponse {
  state: PublicSessionState;
  result: Record<string, unknown>;
}

export function useGame(gameType: GameType) {
  const { me, loading: sessionLoading, applyPlays, refresh } = useSession();
  const [state, setState] = useState<PublicSessionState | null>(null);
  const [phase, setPhase] = useState<GamePhase>("boot");
  const [error, setError] = useState<string | null>(null);
  const [humanCheck, setHumanCheck] = useState<string | null>(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const busyRef = useRef(false);

  const loggedIn = sessionLoading ? null : !!me?.user;

  const adopt = useCallback(
    (s: PublicSessionState) => {
      setState(s);
      applyPlays(s.playsUsedToday, s.playsRemaining);
      if (s.status === "won") setPhase("won");
      else if (s.status === "lost") setPhase("lost");
      else setPhase("playing");
    },
    [applyPlays]
  );

  // Resume an in-flight session after refresh (PRD §23.2).
  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn) {
      setPhase("idle");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/games/active?gameType=${gameType}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.state) adopt(data.state);
          else setPhase("idle");
        }
      } catch {
        if (!cancelled) setPhase("idle");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn, gameType, adopt]);

  const start = useCallback(async (): Promise<boolean> => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setError(null);
    try {
      const res = await fetch("/api/games/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType }),
      });
      const data = await res.json();
      if (res.status === 428) {
        // Periodic anti-bot human check (PRD §15.4)
        setHumanCheck(data.extra?.prompt ?? "Quick human check");
        return false;
      }
      if (res.status === 403 && data.code === "daily_limit") {
        setDailyLimitReached(true);
        setError(data.error);
        return false;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not start the game.");
        return false;
      }
      adopt(data.state);
      return true;
    } catch {
      setError("Connection issue — your attempt was not counted. Try again.");
      return false;
    } finally {
      busyRef.current = false;
    }
  }, [gameType, adopt]);

  const act = useCallback(
    async (path: string, body: Record<string, unknown>): Promise<ActionResponse | null> => {
      if (!state || busyRef.current) return null;
      busyRef.current = true;
      setError(null);
      try {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: state.sessionId, ...body }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.code === "session_over") {
            // Server says this session ended (e.g. other tab) — leave play mode.
            setPhase("idle");
            setState(null);
          }
          setError(data.error ?? "Action failed.");
          return null;
        }
        adopt(data.state);
        return data as ActionResponse;
      } catch {
        setError("Connection issue. Your game is saved — try the same move again.");
        return null;
      } finally {
        busyRef.current = false;
      }
    },
    [state, adopt]
  );

  const submitHumanCheck = useCallback(
    async (answer: string): Promise<boolean> => {
      const res = await fetch("/api/human-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (res.ok) {
        setHumanCheck(null);
        await refresh();
        return true;
      }
      return false;
    },
    [refresh]
  );

  return {
    me,
    loggedIn,
    state,
    phase,
    setPhase,
    error,
    setError,
    humanCheck,
    dailyLimitReached,
    start,
    act,
    submitHumanCheck,
  };
}

export type GameController = ReturnType<typeof useGame>;
