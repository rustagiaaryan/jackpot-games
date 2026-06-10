"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import type { GameMeta } from "@/lib/games/meta";
import { PAYOUT_METHODS } from "@/components/PayoutSection";

// Jackpot winner flow (PRD §14): big celebration with confetti, the win
// message, then the payout confirmation form. If the player already saved
// payout info it is pre-filled for confirmation; otherwise they fill it now.
// The owner has already been notified server-side at the moment of the win.

export function WinOverlay({
  jackpot,
  gameSessionId,
  meta,
}: {
  jackpot: number;
  gameSessionId: string;
  meta: GameMeta;
}) {
  const [form, setForm] = useState({ fullName: "", method: "venmo", handle: "", note: "" });
  const [hadSaved, setHadSaved] = useState(false);
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<"form" | "busy" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  // Confetti barrage 🎉
  useEffect(() => {
    const fire = (particleRatio: number, opts: confetti.Options) =>
      confetti({
        particleCount: Math.floor(260 * particleRatio),
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f6c544", "#ffe9a8", "#a78bfa", "#34d399", "#ffffff"],
        ...opts,
      });
    fire(0.3, { startVelocity: 55 });
    fire(0.25, { angle: 60, origin: { x: 0 } });
    fire(0.25, { angle: 120, origin: { x: 1 } });
    const interval = setInterval(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        startVelocity: 35,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: ["#f6c544", "#ffe9a8", "#ffffff"],
      });
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  // Pre-fill from saved payout info (PRD §13.3: confirm or update on win).
  useEffect(() => {
    fetch("/api/profile/payout")
      .then((r) => r.json())
      .then((d) => {
        if (d.payout) {
          setHadSaved(true);
          setForm({
            fullName: d.payout.fullName,
            method: d.payout.method,
            handle: d.payout.handle,
            note: d.payout.note ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("busy");
    setError(null);
    try {
      const res = await fetch("/api/wins/confirm-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSessionId,
          ...form,
          note: form.note || undefined,
          agreeToTerms: agree,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save payout info.");
      setStatus("done");
    } catch (err) {
      setStatus("form");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="mx-auto grid min-h-full max-w-lg place-items-center p-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="panel gold-ring w-full p-7 text-center"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.8 }}
            className="text-6xl"
          >
            🏆
          </motion.div>
          <h2 className="font-display mt-3 text-2xl font-extrabold sm:text-3xl">
            <span className="text-gold-shimmer">Congratulations!</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            You completed the challenge and won the{" "}
            <b className="text-gold">${jackpot.toLocaleString()} jackpot</b>. ({meta.winnerLabel})
          </p>

          {status === "done" ? (
            <div className="mt-6 animate-pop-in">
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                ✓ Payout details received. We’ll verify your win and send your $
                {jackpot.toLocaleString()} within one month. The site owner has been notified.
              </p>
              <Link href="/profile" className="btn-gold mt-4 w-full">
                View my profile
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-4 rounded-xl bg-white/[0.05] px-4 py-3 text-xs leading-relaxed text-white/60">
                Please confirm how you would like to be paid. Payouts are sent through Venmo,
                Zelle, PayPal, or Cash App within one month, subject to verification and the
                Terms and Conditions.
              </p>
              {hadSaved && (
                <p className="mt-2 text-xs text-gold/90">
                  We pre-filled your saved payout info — confirm or update it below.
                </p>
              )}
              <form onSubmit={submit} className="mt-4 space-y-3 text-left">
                <input
                  required
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="input"
                />
                <div className="grid grid-cols-4 gap-2">
                  {PAYOUT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, method: m.value }))}
                      className={`rounded-lg border px-1 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        form.method === m.value
                          ? "border-gold/70 bg-gold/15 text-gold"
                          : "border-white/15 text-white/60 hover:border-white/35"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <input
                  required
                  placeholder="Payment handle / email / phone"
                  value={form.handle}
                  onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
                  className="input"
                />
                <label className="flex items-start gap-2 text-[11px] leading-relaxed text-white/60">
                  <input
                    type="checkbox"
                    required
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--gold)]"
                  />
                  <span>
                    I confirm this payout info is accurate and agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-gold underline">
                      Terms and Conditions
                    </Link>
                    , including win verification.
                  </span>
                </label>
                {error && <p className="animate-shake text-xs text-red-300">{error}</p>}
                <button type="submit" disabled={status === "busy"} className="btn-gold w-full !py-3">
                  {status === "busy" ? "Saving…" : hadSaved ? "Confirm payout info" : "Submit payout info"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
