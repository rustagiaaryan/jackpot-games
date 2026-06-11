import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-white/[0.07] bg-[#0e1e2b]/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-base sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-lg font-extrabold text-white">
            🕹️ 1K <span className="text-win">Arcade</span>
          </div>
          <p className="mt-1 max-w-md text-sm font-semibold leading-relaxed text-white/75">
            Free-to-play games with a real $1,000 prize. Beat any game, get paid — no purchase
            necessary, no strings attached.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-white/80">
          <Link href="/games" className="hover:text-win">Games</Link>
          <Link href="/leaderboards" className="hover:text-win">Leaderboards</Link>
          <Link href="/sponsor" className="hover:text-win">Become a Sponsor</Link>
          <Link href="/terms" className="hover:text-win">Terms &amp; Conditions</Link>
          <Link href="/privacy" className="hover:text-win">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
