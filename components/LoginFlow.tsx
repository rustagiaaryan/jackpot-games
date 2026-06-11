"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/components/SessionProvider";

// Phone-number login / signup flow (PRD §5.2):
// 1) phone → 2) SMS code (+ display name & terms for new accounts) → done.
// In mock SMS mode a helper note explains the demo code; the UI is identical
// to what a real Twilio-backed flow will look like.

type Step = "phone" | "code";

export function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const next = params.get("next") || "/games";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agree, setAgree] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send the code.");
      setIsNewUser(data.isNewUser);
      setMockMode(data.mockMode);
      setPhone(data.phone);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code,
          ...(isNewUser ? { displayName, agreeToTerms: agree } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed.");
      await refresh();
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel p-7">
      <h1 className="font-display text-2xl font-extrabold">
        {step === "phone" ? "Create a free account to play" : "Check your phone"}
      </h1>
      <p className="mt-1.5 text-base font-semibold text-white/85">
        {step === "phone"
          ? "We verify every player with a real phone number to keep the prize pool fair and real."
          : `We sent a 6-digit code to ${phone}.`}
      </p>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.form
            key="phone"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            onSubmit={requestCode}
            className="mt-6 space-y-4"
          >
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-extrabold text-white/90">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(555) 555-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input text-lg"
                required
              />
            </div>
            <button type="submit" disabled={busy} className="btn-win w-full !py-3.5">
              {busy ? "Sending…" : "Send verification code"}
            </button>
            <p className="text-center text-sm font-semibold leading-relaxed text-white/70">
              Free to play. No purchase necessary. By continuing you agree to our{" "}
              <Link href="/terms" className="underline hover:text-white/70">
                Terms &amp; Conditions
              </Link>
              . Your number is never shown publicly.
            </p>
          </motion.form>
        ) : (
          <motion.form
            key="code"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            onSubmit={verify}
            className="mt-6 space-y-4"
          >
            {mockMode && (
              <p className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
                🧪 Demo mode — SMS is mocked. Enter code <b>123456</b> (also printed in the
                server console).
              </p>
            )}
            <div>
              <label htmlFor="code" className="mb-1.5 block text-sm font-extrabold text-white/90">
                Verification code
              </label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="input text-center text-2xl tracking-[0.5em]"
                required
              />
            </div>

            {isNewUser && (
              <>
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-extrabold text-white/90">
                    Display name <span className="text-white/70">(shown on leaderboards)</span>
                  </label>
                  <input
                    id="name"
                    placeholder="LuckyLuke"
                    minLength={2}
                    maxLength={24}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-white/85">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--gold)]"
                    required
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-gold underline">
                      Terms &amp; Conditions
                    </Link>{" "}
                    — including the fair-play rules and the 500 plays/day limit.
                  </span>
                </label>
              </>
            )}

            <button type="submit" disabled={busy} className="btn-win w-full !py-3.5">
              {busy ? "Verifying…" : isNewUser ? "Create account & play" : "Log in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="w-full text-center text-xs text-white/75 hover:text-white/85 cursor-pointer"
            >
              ← Different number
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {error && (
        <p className="animate-shake mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
