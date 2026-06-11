import { getPrizeAmount } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = { title: "Terms & Conditions — 1K Arcade" };

// ⚠️ LEGAL NOTE (PRODUCTION): These Terms and Conditions are a working draft
// written for product development. They MUST be reviewed by a qualified
// attorney (sweepstakes/promotions law varies by state) before the site is
// publicly launched with real-money prizes.

export default async function TermsPage() {
  const prize = await getPrizeAmount();
  const p = `$${prize.toLocaleString()}`;

  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "1. The Service",
      body: (
        <>
          1K Arcade offers <b>free-to-play</b> games with a real cash prize. No purchase or
          payment is necessary to play or to win. The prize for beating any game is <b>{p}</b>,
          and <b>every verified winner receives it</b> — it is not a shared pot and it never
          runs out. A user wins by fully completing a game according to the official rules below.
        </>
      ),
    },
    {
      title: "2. Official Game Rules",
      body: (
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <b>High Low:</b> a shuffled 52-card deck; Ace is low (A=1, K=13). Call whether each
            next card is higher or lower. A wrong call or an equal-rank card ends the run.
            Revealing all 52 cards wins.
          </li>
          <li>
            <b>Dice Sweep:</b> roll three dice — all at once or one at a time — and collect
            every total from 3 to 18 in any order. Rolling a total that has already been
            collected ends the run. Collecting all 16 totals wins.
          </li>
        </ul>
      ),
    },
    {
      title: "3. Payouts",
      body: (
        <>
          Winners choose their preferred payout method: <b>Venmo, Zelle, PayPal, or Cash App</b>.
          Verified wins are paid <b>within one month</b>. The site owner may review any win —
          including the full game session replay — before payout, and may request additional
          identity verification. The user is responsible for providing accurate payout
          information; the site is not responsible for delays caused by incorrect payout details.
        </>
      ),
    },
    {
      title: "4. Fair Play",
      body: (
        <>
          Users may not use bots, scripts, automation, exploits, modified clients, fake
          accounts, disposable or temporary phone numbers, or any other unfair method. Users may
          not attempt to reverse engineer, manipulate, or interfere with game outcomes. The site
          owner has the right to refuse payout if cheating, botting, automation, account abuse,
          fake identity, tampering, or suspicious behavior is detected, and may suspend or ban
          accounts for abuse.
        </>
      ),
    },
    {
      title: "5. Daily Limit",
      body: (
        <>
          Each account gets <b>500 game plays per day</b> across all games. The limit resets
          daily and keeps the games fair for everyone.
        </>
      ),
    },
    {
      title: "6. Accounts",
      body: (
        <>
          Playing requires a free account verified with a real phone number. One account per
          person. Phone numbers are never displayed publicly. Accounts may be suspended for
          violations of these terms.
        </>
      ),
    },
    {
      title: "7. Sponsors",
      body: (
        <>
          Sponsor logos and links may appear throughout the site and inside games. Sponsors do
          not influence game outcomes.
        </>
      ),
    },
    {
      title: "8. Changes",
      body: (
        <>
          The prize amount may be updated in the future. These terms may change; continued use
          of the site after changes constitutes acceptance.
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
        Terms &amp; Conditions<span className="text-win">.</span>
      </h1>
      <p className="mt-2 text-lg font-bold text-white/90">
        The short version: it’s free, play fair, beat a game and we pay you {p}.
      </p>

      <div className="panel mt-8 space-y-7 p-7 text-base font-semibold leading-relaxed text-white/90">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display mb-2 text-xl font-extrabold text-white">{s.title}</h2>
            <div>{s.body}</div>
          </section>
        ))}
        <p className="border-t-2 border-white/10 pt-5 text-sm font-semibold text-white/60">
          Draft for development. To be reviewed by a qualified attorney before public launch
          with real-money prizes. Last updated June 2026.
        </p>
      </div>
    </div>
  );
}
