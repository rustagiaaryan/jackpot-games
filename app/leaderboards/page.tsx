import { getJackpotAmount } from "@/lib/settings";
import { getDailyLeaderboard } from "@/lib/leaderboard";
import { GAME_LIST } from "@/lib/games/meta";

export const dynamic = "force-dynamic";

export const metadata = { title: "Daily Leaderboards — Jackpot Arcade" };

export default async function LeaderboardsPage() {
  const [jackpot, ...boards] = await Promise.all([
    getJackpotAmount(),
    ...GAME_LIST.map((g) => getDailyLeaderboard(g.type)),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
            Daily leaderboards<span className="text-gold">.</span>
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Top 10 per game, resets every day. Winners take the{" "}
            <span className="font-semibold text-gold">${jackpot.toLocaleString()} jackpot</span>.
          </p>
        </div>
        <span className="chip border-gold/40 bg-gold/10 text-gold">
          💰 Current jackpot: ${jackpot.toLocaleString()}
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {GAME_LIST.map((meta, i) => {
          const board = boards[i];
          return (
            <section key={meta.type} className="panel p-5">
              <h2 className="font-display flex items-center gap-2 text-lg font-bold">
                <span>{meta.emoji}</span> {meta.name}
              </h2>
              {board.length === 0 ? (
                <p className="mt-4 text-sm text-white/45">No plays yet today.</p>
              ) : (
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-white/40">
                      <th className="py-1.5 pr-2 font-medium">#</th>
                      <th className="py-1.5 pr-2 font-medium">Player</th>
                      <th className="py-1.5 pr-2 font-medium">Best today</th>
                      <th className="py-1.5 text-right font-medium">Tries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {board.map((e) => (
                      <tr key={e.rank} className={e.won ? "bg-gold/[0.07]" : ""}>
                        <td className="py-2 pr-2">
                          <span
                            className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                              e.won
                                ? "bg-gold text-black"
                                : e.rank === 1
                                ? "bg-white/15 text-gold"
                                : "bg-white/[0.07] text-white/60"
                            }`}
                          >
                            {e.rank}
                          </span>
                        </td>
                        <td className="max-w-[110px] truncate py-2 pr-2 font-medium">
                          {e.won && <span aria-hidden>👑 </span>}
                          {e.displayName}
                        </td>
                        <td className={`py-2 pr-2 text-xs ${e.won ? "font-bold text-gold" : "text-white/65"}`}>
                          {e.won ? meta.winnerLabel : meta.bestLabel(e.best)}
                        </td>
                        <td className="py-2 text-right text-xs text-white/40">{e.attemptsToday}</td>
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
