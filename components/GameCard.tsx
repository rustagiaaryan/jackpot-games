import Link from "next/link";
import type { GameMeta } from "@/lib/games/meta";

const PREVIEWS: Record<string, React.ReactNode> = {
  highlow: (
    <div className="flex items-end justify-center gap-2 pt-2">
      <div className="h-16 w-11 -rotate-12 rounded-lg border border-white/20 bg-gradient-to-br from-violet-700 to-violet-950 shadow-lg" />
      <div className="grid h-20 w-14 place-items-center rounded-lg border border-white/30 bg-white text-xl font-bold text-red-600 shadow-xl">
        7♥
      </div>
      <div className="h-16 w-11 rotate-12 rounded-lg border border-white/20 bg-gradient-to-br from-violet-700 to-violet-950 shadow-lg" />
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

/** Game tile used on Home and Games pages: preview, rules vibe, jackpot label. */
export function GameCard({
  meta,
  bestToday,
  jackpot,
}: {
  meta: GameMeta;
  bestToday?: string | null;
  jackpot: number;
}) {
  return (
    <Link
      href={`/games/${meta.slug}`}
      className="panel group relative flex flex-col overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_12px_44px_rgba(246,197,68,0.15)]"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="h-24">{PREVIEWS[meta.type]}</div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">
          {meta.emoji} {meta.name}
        </h3>
        <span className="chip !py-0.5 border-violet-400/30 bg-violet-500/15 text-[10px] uppercase tracking-wide text-violet-200">
          {meta.difficulty}
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{meta.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-white/50">
        <span className="text-gold/90 font-semibold">💰 ${jackpot.toLocaleString()} jackpot</span>
        {bestToday && <span>Best today: {bestToday}</span>}
      </div>
      <span className="btn-gold mt-4 w-full">Play {meta.name} →</span>
    </Link>
  );
}
