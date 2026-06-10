import { getJackpotAmount } from "@/lib/settings";
import { getBestToday } from "@/lib/leaderboard";
import { GAME_LIST } from "@/lib/games/meta";
import { GameCard } from "@/components/GameCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Games — Jackpot Arcade" };

export default async function GamesPage() {
  const [jackpot, ...bests] = await Promise.all([
    getJackpotAmount(),
    ...GAME_LIST.map((g) => getBestToday(g.type)),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        The games<span className="text-gold">.</span>
      </h1>
      <p className="mt-2 max-w-xl text-sm text-white/60">
        Each one can be completed in theory. Almost never in practice. Finish any of them and
        the <span className="font-semibold text-gold">${jackpot.toLocaleString()} jackpot</span>{" "}
        is yours.
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
    </div>
  );
}
