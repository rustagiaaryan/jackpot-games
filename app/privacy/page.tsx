export const metadata = { title: "Privacy — Jackpot Arcade" };

// ⚠️ LEGAL NOTE (PRODUCTION): like the Terms, this privacy policy is a
// development draft and must be reviewed by a qualified attorney before launch.

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        Privacy &amp; account info<span className="text-gold">.</span>
      </h1>
      <div className="panel mt-8 space-y-6 p-7 text-sm leading-relaxed text-white/75">
        <section>
          <h2 className="font-display mb-2 text-base font-bold text-white">What we collect</h2>
          <p>
            Your phone number (for account verification and fraud prevention), a display name
            you choose, your game activity (attempts, progress, results), and — only if you win
            or add it yourself — payout details (payment handle and full name).
          </p>
        </section>
        <section>
          <h2 className="font-display mb-2 text-base font-bold text-white">
            What is shown publicly
          </h2>
          <p>
            Only your display name and game progress appear on leaderboards. Your phone number
            is <b>never displayed publicly</b> and is shown partially masked even to you.
          </p>
        </section>
        <section>
          <h2 className="font-display mb-2 text-base font-bold text-white">How data is used</h2>
          <p>
            To run the games, enforce the daily play limit, detect cheating and bot activity,
            pay winners, and contact you about a win. We do not sell your personal data.
            Sponsors see aggregate site statistics only — never your phone number.
          </p>
        </section>
        <section>
          <h2 className="font-display mb-2 text-base font-bold text-white">Your choices</h2>
          <p>
            You can edit your payout info at any time on your profile, and you can request
            account deletion by contacting support.
          </p>
        </section>
        <p className="border-t border-white/10 pt-5 text-xs text-white/40">
          Draft for development — to be reviewed by counsel before public launch.
        </p>
      </div>
    </div>
  );
}
