"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import type { GameMeta } from "@/lib/games/meta";
import { PAYOUT_METHODS } from "@/components/PayoutSection";

// Winner flow (PRD §14): big celebration with confetti, the win message,
// then the payout confirmation form. If the player already saved payout info
// it is pre-filled for confirmation; otherwise they fill it now. The owner
// has already been notified server-side at the moment of the win.

export function WinOverlay({
  prize,
  gameSessionId,
  meta,
}: {
  prize: number;
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
        colors: ["#ffd23f", "#00e65c", "#29d8ff", "#a06bff", "#ffffff"],
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
        colors: ["#ffd23f", "#00e65c", "#ffffff"],
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md">
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
          <h2 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl">
            <span className="text-gold-shimmer">YOU WON ${prize.toLocaleString()}!</span>
          </h2>
          <p className="mt-2 text-lg font-extrabold text-white">
            You beat {meta.name}. The money is yours — no strings attached.
          </p>

          {status === "done" ? (
            <div className="mt-6 animate-pop-in">
              <p className="rounded-xl border-2 border-win/50 bg-win/10 px-4 py-3 text-base font-bold text-win">
                ✓ Payout details received. We’ll verify your win and send your $
                {prize.toLocaleString()} within one month. The site owner has been notified.
              </p>
              <Link href="/profile" className="btn-win mt-4 w-full">
                View my profile
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-4 rounded-xl bg-white/[0.07] px-4 py-3 text-sm font-semibold leading-relaxed text-white/85">
                Tell us how you’d like your ${prize.toLocaleString()}. Payouts go out through
                Venmo, Zelle, PayPal, or Cash App within one month, subject to verification and
                the Terms and Conditions.
              </p>
              {hadSaved && (
                <p className="mt-2 text-sm font-bold text-gold">
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
                      className={`rounded-lg border-2 px-1 py-2 text-xs font-extrabold transition-colors cursor-pointer ${
                        form.method === m.value
                          ? "border-win bg-win/20 text-win"
                          : "border-white/20 text-white/75 hover:border-white/45"
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
                <label className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-white/80">
                  <input
                    type="checkbox"
                    required
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--win)]"
                  />
                  <span>
                    I confirm this payout info is accurate and agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-win underline">
                      Terms and Conditions
                    </Link>
                    , including win verification.
                  </span>
                </label>
                {error && <p className="animate-shake text-sm font-bold text-red-300">{error}</p>}
                <button type="submit" disabled={status === "busy"} className="btn-win w-full !py-3.5">
                  {status === "busy" ? "Saving…" : hadSaved ? "CONFIRM PAYOUT INFO" : "SUBMIT PAYOUT INFO"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
