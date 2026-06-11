"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Client session context: who is logged in, plays remaining, prize.
// Hydrated from GET /api/me; games push fresh play counts into it after
// every server response so the nav chip stays accurate without polling.

export interface SessionUser {
  id: string;
  displayName: string;
  phoneMasked: string;
  isAdmin: boolean;
  banned?: boolean;
}

export interface MeData {
  user: SessionUser | null;
  playsUsedToday?: number;
  playsRemaining?: number;
  dailyLimit: number;
  prize: number;
}

interface SessionContextValue {
  me: MeData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Push play counts from a game API response into the shared chip. */
  applyPlays: (used: number, remaining: number) => void;
}

const SessionContext = createContext<SessionContextValue>({
  me: null,
  loading: true,
  refresh: async () => {},
  applyPlays: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) setMe(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const applyPlays = useCallback((used: number, remaining: number) => {
    setMe((prev) =>
      prev ? { ...prev, playsUsedToday: used, playsRemaining: remaining } : prev
    );
  }, []);

  const value = useMemo(
    () => ({ me, loading, refresh, applyPlays }),
    [me, loading, refresh, applyPlays]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}
