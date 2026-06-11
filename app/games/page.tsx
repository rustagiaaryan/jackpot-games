import { getPrizeAmount } from "@/lib/settings";
import { getBestToday } from "@/lib/leaderboard";
import { GAME_LIST } from "@/lib/games/meta";
import { GameCard } from "@/components/GameCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Games — 1K Arcade" };

export default async function GamesPage() {
  const [prize, ...bests] = await Promise.all([
    getPrizeAmount(),
    ...GAME_LIST.map((g) => getBestToday(g.type)),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
        The games<span className="text-win">.</span>
      </h1>
      <p className="mt-2 max-w-xl text-lg font-bold text-white/90">
        Two ways to win. Beat either game and{" "}
        <span className="text-gold">${prize.toLocaleString()}</span> is yours — every single
        winner gets paid.
      </p>
      <div className="mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
        {GAME_LIST.map((meta, i) => (
          <GameCard
            key={meta.type}
            meta={meta}
            prize={prize}
            bestToday={bests[i] != null ? meta.bestLabel(bests[i] as number) : null}
          />
        ))}
      </div>
    </div>
  );
}
