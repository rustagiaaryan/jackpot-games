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

export function NavBar({ initialPrize }: { initialPrize: number }) {
  const { me, loading, refresh } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const prize = me?.prize ?? initialPrize;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserOpen(false);
    await refresh();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b-2 border-white/[0.07] bg-[#0e1e2b]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-win to-win-deep text-xl shadow-[0_0_18px_rgba(0,230,92,0.45)] transition-transform group-hover:rotate-6">
              🕹️
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">
              1K<span className="text-win"> Arcade</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-base font-bold transition-colors ${
                  pathname?.startsWith(l.href)
                    ? "bg-white/[0.1] text-white"
                    : "text-white/80 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* The prize is always visible in the sticky header (PRD §4):
              win ANY game and this is yours — every winner gets it. */}
          <Link
            href="/games"
            className="chip border-gold/60 bg-gold/15 text-gold animate-glow-pulse hover:bg-gold/25"
            title={`Win any game, win $${prize.toLocaleString()}. No strings attached.`}
          >
            <span aria-hidden>💰</span>
            <span className="font-display font-extrabold">WIN ${prize.toLocaleString()}</span>
          </Link>

          {me?.user && <PlaysLeftChip />}

          {!loading && !me?.user && (
            <Link href="/login" className="btn-win !px-4 !py-2 !text-sm">
              Log in / Sign up
            </Link>
          )}

          {me?.user && (
            <div className="relative">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border-2 border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm font-bold text-white hover:bg-white/[0.12] cursor-pointer"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-violet/60 text-xs font-extrabold">
                  {me.user.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate sm:inline">{me.user.displayName}</span>
                <span className="text-white/50">▾</span>
              </button>
              {userOpen && (
                <div
                  className="panel absolute right-0 top-11 z-50 w-48 overflow-hidden !rounded-xl p-1 text-sm font-bold animate-pop-in"
                  onMouseLeave={() => setUserOpen(false)}
                >
                  <Link
                    href="/profile"
                    onClick={() => setUserOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-white hover:bg-white/[0.1]"
                  >
                    My profile
                  </Link>
                  {me.user.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-gold hover:bg-white/[0.1]"
                    >
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-white/75 hover:bg-white/[0.1] cursor-pointer"
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
            className="grid h-10 w-10 place-items-center rounded-lg border-2 border-white/20 text-lg text-white md:hidden cursor-pointer"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t-2 border-white/[0.07] px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-base font-bold text-white hover:bg-white/[0.08]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
