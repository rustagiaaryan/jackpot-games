import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { maskPhone } from "@/lib/phone";
import { getUserGameStats } from "@/lib/stats";
import { playsUsedToday } from "@/lib/games/engine";
import { DAILY_PLAY_LIMIT, getPrizeAmount } from "@/lib/settings";
import { GAME_META } from "@/lib/games/meta";
import { PayoutSection } from "@/components/PayoutSection";
import type { GameType } from "@/lib/games/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "My Profile — 1K Arcade" };

const STAT_ROWS: { key: "totalAttempts" | "bestEver" | "bestToday" | "average" | "wins"; label: string }[] = [
  { key: "totalAttempts", label: "Total plays" },
  { key: "bestEver", label: "Best ever" },
  { key: "bestToday", label: "Best today" },
  { key: "average", label: "Average" },
  { key: "wins", label: "Wins" },
];

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const [stats, used, prize, wins, payout] = await Promise.all([
    getUserGameStats(user.id),
    playsUsedToday(user.id),
    getPrizeAmount(),
    db.win.findMany({ where: { userId: user.id }, orderBy: { wonAt: "desc" } }),
    db.payoutInfo.findUnique({ where: { userId: user.id } }),
  ]);

  const totalGames = stats.reduce((s, g) => s + g.totalAttempts, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet/70 to-[#3b1d77] font-display text-3xl font-extrabold">
            {user.displayName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              {user.displayName}
              {wins.length > 0 && <span title="Winner"> 👑</span>}
            </h1>
            <p className="mt-0.5 text-base font-bold text-white/85">
              {maskPhone(user.phone)} <span className="text-win">✓ verified</span>
            </p>
            <p className="text-sm font-semibold text-white/70">
              Member since{" "}
              {user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <span className="chip border-gold/60 bg-gold/15 text-gold">
          💰 WIN ${prize.toLocaleString()}
        </span>
      </div>

      {/* Account stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total plays", value: totalGames },
          { label: "Plays today", value: used },
          { label: "Plays left today", value: Math.max(0, DAILY_PLAY_LIMIT - used) },
          { label: "Wins", value: wins.length },
        ].map((s) => (
          <div key={s.label} className="panel p-4 text-center">
            <div className="font-display text-3xl font-extrabold text-gold">{s.value}</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/70">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {wins.length > 0 && (
        <div className="panel gold-ring mt-6 p-5">
          <h2 className="font-display text-2xl font-extrabold text-gold">🏆 Your wins</h2>
          <ul className="mt-2 space-y-1.5 text-base font-bold text-white/90">
            {wins.map((w) => (
              <li key={w.id}>
                {GAME_META[w.gameType as GameType].name} —{" "}
                {w.wonAt.toLocaleDateString("en-US", { dateStyle: "long" })} · $
                {w.prizeAmount.toLocaleString()} · payout{" "}
                <span className="text-win">{w.payoutStatus.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-game stats */}
      <h2 className="font-display mt-10 text-2xl font-extrabold">Game stats</h2>
      <div className="mt-4 grid max-w-3xl gap-4 sm:grid-cols-2">
        {stats.map((g) => {
          const meta = GAME_META[g.gameType];
          return (
            <div key={g.gameType} className="panel p-5">
              <h3 className="font-display text-xl font-extrabold">
                {meta.emoji} {meta.name}
              </h3>
              <dl className="mt-3 space-y-2.5 text-base">
                {STAT_ROWS.map((row) => (
                  <div key={row.key} className="flex justify-between">
                    <dt className="font-semibold text-white/75">{row.label}</dt>
                    <dd className={`font-extrabold ${row.key === "wins" && g.wins > 0 ? "text-gold" : ""}`}>
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
      <h2 className="font-display mt-10 text-2xl font-extrabold">Payout info</h2>
      <p className="mt-1 text-base font-bold text-white/85">
        Set up how you’d like your ${prize.toLocaleString()} when you win — change it any time.
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
