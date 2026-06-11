# TODO before public launch

Everything below is **mocked or simplified for development** and must be
connected/hardened before launching publicly with real-money prizes. Each item
lists the exact swap point in code.

## 1. Real SMS verification — REQUIRED

- **Where:** `lib/sms.ts` (`sendVerificationSms`), env `MOCK_SMS=false`.
- Recommended: **Twilio Verify** (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
  `TWILIO_VERIFY_SERVICE_SID` are already stubbed in `.env.example`).
- Also implement disposable/VoIP screening in `lib/phone.ts` →
  `screenPhone()` using **Twilio Lookup line-type intelligence** (reject/flag
  `voip`/`prepaid` line types and known online-SMS-receiver ranges — PRD §5.2).
- Remove the demo code `123456` path (it disables itself when `MOCK_SMS=false`,
  but verify).

## 2. Owner email notifications — REQUIRED

- **Where:** `lib/notifications.ts` (`notifyOwner`) — currently writes to the
  admin dashboard + console only.
- Wire **Resend** (or SendGrid/Postmark) to `OWNER_EMAIL`
  (rustagiaaryan@gmail.com). Prize wins should also send an SMS to the owner.
- Sponsor-inquiry submissions (`app/api/sponsor/interest/route.ts`) ride the
  same pipe — once email works, inquiries land in your inbox automatically.

## 3. Production database — REQUIRED

- **Where:** `prisma/schema.prisma` (`provider = "sqlite"`) + `DATABASE_URL`.
- Move to managed **Postgres** (Neon/Supabase/RDS): change provider to
  `postgresql`, run `prisma migrate deploy`. No app-code changes needed.
- Do **not** run `prisma/seed.ts` in production (it creates demo users/sponsor).
- Set a real `ADMIN_PHONE` before first deploy — that number becomes admin.

## 4. Distributed rate limiting — REQUIRED if >1 instance

- **Where:** `lib/rateLimit.ts` — in-memory sliding window, single-process only.
- Swap to **Upstash Redis / @upstash/ratelimit** (single call site:
  `checkRateLimit`). Without this, limits silently reset per serverless instance.

## 5. Real CAPTCHA / human verification — STRONGLY RECOMMENDED

- **Where:** `lib/antibot.ts` (`issueHumanCheck` / `verifyHumanCheck`) and
  `app/api/human-check/route.ts`; client modal in `components/game/GameShell.tsx`.
- Replace the arithmetic check with **Cloudflare Turnstile** (invisible for
  most users). Keys stubbed in `.env.example`.
- Consider device fingerprinting (FingerprintJS) for multi-account detection
  and IP-reputation/VPN screening at signup (PRD §15.3).

## 6. Payout & win verification process — MANUAL, DOCUMENT IT

- Payouts are manual by design: review the win in `/admin` (full session
  replay + fraud indicators), verify the player, then send via
  Venmo/Zelle/PayPal/CashApp and mark `paid`.
- **TODO:** write down your verification checklist (identity vs. payout name,
  replay sanity, account age/speed flags) before the first real payout.
- If payouts are ever automated, add payment verification in
  `app/api/wins/confirm-payout/route.ts`.

## 7. Legal review — REQUIRED

- `/terms` and `/privacy` are development drafts. **Have a qualified attorney
  review them** (sweepstakes/promotion law varies by state; "no purchase
  necessary" games with prizes have specific requirements, e.g. NY/FL
  registration thresholds, official-rules formatting).

## 8. Sponsor pipeline — NICE TO HAVE

- Inquiries currently go to the admin dashboard (+ email once #2 is done);
  you reach out and nurture manually — by design for now.
- Later: self-serve booking (Stripe checkout + date picker) in
  `app/sponsor` / `app/api/sponsor/interest`.
- Sponsor logos are URL-based; add real upload (S3/UploadThing) in
  `/admin` → Sponsors if needed.

## 9. Infra & hardening checklist

- [ ] Deploy behind HTTPS (session cookie is `secure` in production already).
- [ ] Set `APP_TIMEZONE` to your canonical reset timezone.
- [ ] Error monitoring (Sentry) + uptime checks.
- [ ] Backups for the database (winner records must be durable — PRD §14.4).
- [ ] Add a CSP header and review `next.config.ts` security headers.
- [ ] Load-test game endpoints; add Redis caching for leaderboards if needed
      (`lib/leaderboard.ts` has the note).
- [ ] Penetration pass: attempt session replay, multi-tab, tampered requests
      (the protections exist — verify them against the real deployment).
- [ ] Remove demo seed data and the `+1555…` demo-number allowance
      (`lib/phone.ts`).
