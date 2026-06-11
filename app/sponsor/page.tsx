import { getSiteStats } from "@/lib/stats";
import { SponsorInterestForm } from "@/components/SponsorInterestForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Become a Sponsor — 1K Arcade" };

const PLACEMENTS = [
  {
    title: "Pinned site-wide banner",
    body: "Your logo, name, and link stay pinned to the top of every page, all day — players literally cannot scroll away from it.",
    emoji: "📣",
  },
  {
    title: "On every card back",
    body: "In High Low, your logo is printed on the back of every face-down card — seen on every single flip.",
    emoji: "🃏",
  },
  {
    title: "On the dice felt",
    body: "In Dice Sweep, your brand sits on the table under every roll of every die.",
    emoji: "🎲",
  },
  {
    title: "Around every result",
    body: "Your name wraps the end-of-run popup in a moving border — one more look at your brand between every play.",
    emoji: "🔁",
  },
];

export default async function SponsorPage() {
  const stats = await getSiteStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="chip border-gold/60 bg-gold/15 text-gold">FOR BRANDS</p>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">
        Own the arcade for a day<span className="text-win">.</span>
      </h1>
      <p className="mt-3 max-w-xl text-lg font-bold text-white/90">
        One sponsor per day. No rotation, no competition — every player sees your brand pinned
        to every page, inside every game, and around every result.
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
            <div className="font-display text-3xl font-extrabold text-gold">{s.value}</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/70">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm font-semibold text-white/65">
        Live numbers from this environment. The pitch is replay value: players run the games
        back again and again in a session, and your brand is on screen for every single play.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PLACEMENTS.map((p) => (
          <div key={p.title} className="panel flex gap-4 p-5">
            <span className="text-3xl">{p.emoji}</span>
            <div>
              <h3 className="font-display text-lg font-extrabold">{p.title}</h3>
              <p className="mt-1 text-base font-semibold text-white/85">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-3xl font-extrabold">How it works</h2>
          <ol className="mt-4 space-y-4 text-base font-bold text-white/90">
            {[
              "Tell us about your brand with the form — it takes a minute.",
              "We reach out within a day to pick your date and collect your logo and link.",
              "Your day arrives: your brand is on every page, every card back, every felt, and every result popup.",
              "You get a recap of impressions, plays, and clicks from your sponsored day.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-win font-display text-base font-extrabold text-black shadow-[0_3px_0_var(--win-deep)]">
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
