import Link from "next/link";
import type { GameMeta } from "@/lib/games/meta";

const PREVIEWS: Record<string, React.ReactNode> = {
  highlow: (
    <div className="flex items-end justify-center gap-2 pt-2">
      <div className="h-16 w-11 -rotate-12 rounded-lg border-2 border-white/25 bg-gradient-to-br from-violet to-[#3b1d77] shadow-lg" />
      <div className="grid h-20 w-14 place-items-center rounded-lg border-2 border-white/40 bg-white text-xl font-extrabold text-red-600 shadow-xl">
        7♥
      </div>
      <div className="h-16 w-11 rotate-12 rounded-lg border-2 border-white/25 bg-gradient-to-br from-violet to-[#3b1d77] shadow-lg" />
    </div>
  ),
  dice: (
    <div className="flex items-center justify-center gap-2.5 pt-4">
      <div className="grid h-14 w-14 rotate-6 place-items-center rounded-xl bg-white text-2xl font-black text-slate-900 shadow-xl">
        ⚄
      </div>
      <div className="grid h-14 w-14 -rotate-3 place-items-center rounded-xl bg-white text-2xl font-black text-slate-900 shadow-xl">
        ⚂
      </div>
      <div className="grid h-14 w-14 rotate-12 place-items-center rounded-xl bg-white text-2xl font-black text-slate-900 shadow-xl">
        ⚅
      </div>
    </div>
  ),
};

const ACCENTS: Record<string, string> = {
  highlow: "hover:border-violet/70 hover:shadow-[0_14px_48px_rgba(160,107,255,0.25)]",
  dice: "hover:border-win/70 hover:shadow-[0_14px_48px_rgba(0,230,92,0.22)]",
};

/** Game tile used on Home and Games pages: preview, vibe, prize label. */
export function GameCard({
  meta,
  bestToday,
  prize,
}: {
  meta: GameMeta;
  bestToday?: string | null;
  prize: number;
}) {
  return (
    <Link
      href={`/games/${meta.slug}`}
      className={`panel group relative flex flex-col overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1.5 ${ACCENTS[meta.type]}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-win/15 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="h-24">{PREVIEWS[meta.type]}</div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-2xl font-extrabold">
          {meta.emoji} {meta.name}
        </h3>
        <span className="chip !py-1 border-cyan/50 bg-cyan/15 !text-xs uppercase tracking-wide text-cyan">
          {meta.vibe}
        </span>
      </div>
      <p className="mt-2 flex-1 text-base font-semibold leading-relaxed text-white/85">
        {meta.description}
      </p>
      <div className="mt-4 flex items-center justify-between text-sm font-bold">
        <span className="text-gold">💰 WIN ${prize.toLocaleString()}</span>
        {bestToday && <span className="text-white/75">Best today: {bestToday}</span>}
      </div>
      <span className="btn-win mt-4 w-full">PLAY {meta.name.toUpperCase()} →</span>
    </Link>
  );
}
