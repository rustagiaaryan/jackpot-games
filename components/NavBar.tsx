"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { PlaysLeftChip } from "@/components/PlaysLeftChip";

const LINKS = [
  { href: "/games", label: "Games" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/sponsor", label: "Sponsors" },
];

export function NavBar({ initialJackpot }: { initialJackpot: number }) {
  const { me, loading, refresh } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const jackpot = me?.jackpot ?? initialJackpot;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserOpen(false);
    await refresh();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0a0a14]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold to-gold-deep text-lg shadow-[0_0_18px_rgba(246,197,68,0.4)] transition-transform group-hover:rotate-6">
              🎰
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Jackpot<span className="text-gold"> Arcade</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  pathname?.startsWith(l.href)
                    ? "bg-white/[0.08] text-white"
                    : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Jackpot is always visible in the sticky header (PRD §4) */}
          <Link
            href="/games"
            className="chip border-gold/40 bg-gold/10 text-gold animate-glow-pulse hover:bg-gold/20"
            title="Complete any game to win."
          >
            <span aria-hidden>💰</span>
            <span className="font-bold">${jackpot.toLocaleString()}</span>
            <span className="hidden sm:inline text-gold/80">jackpot</span>
          </Link>

          {me?.user && <PlaysLeftChip />}

          {!loading && !me?.user && (
            <Link href="/login" className="btn-gold !px-4 !py-2 text-xs sm:text-sm">
              Log in / Sign up
            </Link>
          )}

          {me?.user && (
            <div className="relative">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 text-sm text-white/90 hover:bg-white/[0.1] cursor-pointer"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-500/40 text-xs font-bold">
                  {me.user.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate sm:inline">{me.user.displayName}</span>
                <span className="text-white/40">▾</span>
              </button>
              {userOpen && (
                <div
                  className="panel absolute right-0 top-11 w-44 overflow-hidden !rounded-xl p-1 text-sm animate-pop-in"
                  onMouseLeave={() => setUserOpen(false)}
                >
                  <Link
                    href="/profile"
                    onClick={() => setUserOpen(false)}
                    className="block rounded-lg px-3 py-2 text-white/85 hover:bg-white/[0.08]"
                  >
                    My profile
                  </Link>
                  {me.user.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserOpen(false)}
                      className="block rounded-lg px-3 py-2 text-gold hover:bg-white/[0.08]"
                    >
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-white/60 hover:bg-white/[0.08] cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/80 md:hidden cursor-pointer"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/[0.07] px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/[0.06]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
