import { getSiteStats } from "@/lib/stats";
import { SponsorInterestForm } from "@/components/SponsorInterestForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Become a Sponsor — Jackpot Arcade" };

const PLACEMENTS = [
  {
    title: "Site-wide banner",
    body: "Your logo, name, and link in the always-visible banner at the top of every page, all day.",
    emoji: "📣",
  },
  {
    title: "On every card back",
    body: "In High Low, your logo is printed on the back of every face-down card — seen on every single flip.",
    emoji: "🃏",
  },
  {
    title: "On the dice mat",
    body: "In Dice Sweep, your brand sits on the velvet mat under every single roll.",
    emoji: "🎲",
  },
  {
    title: "Every retry, every day",
    body: "These games are nearly impossible — players replay them dozens of times in a session, and your brand is there for all of it.",
    emoji: "🔁",
  },
];

export default async function SponsorPage() {
  const stats = await getSiteStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="chip border-gold/30 bg-gold/10 text-gold">For brands</p>
      <h1 className="font-display mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
        Own the arcade for a day<span className="text-gold">.</span>
      </h1>
      <p className="mt-3 max-w-xl text-white/65">
        One sponsor per day. No rotation, no competition — every player sees your brand on
        every page and inside every game, woven into the experience instead of interrupting it.
      </p>

      {/* Demo data: replace with a real analytics source before selling slots. */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Registered players", value: stats.totalUsers.toLocaleString() },
          { label: "Game plays (all time)", value: stats.totalGames.toLocaleString() },
          { label: "Plays today", value: stats.gamesToday.toLocaleString() },
          { label: "Avg. plays / player / day", value: stats.totalUsers ? Math.max(1, Math.round(stats.gamesToday / Math.max(1, stats.totalUsers))).toString() : "—" },
        ].map((s) => (
          <div key={s.label} className="panel p-4 text-center">
            <div className="font-display text-2xl font-bold text-gold">{s.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-white/45">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-white/35">
        Live numbers from this environment. Replay value is the pitch: players retry the games
        dozens of times per session, and your brand is on screen for every attempt.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PLACEMENTS.map((p) => (
          <div key={p.title} className="panel flex gap-4 p-5">
            <span className="text-3xl">{p.emoji}</span>
            <div>
              <h3 className="font-display font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-white/60">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-2xl font-bold">How it works</h2>
          <ol className="mt-4 space-y-4 text-sm text-white/70">
            {[
              "Tell us about your brand with the form — it takes a minute.",
              "We reach out within a day to pick your date and collect your logo and link.",
              "Your day arrives: your brand is on every page, every card back, every mat, and every room.",
              "You get a recap of impressions, plays, and clicks from your sponsored day.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <SponsorInterestForm />
      </div>
    </div>
  );
}
