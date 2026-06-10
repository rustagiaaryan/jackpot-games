"use client";

import { CARD_RANK_LABELS } from "@/lib/games/highlow";
import type { Card } from "@/lib/games/types";

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const isRed = (suit: number) => suit === 1 || suit === 2;

export function cardLabel(card: Card): string {
  return `${CARD_RANK_LABELS[card.rank]}${SUITS[card.suit]}`;
}

const SIZES = {
  lg: "h-44 w-32 rounded-2xl sm:h-52 sm:w-36",
  md: "h-32 w-22 rounded-xl",
  sm: "h-20 w-14 rounded-lg",
} as const;

/** A face-up playing card. */
export function CardFace({
  card,
  size = "lg",
  dimmed = false,
  ring,
}: {
  card: Card;
  size?: keyof typeof SIZES;
  dimmed?: boolean;
  ring?: "gold" | "red" | null;
}) {
  const color = isRed(card.suit) ? "text-red-600" : "text-slate-900";
  const rank = CARD_RANK_LABELS[card.rank];
  const ringCls =
    ring === "gold"
      ? "ring-2 ring-gold shadow-[0_0_26px_rgba(246,197,68,0.65)]"
      : ring === "red"
      ? "ring-2 ring-red-500 shadow-[0_0_26px_rgba(240,68,92,0.6)]"
      : "";
  return (
    <div
      className={`relative flex flex-col justify-between border border-slate-300 bg-gradient-to-br from-white to-slate-100 p-1.5 shadow-xl ${SIZES[size]} ${ringCls} ${dimmed ? "opacity-80" : ""}`}
    >
      <div className={`leading-none ${color} ${size === "sm" ? "text-xs" : "text-lg"} font-bold`}>
        {rank}
        <div className={size === "sm" ? "text-[10px]" : "text-sm"}>{SUITS[card.suit]}</div>
      </div>
      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center ${color} ${
          size === "sm" ? "text-2xl" : size === "md" ? "text-4xl" : "text-6xl"
        }`}
      >
        {SUITS[card.suit]}
      </div>
      <div
        className={`self-end rotate-180 leading-none ${color} ${size === "sm" ? "text-xs" : "text-lg"} font-bold`}
      >
        {rank}
        <div className={size === "sm" ? "text-[10px]" : "text-sm"}>{SUITS[card.suit]}</div>
      </div>
    </div>
  );
}

/**
 * Sponsor-branded card back (PRD §7.2): a classic lattice card back with the
 * sponsor mark in the center medallion. Falls back to the house mark when no
 * sponsor is set for today.
 */
export function CardBack({
  size = "lg",
  sponsorName,
  sponsorLogoUrl,
}: {
  size?: keyof typeof SIZES;
  sponsorName?: string | null;
  sponsorLogoUrl?: string | null;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-violet-300/30 shadow-xl ${SIZES[size]}`}
      style={{
        background:
          "repeating-linear-gradient(45deg, #4c1d95 0 8px, #3b1678 8px 16px), linear-gradient(160deg, #5b21b6, #2e1065)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="absolute inset-1.5 rounded-[inherit] rounded-md border border-violet-300/25" />
      <div className="absolute inset-0 grid place-items-center">
        <div
          className={`grid place-items-center rounded-full border border-gold/50 bg-violet-950/80 text-center shadow-inner ${
            size === "sm" ? "h-10 w-10" : "h-20 w-20"
          }`}
        >
          {sponsorLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sponsorLogoUrl}
              alt={sponsorName ?? "Sponsor"}
              className={size === "sm" ? "h-6 w-6 object-contain" : "h-12 w-12 object-contain"}
            />
          ) : (
            <span
              className={`px-1 font-display font-bold leading-tight text-gold ${
                size === "sm" ? "text-[6px]" : "text-[10px]"
              }`}
            >
              {sponsorName ?? "JACKPOT ARCADE"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
