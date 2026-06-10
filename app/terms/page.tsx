import { getJackpotAmount } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = { title: "Terms & Conditions — Jackpot Arcade" };

// ⚠️ LEGAL NOTE (PRODUCTION): These Terms and Conditions are a working draft
// written for product development. They MUST be reviewed by a qualified
// attorney (sweepstakes/promotions law varies by state) before the site is
// publicly launched with real-money prizes.

export default async function TermsPage() {
  const jackpot = await getJackpotAmount();
  const j = `$${jackpot.toLocaleString()}`;

  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "1. The Service",
      body: (
        <>
          Jackpot Arcade offers <b>free-to-play</b> jackpot games. No purchase or payment is
          necessary to play or to win. The current jackpot is <b>{j}</b>. A user wins by fully
          completing one of the games according to the official rules below.
        </>
      ),
    },
    {
      title: "2. Official Game Rules",
      body: (
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <b>High Low:</b> a shuffled 52-card deck; Ace is low (A=1, K=13). Guess whether each
            next card is higher or lower. A wrong guess or an equal-rank card ends the game.
            Revealing all 52 cards wins.
          </li>
          <li>
            <b>Dice Staircase:</b> roll two dice and hit the sums 8, 7, 6, 5, 4, 3, 2 in exact
            order. Any other sum ends the game. Completing the full sequence wins.
          </li>
          <li>
            <b>Doors Challenge:</b> pick the one correct door per room across 8 levels with 1,
            2, 4, 8, 16, 32, 64, then 2 doors. A wrong door ends the game. Clearing Level 8 wins.
          </li>
        </ul>
      ),
    },
    {
      title: "3. Payouts",
      body: (
        <>
          Winners choose their preferred payout method: <b>Venmo, Zelle, PayPal, or Cash App</b>.
          Verified wins are paid <b>within one month</b> of verification. The site owner may
          review any win — including the full game session replay — before payout, and may
          request additional identity verification. The user is responsible for providing
          accurate payout information; the site is not responsible for delays caused by
          incorrect payout details.
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
          Each account is limited to <b>500 total game attempts per day</b> across all games.
          The limit resets daily and exists to keep the games fair and protect the jackpot
          system.
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
          The jackpot amount may be updated in the future. These terms may change; continued use
          of the site after changes constitutes acceptance.
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        Terms &amp; Conditions<span className="text-gold">.</span>
      </h1>
      <p className="mt-2 text-sm text-white/55">
        The short version: it’s free, play fair, complete a game and we pay you {j}.
      </p>

      <div className="panel mt-8 space-y-7 p-7 text-sm leading-relaxed text-white/75">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display mb-2 text-base font-bold text-white">{s.title}</h2>
            <div>{s.body}</div>
          </section>
        ))}
        <p className="border-t border-white/10 pt-5 text-xs text-white/40">
          Draft for development. To be reviewed by a qualified attorney before public launch
          with real-money prizes. Last updated June 2026.
        </p>
      </div>
    </div>
  );
}
