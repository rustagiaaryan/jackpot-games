import Link from "next/link";
import { getPrizeAmount } from "@/lib/settings";
import { getSiteStats } from "@/lib/stats";
import { getDailyLeaderboard, getBestToday } from "@/lib/leaderboard";
import { GAME_LIST, GAME_META } from "@/lib/games/meta";
import { GameCard } from "@/components/GameCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [prize, stats, highlowBoard, ...bests] = await Promise.all([
    getPrizeAmount(),
    getSiteStats(),
    getDailyLeaderboard("highlow"),
    ...GAME_LIST.map((g) => getBestToday(g.type)),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative py-14 text-center sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-8 mx-auto h-64 max-w-2xl rounded-full bg-win/[0.08] blur-3xl" />
        <p className="chip mx-auto border-win/60 bg-win/15 text-win animate-pop-in">
          ✨ 100% FREE TO PLAY · REAL MONEY PRIZE
        </p>
        <h1 className="font-display mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
          Beat a game.
          <br />
          <span className="text-gold-shimmer">Win ${prize.toLocaleString()}.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg font-bold text-white/90 sm:text-xl">
          Two games. Beat either one and ${prize.toLocaleString()} is yours —{" "}
          <span className="text-win">no strings attached</span>. Every winner gets paid.
        </p>

        <div className="animate-float mx-auto mt-10 w-fit">
          <div className="panel gold-ring px-12 py-7">
            <div className="text-sm font-extrabold uppercase tracking-[0.25em] text-white/80">
              Win any game, take home
            </div>
            <div className="font-display text-6xl font-extrabold text-gold-shimmer sm:text-7xl">
              ${prize.toLocaleString()}
            </div>
            <div className="mt-1 text-sm font-bold text-white/80">
              Paid by Venmo, Zelle, PayPal, or Cash App.
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/games" className="btn-win !px-10 !py-4 !text-xl">
            ▶ PLAY NOW
          </Link>
          <Link href="/leaderboards" className="btn-ghost !px-10 !py-4 !text-xl">
            🏆 Leaderboards
          </Link>
        </div>
      </section>

      {/* Public stats strip */}
      <section className="panel grid grid-cols-2 gap-4 p-6 text-center sm:grid-cols-4">
        {[
          { label: "Players", value: stats.totalUsers.toLocaleString() },
          { label: "Plays today", value: stats.gamesToday.toLocaleString() },
          { label: "Total plays", value: stats.totalGames.toLocaleString() },
          { label: "Winners paid", value: stats.totalWinners.toLocaleString() },
        ].map((s) => (
          <div key={s.label}>
            <div className="font-display text-3xl font-extrabold text-gold">{s.value}</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/70">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Game cards */}
      <section className="py-14">
        <h2 className="font-display text-center text-3xl font-extrabold sm:text-4xl">
          Pick your game<span className="text-win">.</span>
        </h2>
        <p className="mt-2 text-center text-base font-bold text-white/85">
          Browse free — grab a free account with your phone number when you’re ready to play.
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
          {GAME_LIST.map((meta, i) => (
            <GameCard
              key={meta.type}
              meta={meta}
              prize={prize}
              bestToday={bests[i] != null ? meta.bestLabel(bests[i] as number) : null}
            />
          ))}
        </div>
      </section>

      {/* Leaderboard teaser */}
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">🏆 Today’s High Low leaders</h2>
          <Link href="/leaderboards" className="btn-ghost !px-4 !py-2 !text-sm">
            All leaderboards →
          </Link>
        </div>
        {highlowBoard.length === 0 ? (
          <p className="mt-4 text-base font-bold text-white/80">
            No plays yet today — be the first on the board!
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-white/[0.08]">
            {highlowBoard.slice(0, 5).map((e) => (
              <li key={e.rank} className="flex items-center gap-4 py-3 text-base font-bold">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display font-extrabold ${
                    e.rank === 1 ? "bg-gold text-black" : "bg-white/[0.1] text-white/85"
                  }`}
                >
                  {e.rank}
                </span>
                <span className="flex-1 truncate">{e.displayName}</span>
                <span className={e.won ? "font-extrabold text-gold" : "text-white/80"}>
                  {e.won ? GAME_META.highlow.winnerLabel : GAME_META.highlow.bestLabel(e.best)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="h-4" />
    </div>
  );
}
