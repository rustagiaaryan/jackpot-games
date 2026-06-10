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
      <span className={`chip ${low ? "border-red-400/40 text-red-300" : ""}`}>
        <span className="hidden lg:inline text-white/50">Plays left today:</span>
        <span className="font-semibold">
          {me.playsRemaining} / {me.dailyLimit}
        </span>
        <button
          aria-label="About the daily limit"
          onClick={() => setOpen((v) => !v)}
          className="grid h-4 w-4 place-items-center rounded-full border border-white/30 text-[9px] text-white/60 hover:border-gold hover:text-gold cursor-pointer"
        >
          i
        </button>
      </span>
      {open && (
        <div
          className="panel absolute right-0 top-9 z-50 w-72 p-4 text-xs leading-relaxed text-white/75 animate-pop-in"
          onMouseLeave={() => setOpen(false)}
        >
          Each account is limited to {me.dailyLimit} total game attempts per day. This limit
          helps keep the games fair, prevents botting, and protects the jackpot system. Your
          limit resets every day.
        </div>
      )}
    </div>
  );
}
