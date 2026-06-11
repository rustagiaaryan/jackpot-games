"use client";

import { useState } from "react";
import { useSession } from "@/components/SessionProvider";

/**
 * "Plays left today: 437 / 500" chip with the info popover explaining the
 * daily limit (PRD §6.1–6.2). Lives in the top-right of the nav.
 */
export function PlaysLeftChip() {
  const { me } = useSession();
  const [open, setOpen] = useState(false);
  if (!me?.user || me.playsRemaining === undefined) return null;

  const low = me.playsRemaining <= 25;

  return (
    <div className="relative hidden sm:block">
      <span className={`chip ${low ? "border-red-400/50 text-red-300" : ""}`}>
        <span className="hidden lg:inline text-white/70">Plays left:</span>
        <span className="font-extrabold">
          {me.playsRemaining} / {me.dailyLimit}
        </span>
        <button
          aria-label="About the daily limit"
          onClick={() => setOpen((v) => !v)}
          className="grid h-5 w-5 place-items-center rounded-full border-2 border-white/40 text-[10px] font-extrabold text-white/80 hover:border-win hover:text-win cursor-pointer"
        >
          i
        </button>
      </span>
      {open && (
        <div
          className="panel absolute right-0 top-10 z-50 w-72 p-4 text-sm font-semibold leading-relaxed text-white/90 animate-pop-in"
          onMouseLeave={() => setOpen(false)}
        >
          Each account gets {me.dailyLimit} game plays per day. The limit keeps the games fair
          for everyone and resets every single day — come back tomorrow for a fresh {me.dailyLimit}.
        </div>
      )}
    </div>
  );
}
