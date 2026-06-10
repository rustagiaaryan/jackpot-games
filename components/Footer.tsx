import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.07] bg-[#0a0a14]/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display font-bold text-white/80">
            🎰 Jackpot <span className="text-gold">Arcade</span>
          </div>
          <p className="mt-1 max-w-md text-xs leading-relaxed">
            Free-to-play jackpot mini-games. No purchase necessary. Complete any game to win
            the jackpot — see the official rules in the Terms.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <Link href="/games" className="hover:text-white">Games</Link>
          <Link href="/leaderboards" className="hover:text-white">Leaderboards</Link>
          <Link href="/sponsor" className="hover:text-white">Become a Sponsor</Link>
          <Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
