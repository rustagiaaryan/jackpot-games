import { getPrizeAmount } from "@/lib/settings";
import { getDailyLeaderboard } from "@/lib/leaderboard";
import { GAME_LIST } from "@/lib/games/meta";

export const dynamic = "force-dynamic";

export const metadata = { title: "Daily Leaderboards — 1K Arcade" };

export default async function LeaderboardsPage() {
  const [prize, ...boards] = await Promise.all([
    getPrizeAmount(),
    ...GAME_LIST.map((g) => getDailyLeaderboard(g.type)),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            Daily leaderboards<span className="text-win">.</span>
          </h1>
          <p className="mt-2 text-lg font-bold text-white/90">
            Top 10 per game, fresh every day. Beat a game and take home{" "}
            <span className="text-gold">${prize.toLocaleString()}</span>.
          </p>
        </div>
        <span className="chip border-gold/60 bg-gold/15 text-gold">
          💰 WIN ${prize.toLocaleString()}
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {GAME_LIST.map((meta, i) => {
          const board = boards[i];
          return (
            <section key={meta.type} className="panel p-5">
              <h2 className="font-display flex items-center gap-2 text-2xl font-extrabold">
                <span>{meta.emoji}</span> {meta.name}
              </h2>
              {board.length === 0 ? (
                <p className="mt-4 text-base font-bold text-white/75">No plays yet today.</p>
              ) : (
                <table className="mt-3 w-full text-base">
                  <thead>
                    <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-white/65">
                      <th className="py-1.5 pr-2">#</th>
                      <th className="py-1.5 pr-2">Player</th>
                      <th className="py-1.5 pr-2">Best today</th>
                      <th className="py-1.5 text-right">Tries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07]">
                    {board.map((e) => (
                      <tr key={e.rank} className={e.won ? "bg-gold/[0.1]" : ""}>
                        <td className="py-2.5 pr-2">
                          <span
                            className={`grid h-7 w-7 place-items-center rounded-full font-display text-sm font-extrabold ${
                              e.won
                                ? "bg-gold text-black"
                                : e.rank === 1
                                ? "bg-white/20 text-gold"
                                : "bg-white/[0.1] text-white/80"
                            }`}
                          >
                            {e.rank}
                          </span>
                        </td>
                        <td className="max-w-[120px] truncate py-2.5 pr-2 font-bold">
                          {e.won && <span aria-hidden>👑 </span>}
                          {e.displayName}
                        </td>
                        <td
                          className={`py-2.5 pr-2 text-sm font-bold ${
                            e.won ? "text-gold" : "text-white/85"
                          }`}
                        >
                          {e.won ? meta.winnerLabel : meta.bestLabel(e.best)}
                        </td>
                        <td className="py-2.5 text-right text-sm font-bold text-white/65">
                          {e.attemptsToday}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
