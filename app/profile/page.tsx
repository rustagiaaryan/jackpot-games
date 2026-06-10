import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { maskPhone } from "@/lib/phone";
import { getUserGameStats } from "@/lib/stats";
import { playsUsedToday } from "@/lib/games/engine";
import { DAILY_PLAY_LIMIT, getJackpotAmount } from "@/lib/settings";
import { GAME_META } from "@/lib/games/meta";
import { PayoutSection } from "@/components/PayoutSection";
import type { GameType } from "@/lib/games/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "My Profile — Jackpot Arcade" };

const STAT_ROWS: { key: "totalAttempts" | "bestEver" | "bestToday" | "average" | "wins"; label: string }[] = [
  { key: "totalAttempts", label: "Total attempts" },
  { key: "bestEver", label: "Best ever" },
  { key: "bestToday", label: "Best today" },
  { key: "average", label: "Average" },
  { key: "wins", label: "Wins" },
];

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const [stats, used, jackpot, wins, payout] = await Promise.all([
    getUserGameStats(user.id),
    playsUsedToday(user.id),
    getJackpotAmount(),
    db.win.findMany({ where: { userId: user.id }, orderBy: { wonAt: "desc" } }),
    db.payoutInfo.findUnique({ where: { userId: user.id } }),
  ]);

  const totalGames = stats.reduce((s, g) => s + g.totalAttempts, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/50 to-violet-900/60 font-display text-2xl font-extrabold">
            {user.displayName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
              {user.displayName}
              {wins.length > 0 && <span title="Jackpot winner"> 👑</span>}
            </h1>
            <p className="mt-0.5 text-sm text-white/55">
              Phone: {maskPhone(user.phone)} <span className="text-emerald-400">✓ verified</span>
            </p>
            <p className="text-xs text-white/40">
              Member since{" "}
              {user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <span className="chip border-gold/40 bg-gold/10 text-gold">
          💰 Current jackpot: ${jackpot.toLocaleString()}
        </span>
      </div>

      {/* Account stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total games played", value: totalGames },
          { label: "Games played today", value: used },
          { label: "Plays left today", value: Math.max(0, DAILY_PLAY_LIMIT - used) },
          { label: "Jackpot wins", value: wins.length },
        ].map((s) => (
          <div key={s.label} className="panel p-4 text-center">
            <div className="font-display text-2xl font-bold text-gold">{s.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-white/45">{s.label}</div>
          </div>
        ))}
      </div>

      {wins.length > 0 && (
        <div className="panel gold-ring mt-6 p-5">
          <h2 className="font-display text-lg font-bold text-gold">🏆 Jackpot wins</h2>
          <ul className="mt-2 space-y-1 text-sm text-white/75">
            {wins.map((w) => (
              <li key={w.id}>
                {GAME_META[w.gameType as GameType].name} —{" "}
                {w.wonAt.toLocaleDateString("en-US", { dateStyle: "long" })} · $
                {w.jackpotAmount.toLocaleString()} · payout{" "}
                <span className="font-semibold">{w.payoutStatus.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-game stats */}
      <h2 className="font-display mt-10 text-xl font-bold">Game stats</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {stats.map((g) => {
          const meta = GAME_META[g.gameType];
          return (
            <div key={g.gameType} className="panel p-5">
              <h3 className="font-display font-bold">
                {meta.emoji} {meta.name}
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                {STAT_ROWS.map((row) => (
                  <div key={row.key} className="flex justify-between">
                    <dt className="text-white/50">{row.label}</dt>
                    <dd className={`font-semibold ${row.key === "wins" && g.wins > 0 ? "text-gold" : ""}`}>
                      {row.key === "totalAttempts" || row.key === "wins"
                        ? g[row.key]
                        : meta.bestLabel(g[row.key])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>

      {/* Payout info */}
      <h2 className="font-display mt-10 text-xl font-bold">Payout info</h2>
      <p className="mt-1 text-sm text-white/55">
        Set up how you’d like to be paid if you win — you can change this any time.
      </p>
      <div className="mt-4 max-w-xl">
        <PayoutSection
          initial={
            payout
              ? { method: payout.method, handle: payout.handle, fullName: payout.fullName, note: payout.note ?? "" }
              : null
          }
        />
      </div>
    </div>
  );
}
