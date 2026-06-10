import Link from "next/link";
import { getJackpotAmount } from "@/lib/settings";
import { getSiteStats } from "@/lib/stats";
import { getDailyLeaderboard, getBestToday } from "@/lib/leaderboard";
import { GAME_LIST, GAME_META } from "@/lib/games/meta";
import { GameCard } from "@/components/GameCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [jackpot, stats, highlowBoard, ...bests] = await Promise.all([
    getJackpotAmount(),
    getSiteStats(),
    getDailyLeaderboard("highlow"),
    ...GAME_LIST.map((g) => getBestToday(g.type)),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative py-16 text-center sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-8 mx-auto h-64 max-w-2xl rounded-full bg-gold/[0.07] blur-3xl" />
        <p className="chip mx-auto border-gold/30 bg-gold/10 text-gold animate-pop-in">
          ✨ Free to play · Real jackpot
        </p>
        <h1 className="font-display mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Three games. <span className="text-gold-shimmer">One jackpot.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/65 sm:text-lg">
          Complete any challenge and win{" "}
          <span className="font-bold text-gold">${jackpot.toLocaleString()}</span>. Nearly
          impossible. Completely free. Dangerously fun.
        </p>

        <div className="animate-float mx-auto mt-10 w-fit">
          <div className="panel gold-ring px-10 py-6">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">
              Current Jackpot
            </div>
            <div className="font-display text-5xl font-extrabold text-gold-shimmer sm:text-6xl">
              ${jackpot.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-white/50">Complete any game to win.</div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/games" className="btn-gold !px-8 !py-3 !text-base">
            Play now
          </Link>
          <Link href="/leaderboards" className="btn-ghost !px-8 !py-3 !text-base">
            Today’s leaderboards
          </Link>
        </div>
      </section>

      {/* Public stats strip */}
      <section className="panel grid grid-cols-2 gap-4 p-6 text-center sm:grid-cols-4">
        {[
          { label: "Players", value: stats.totalUsers.toLocaleString() },
          { label: "Attempts today", value: stats.gamesToday.toLocaleString() },
          { label: "Total attempts", value: stats.totalGames.toLocaleString() },
          { label: "Jackpot winners", value: stats.totalWinners.toLocaleString() },
        ].map((s) => (
          <div key={s.label}>
            <div className="font-display text-2xl font-bold text-gold">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-white/45">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Game cards */}
      <section className="py-14">
        <h2 className="font-display text-center text-2xl font-bold sm:text-3xl">
          Pick your <span className="text-gold">impossible</span>
        </h2>
        <p className="mt-2 text-center text-sm text-white/55">
          Browse freely — create a free account with your phone number to play.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GAME_LIST.map((meta, i) => (
            <GameCard
              key={meta.type}
              meta={meta}
              jackpot={jackpot}
              bestToday={bests[i] != null ? meta.bestLabel(bests[i] as number) : null}
            />
          ))}
        </div>
      </section>

      {/* Leaderboard teaser */}
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">🏆 Today’s High Low leaders</h2>
          <Link href="/leaderboards" className="btn-ghost !px-4 !py-1.5 !text-xs">
            All leaderboards →
          </Link>
        </div>
        {highlowBoard.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">
            No plays yet today — be the first on the board.
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-white/[0.06]">
            {highlowBoard.slice(0, 5).map((e) => (
              <li key={e.rank} className="flex items-center gap-4 py-2.5 text-sm">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-bold ${
                    e.rank === 1 ? "bg-gold text-black" : "bg-white/[0.08] text-white/70"
                  }`}
                >
                  {e.rank}
                </span>
                <span className="flex-1 truncate font-medium">{e.displayName}</span>
                <span className={e.won ? "font-bold text-gold" : "text-white/60"}>
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
