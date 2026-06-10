"use client";

import { useState } from "react";

export const PAYOUT_METHODS = [
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "paypal", label: "PayPal" },
  { value: "cashapp", label: "Cash App" },
] as const;

export interface PayoutValues {
  method: string;
  handle: string;
  fullName: string;
  note: string;
}

/** Editable preferred-payout form used on the profile page (PRD §13.3). */
export function PayoutSection({ initial }: { initial: PayoutValues | null }) {
  const [values, setValues] = useState<PayoutValues>(
    initial ?? { method: "venmo", handle: "", fullName: "", note: "" }
  );
  const [status, setStatus] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("busy");
    setError(null);
    try {
      const res = await fetch("/api/profile/payout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, note: values.note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <form onSubmit={save} className="panel space-y-4 p-6">
      <div>
        <span className="mb-1.5 block text-xs font-medium text-white/60">Preferred method</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PAYOUT_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setValues((v) => ({ ...v, method: m.value }))}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                values.method === m.value
                  ? "border-gold/70 bg-gold/15 text-gold"
                  : "border-white/15 bg-white/[0.04] text-white/65 hover:border-white/30"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="handle" className="mb-1.5 block text-xs font-medium text-white/60">
            Payment handle / email / phone
          </label>
          <input
            id="handle"
            required
            placeholder="@lucky-luke"
            value={values.handle}
            onChange={(e) => setValues((v) => ({ ...v, handle: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium text-white/60">
            Full name
          </label>
          <input
            id="fullName"
            required
            placeholder="Luke Lucky"
            value={values.fullName}
            onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
            className="input"
          />
        </div>
      </div>
      <div>
        <label htmlFor="note" className="mb-1.5 block text-xs font-medium text-white/60">
          Note (optional)
        </label>
        <input
          id="note"
          placeholder="Anything we should know"
          value={values.note}
          onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
          className="input"
        />
      </div>
      {error && (
        <p className="animate-shake rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={status === "busy"} className="btn-gold">
        {status === "busy" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save payout info"}
      </button>
    </form>
  );
}
