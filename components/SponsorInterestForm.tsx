"use client";

import { useState } from "react";

// Sponsor interest form. Submissions are stored for the admin dashboard and
// an owner notification addressed to OWNER_EMAIL (rustagiaaryan@gmail.com) is
// created — real email delivery is a PRODUCTION TODO in lib/notifications.ts.

const FIELDS = [
  { name: "companyName", label: "Company name", required: true, placeholder: "Acme Inc." },
  { name: "contactName", label: "Your name", required: true, placeholder: "Jane Smith" },
  { name: "email", label: "Work email", required: true, placeholder: "jane@acme.com", type: "email" },
  { name: "phone", label: "Phone (optional)", required: false, placeholder: "(555) 123-4567" },
  { name: "website", label: "Company website (optional)", required: false, placeholder: "https://acme.com" },
  { name: "budget", label: "Rough budget (optional)", required: false, placeholder: "$250 / day" },
  { name: "preferredDates", label: "Preferred date(s) (optional)", required: false, placeholder: "July 4 week" },
] as const;

export function SponsorInterestForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("busy");
    setError(null);
    try {
      const res = await fetch("/api/sponsor/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, message: message || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "sent") {
    return (
      <div className="panel grid place-items-center p-10 text-center animate-pop-in">
        <span className="text-4xl">🤝</span>
        <h3 className="font-display mt-3 text-xl font-bold">Thanks — we’ll be in touch!</h3>
        <p className="mt-2 max-w-xs text-sm text-white/60">
          Your inquiry is in. We typically reply within one business day to lock in your
          sponsored day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel space-y-4 p-6">
      <h3 className="font-display text-lg font-bold">Sponsor interest form</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.name === "companyName" || f.name === "email" ? "sm:col-span-1" : ""}>
            <label htmlFor={f.name} className="mb-1 block text-xs font-medium text-white/60">
              {f.label}
            </label>
            <input
              id={f.name}
              type={"type" in f ? f.type : "text"}
              required={f.required}
              placeholder={f.placeholder}
              value={values[f.name] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              className="input"
            />
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-xs font-medium text-white/60">
          Anything else? (optional)
        </label>
        <textarea
          id="message"
          rows={3}
          maxLength={1000}
          placeholder="Goals, campaign timing, creative questions…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input resize-none"
        />
      </div>
      {error && (
        <p className="animate-shake rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={status === "busy"} className="btn-gold w-full !py-3">
        {status === "busy" ? "Sending…" : "Request sponsorship info"}
      </button>
    </form>
  );
}
