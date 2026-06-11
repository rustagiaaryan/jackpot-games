# 🕹️ 1K Arcade

Free-to-play arcade games with a real **$1,000 prize**. Players verify a phone
number, pick a game, and if they beat it the money is theirs — every winner
gets paid, no strings attached. Built from [PRD.md](./PRD.md) (v2).

| Game | Win condition |
| --- | --- |
| 🃏 **High Low** | Call higher/lower through all 52 cards (Ace low, equal ends the run) |
| 🎲 **Dice Sweep** | Roll 3 dice — all at once or one at a time — and lock in **every total 3–18 in any order**; repeating a locked total ends the run |

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS 4** — bold, colorful Stake-inspired theme
- **Framer Motion** + **canvas-confetti** — 3D card flips, real tumbling 3D
  dice cubes, sponsor-bordered loss popups, confetti win celebrations
- **Prisma 6 + SQLite** locally (swap to Postgres for production — schema is portable)
- **Zod** for API input validation

## Quick start

```bash
npm install            # also runs `prisma generate`
npm run db:push        # create prisma/dev.db from the schema
npm run db:seed        # admin user, today's demo sponsor, demo leaderboard data
npm run dev            # http://localhost:3000
```

**Demo login:** SMS is mocked by default (`MOCK_SMS=true`). Enter any US phone
number, then code **`123456`** (the per-request code is also printed in the
server console).

**Admin dashboard:** log in with **`+1 555 555 0100`** (set by `ADMIN_PHONE`),
then visit `/admin` — winner review queue with full session replays, sponsor
management, sponsor inquiries, prize control, analytics.

Other scripts: `npm run build` · `npm start` · `npm run lint` · `npm run db:reset`

## Environment variables

See [.env.example](./.env.example) for full docs. Highlights:

| Var | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | SQLite locally; Postgres URL in production |
| `PRIZE_AMOUNT` | `1000` | Per-win prize (live-editable from `/admin`) |
| `MOCK_SMS` | `true` | Mock SMS mode; flip to `false` once Twilio is wired in `lib/sms.ts` |
| `ADMIN_PHONE` | `+15555550100` | Phone number that gets admin access |
| `OWNER_EMAIL` | `rustagiaaryan@gmail.com` | Where owner notifications are addressed |
| `APP_TIMEZONE` | `America/Los_Angeles` | Daily reset boundary for limits/leaderboards |

## How the security model works

- **Hidden outcomes never reach the client.** Each attempt is a `GameSession`
  row whose `secretState` column holds the server-authoritative state (the
  shuffled deck / locked totals / mid-turn dice). API responses are built only
  from `Public*` types ([lib/games/types.ts](lib/games/types.ts)). Every die is
  generated server-side *at roll time*, so future rolls never exist anywhere.
  All randomness is `crypto.randomInt` (CSPRNG), never `Math.random`.
- **Sessions can't be replayed or forged.** Finished sessions reject further
  actions; starting a new game abandons any active one (multi-tab/refresh safe);
  every action is appended to a timestamped history used for win review.
  Refresh resumes the active session, including mid-turn dice.
- **500 plays/day** enforced at game start (an in-flight game may finish —
  PRD §17). Displayed live in the nav with the info popover.
- **Anti-bot layers:** sliding-window rate limits (OTP per phone+IP, game-start
  cooldown + burst caps, action caps), an arithmetic human check every 25 games
  (Turnstile swap point in [lib/antibot.ts](lib/antibot.ts)), and play-speed
  heuristics that flag sub-250ms action streaks, alert the owner, and route
  wins to manual review.
- **Winner flow:** confetti celebration → payout form (Venmo/Zelle/PayPal/
  Cash App, pre-filled from profile) → `Win` row stored `needs_review` →
  owner notified with full game replay and fraud indicators.

## Project layout

```
app/                  pages (home, games, game pages, leaderboards, profile,
                      login, terms, privacy, sponsor, admin) + API routes
components/           UI: pinned sponsor banner, nav, login flow, game shell
                      with bulletin rules, the two games, 3D dice, loss popup,
                      payout forms, admin dashboard
lib/                  auth, sms, phone, rate limiting, anti-bot, notifications,
                      settings, leaderboards, stats
lib/games/            engines: highlow / dice + session orchestration
prisma/               schema + seed
```

## Before public launch

See **[TODO_PRODUCTION.md](./TODO_PRODUCTION.md)** — real SMS verification,
email delivery, Postgres, Turnstile, attorney review of the Terms, and more.
