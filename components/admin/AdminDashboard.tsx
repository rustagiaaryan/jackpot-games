"use client";

import { useCallback, useEffect, useState } from "react";
import { GAME_META } from "@/lib/games/meta";
import type { GameType } from "@/lib/games/types";

// Owner dashboard (PRD §21): win review queue with session replays, sponsor
// management, sponsor inquiries, jackpot control, and site analytics.

type Tab = "overview" | "winners" | "sponsors" | "inquiries";

interface Stats {
  totalUsers: number;
  totalGames: number;
  gamesToday: number;
  totalWinners: number;
  winnersToday: number;
  flaggedUsers: number;
  sponsorClicksTotal: number;
  perGame: { gameType: GameType; totalPlays: number; playsToday: number; avgProgress: number; bestToday: number }[];
}

interface WinRow {
  id: string;
  gameType: string;
  wonAt: string;
  jackpotAmount: number;
  payoutStatus: string;
  reviewStatus: string;
  fraudNotes: string | null;
  payoutMethod: string | null;
  payoutHandle: string | null;
  payoutName: string | null;
  gameSessionId: string;
  user: { displayName: string; phone: string; flagged: boolean; flagReason: string | null };
  gameSession: { history: string; suspicious: boolean; suspicionReason: string | null; startedAt: string; endedAt: string | null };
}

interface SponsorRow {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl: string | null;
  tagline: string | null;
  activeDate: string;
  clickCount: number;
}

interface InquiryRow {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  budget: string | null;
  preferredDates: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const PAYOUT_STATUSES = ["pending", "approved", "paid", "rejected", "needs_review"];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [wins, setWins] = useState<WinRow[]>([]);
  const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [jackpotInput, setJackpotInput] = useState("");
  const [expandedWin, setExpandedWin] = useState<string | null>(null);
  const [sponsorForm, setSponsorForm] = useState({ name: "", websiteUrl: "", logoUrl: "", tagline: "", activeDate: "" });

  const loadAll = useCallback(async () => {
    const [s, w, sp, iq, n] = await Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/winners").then((r) => r.json()),
      fetch("/api/admin/sponsors").then((r) => r.json()),
      fetch("/api/admin/inquiries").then((r) => r.json()),
      fetch("/api/admin/notifications").then((r) => r.json()),
    ]);
    if (s && !s.error) setStats(s);
    setWins(w.wins ?? []);
    setSponsors(sp.sponsors ?? []);
    setInquiries(iq.inquiries ?? []);
    setNotifications(n.notifications ?? []);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const updateWin = async (winId: string, patch: Record<string, string>) => {
    await fetch("/api/admin/winners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winId, ...patch }),
    });
    loadAll();
  };

  const updateJackpot = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(jackpotInput, 10);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await fetch("/api/admin/jackpot", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    setJackpotInput("");
    window.location.reload(); // jackpot is rendered server-side everywhere
  };

  const createSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/sponsors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sponsorForm,
        logoUrl: sponsorForm.logoUrl || undefined,
        tagline: sponsorForm.tagline || undefined,
      }),
    });
    if (res.ok) {
      setSponsorForm({ name: "", websiteUrl: "", logoUrl: "", tagline: "", activeDate: "" });
      loadAll();
    } else {
      alert((await res.json()).error ?? "Could not create sponsor.");
    }
  };

  const deleteSponsor = async (id: string) => {
    if (!confirm("Delete this sponsor day?")) return;
    await fetch(`/api/admin/sponsors?id=${id}`, { method: "DELETE" });
    loadAll();
  };

  const setInquiryStatus = async (id: string, status: string) => {
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadAll();
  };

  const markRead = async (id: string) => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    loadAll();
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">
        Owner dashboard<span className="text-gold">.</span>
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["overview", `Overview${unread ? ` (${unread})` : ""}`],
            ["winners", `Winners (${wins.length})`],
            ["sponsors", "Sponsors"],
            ["inquiries", `Inquiries (${inquiries.filter((i) => i.status === "new").length} new)`],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              tab === t ? "bg-gold text-black" : "bg-white/[0.06] text-white/70 hover:bg-white/[0.12]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 space-y-6">
          {stats && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                {[
                  ["Players", stats.totalUsers],
                  ["Plays today", stats.gamesToday],
                  ["Plays all-time", stats.totalGames],
                  ["Winners", stats.totalWinners],
                  ["Winners today", stats.winnersToday],
                  ["Sponsor clicks", stats.sponsorClicksTotal],
                  ["Flagged users", stats.flaggedUsers],
                ].map(([label, value]) => (
                  <div key={label as string} className="panel p-4 text-center">
                    <div className="font-display text-xl font-bold text-gold">{value as number}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-white/45">{label}</div>
                  </div>
                ))}
              </div>
              <div className="panel overflow-x-auto p-5">
                <h2 className="font-display mb-3 font-bold">Per-game today</h2>
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-white/40">
                      <th className="py-1.5 font-medium">Game</th>
                      <th className="py-1.5 font-medium">Plays today</th>
                      <th className="py-1.5 font-medium">All-time</th>
                      <th className="py-1.5 font-medium">Avg progress</th>
                      <th className="py-1.5 font-medium">Best today</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {stats.perGame.map((g) => (
                      <tr key={g.gameType}>
                        <td className="py-2 font-medium">{GAME_META[g.gameType].name}</td>
                        <td className="py-2">{g.playsToday}</td>
                        <td className="py-2">{g.totalPlays}</td>
                        <td className="py-2">{g.avgProgress}</td>
                        <td className="py-2">{GAME_META[g.gameType].bestLabel(g.bestToday)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <form onSubmit={updateJackpot} className="panel flex flex-wrap items-end gap-3 p-5">
            <div>
              <label htmlFor="jackpot" className="mb-1 block text-xs font-medium text-white/60">
                Update jackpot amount ($)
              </label>
              <input
                id="jackpot"
                type="number"
                min={1}
                placeholder="1000"
                value={jackpotInput}
                onChange={(e) => setJackpotInput(e.target.value)}
                className="input w-40"
              />
            </div>
            <button type="submit" className="btn-gold">Update jackpot</button>
          </form>

          <div className="panel p-5">
            <h2 className="font-display mb-3 font-bold">Notifications</h2>
            {notifications.length === 0 && <p className="text-sm text-white/45">Nothing yet.</p>}
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-xl border p-3 text-sm ${
                    n.read ? "border-white/[0.07] text-white/45" : "border-gold/30 bg-gold/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{n.title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-[11px] text-white/40">
                      {new Date(n.createdAt).toLocaleString()}
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="text-gold underline cursor-pointer">
                          mark read
                        </button>
                      )}
                    </span>
                  </div>
                  <pre className="mt-1.5 whitespace-pre-wrap font-sans text-xs text-white/60">{n.body}</pre>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "winners" && (
        <div className="mt-6 space-y-3">
          {wins.length === 0 && (
            <p className="panel p-6 text-sm text-white/50">
              No jackpot winners yet. When someone completes a game, they appear here with the
              full session replay for review.
            </p>
          )}
          {wins.map((w) => (
            <div key={w.id} className={`panel p-5 ${w.gameSession.suspicious ? "border-red-400/40" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-display text-lg font-bold">
                    🏆 {w.user.displayName} — {GAME_META[w.gameType as GameType]?.name}
                  </span>
                  <div className="mt-0.5 text-xs text-white/50">
                    {new Date(w.wonAt).toLocaleString()} · ${w.jackpotAmount.toLocaleString()} ·
                    session {w.gameSessionId.slice(0, 10)}… · phone {w.user.phone}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <label className="text-white/50">Payout:</label>
                  <select
                    value={w.payoutStatus}
                    onChange={(e) => updateWin(w.id, { payoutStatus: e.target.value })}
                    className="input !w-auto !px-2 !py-1 text-xs"
                  >
                    {PAYOUT_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#15151f]">
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <label className="text-white/50">Review:</label>
                  <select
                    value={w.reviewStatus}
                    onChange={(e) => updateWin(w.id, { reviewStatus: e.target.value })}
                    className="input !w-auto !px-2 !py-1 text-xs"
                  >
                    {["needs_review", "approved", "rejected"].map((s) => (
                      <option key={s} value={s} className="bg-[#15151f]">
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-white/65 sm:grid-cols-2">
                <div>
                  💸 Payout info:{" "}
                  {w.payoutMethod
                    ? `${w.payoutMethod} — ${w.payoutHandle} (${w.payoutName})`
                    : "not submitted yet"}
                </div>
                <div>
                  ⚠️ Fraud indicators:{" "}
                  {w.gameSession.suspicious ? (
                    <span className="text-red-300">{w.gameSession.suspicionReason}</span>
                  ) : w.user.flagged ? (
                    <span className="text-red-300">account flagged: {w.user.flagReason}</span>
                  ) : (
                    "none detected"
                  )}
                </div>
              </div>
              <button
                onClick={() => setExpandedWin(expandedWin === w.id ? null : w.id)}
                className="mt-3 text-xs text-gold underline cursor-pointer"
              >
                {expandedWin === w.id ? "Hide" : "Show"} full game replay
              </button>
              {expandedWin === w.id && (
                <pre className="nice-scroll mt-2 max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-[11px] text-emerald-200/80">
                  {JSON.stringify(JSON.parse(w.gameSession.history), null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "sponsors" && (
        <div className="mt-6 space-y-6">
          <form onSubmit={createSponsor} className="panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <h2 className="font-display col-span-full font-bold">Add sponsor day</h2>
            {(
              [
                ["name", "Sponsor name *", "Nova Energy Drink"],
                ["websiteUrl", "Website URL *", "https://example.com"],
                ["logoUrl", "Logo URL (optional)", "https://…/logo.png"],
                ["tagline", "Tagline (optional)", "Fuel your lucky streak"],
                ["activeDate", "Active date * (YYYY-MM-DD)", "2026-06-11"],
              ] as const
            ).map(([key, label, ph]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-white/60">{label}</label>
                <input
                  value={sponsorForm[key]}
                  required={label.includes("*")}
                  placeholder={ph}
                  onChange={(e) => setSponsorForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="input"
                />
              </div>
            ))}
            <div className="flex items-end">
              <button type="submit" className="btn-gold w-full">Add sponsor</button>
            </div>
          </form>

          <div className="panel overflow-x-auto p-5">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-white/40">
                  <th className="py-1.5 font-medium">Date</th>
                  <th className="py-1.5 font-medium">Sponsor</th>
                  <th className="py-1.5 font-medium">Tagline</th>
                  <th className="py-1.5 font-medium">Clicks</th>
                  <th className="py-1.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {sponsors.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 font-mono text-xs">{s.activeDate}</td>
                    <td className="py-2 font-medium">
                      <a href={s.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-gold">
                        {s.name} ↗
                      </a>
                    </td>
                    <td className="py-2 text-white/55">{s.tagline ?? "—"}</td>
                    <td className="py-2">{s.clickCount}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteSponsor(s.id)} className="btn-danger !px-3 !py-1 !text-xs">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "inquiries" && (
        <div className="mt-6 space-y-3">
          {inquiries.length === 0 && (
            <p className="panel p-6 text-sm text-white/50">No sponsor inquiries yet.</p>
          )}
          {inquiries.map((q) => (
            <div key={q.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-display font-bold">{q.companyName}</span>
                  <span className="ml-2 text-xs text-white/50">
                    {q.contactName} · {q.email} {q.phone ? `· ${q.phone}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/40">{new Date(q.createdAt).toLocaleString()}</span>
                  <select
                    value={q.status}
                    onChange={(e) => setInquiryStatus(q.id, e.target.value)}
                    className="input !w-auto !px-2 !py-1 text-xs"
                  >
                    {["new", "contacted", "closed"].map((s) => (
                      <option key={s} value={s} className="bg-[#15151f]">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-white/60">
                {q.website && <div>🌐 {q.website}</div>}
                {q.budget && <div>💵 Budget: {q.budget}</div>}
                {q.preferredDates && <div>📅 Preferred: {q.preferredDates}</div>}
                {q.message && <div className="mt-1 text-white/70">“{q.message}”</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
