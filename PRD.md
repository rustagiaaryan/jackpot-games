# PRD v2: 1K Arcade — Win-$1,000 Mini-Games Website

> v2 supersedes the original PRD. Changes from v1: the Doors Challenge was
> removed; the dice game was redesigned as **Dice Sweep** (three dice, collect
> every total 3–18, roll all at once or one at a time); the word **"jackpot"
> is banned** from all copy; all difficulty-negative copy is banned; the
> visual direction moved to a bold, colorful, Stake-style look; losses pop up
> over the game inside a sponsor-branded moving border; and the sponsor banner
> became big, bold, and pinned to every page.

## 1. Product Overview

1K Arcade is a free-to-play mini-games website. Users create a free account
with their phone number and play two skill-and-luck games. **Beating either
game wins $1,000 — every winner gets paid, no strings attached.** The prize
amount is configurable but starts at $1,000 and must be visible everywhere.

The two games:

1. **High Low** — call every next card higher or lower through a 52-card deck.
2. **Dice Sweep** — roll three dice and collect every total from 3 to 18 in
   any order; repeating a collected total ends the run.

---

## 2. Copy Rules (apply to every word on the site)

* **Never say "jackpot."** It sounds like only one person can ever win it.
  Say "win $1,000", "the $1,000 prize", "every winner gets paid".
* Make it explicit that **anyone who beats any game wins $1,000** — it is not
  a shared pot, not first-come-first-served, and it never runs out.
* **Never describe the games as hard, impossible, unlikely, or rare.** No
  odds, no "nearly impossible", no difficulty warnings anywhere. Every word
  should make winning feel possible and exciting.
* Tone: fun, bold, hype — like a game lobby, not a legal document (except the
  Terms page, which stays precise but still plain-spoken).

## 3. Visual Design Requirements

The look is **bold, colorful, sleek, and unique** — inspired by Stake's
polish, not by generic dark-purple "AI" dashboards.

* Deep blue-green casino base (#0c1a26 family) with neon accent colors:
  win-green for CTAs and success, gold for money, cyan/violet/pink for accents.
* **No thin, faint, or tiny text anywhere.** Body text is semibold or bolder;
  headings are extrabold display type; labels are bold and readable. If a
  string looks like fine print (outside the Terms page), it's wrong.
* Chunky raised buttons with hard shadows and press states; bold chips;
  strong borders; smooth, fast, satisfying animations.
* Mobile-first: large touch targets, animations sized for phone screens.

## 4. Prize Display

* The prize chip ("💰 WIN $1,000") lives in the sticky header and on the home
  hero, games page, each game screen, leaderboards, and profile.
* Winners see: "YOU WON $1,000! You beat <game>. The money is yours — no
  strings attached."
* The prize amount is editable live from the admin dashboard.

## 5. Authentication

* Anyone can browse (games, leaderboards, sponsor info, terms) logged out.
* Playing requires a phone-verified free account:
  phone → SMS code → (new users) display name + terms agreement.
* Reject/flag disposable, VoIP, and online-SMS-receiver numbers where possible.
* Phone numbers are never displayed publicly (masked everywhere: (***) ***-1234).

## 6. Daily Play Limit

* 500 total plays per user per day across all games; resets daily.
* Always visible while logged in ("Plays left: 437 / 500") with an info icon
  explaining the limit in friendly terms (fairness, not suspicion).
* When the limit is reached: friendly "come back tomorrow" message; a game
  already in progress may finish.

## 7. Daily Sponsor System

One sponsor per day (name, logo, website URL, active date, optional tagline).

* **Pinned banner:** a big, bold, colorful sponsor strip is stuck to the top
  of every page (it scrolls with the sticky header and cannot be missed). It
  carries the sponsor name/logo prominently, a Visit CTA, and a moving shine.
  It must never overlap or block game controls.
* **In-game branding:** sponsor logo on every High Low card back; sponsor
  mark on the Dice Sweep felt.
* **Loss popup branding:** the end-of-run popup is wrapped in an animated
  moving border with scrolling strips carrying the sponsor name (see §10).
* **"Want to be a sponsor?"** link rides the banner to /sponsor: a bold pitch
  page (audience stats, placements, how-it-works) plus an interest form that
  notifies the owner (email: rustagiaaryan@gmail.com). Lead model: owner
  follows up and nurtures; self-serve booking is a future option.
* The site must handle "no sponsor today" gracefully (house branding).
* Admin can create/edit/delete sponsor days and see click counts.

## 8. Game 1: High Low

* Shuffled 52-card deck; first card face up. Call each next card HIGHER or
  LOWER. **Ace is low (A=1, K=13).** Equal card = run ends. Wrong call = run
  ends. Reveal all 52 cards → win $1,000.
* Screen shows: current card large, sponsor-branded deck, two big HIGHER /
  LOWER buttons, card counter, prize chip, plays left.
* Card flips are 3D and snappy; correct cards glow; the revealed history sits
  in a horizontally scrollable tray that grows satisfyingly.
* Progress metric: cards revealed (52 = win).

## 9. Game 2: Dice Sweep

* Three dice per turn. Every total from 3 to 18 (16 totals) is on a board.
  Roll a NEW total → it locks in gold. Roll a total already locked → run ends.
  Lock all 16 → win $1,000.
* **Player agency (core to engagement):** each turn the player chooses to
  **roll all three dice at once** or **roll one die at a time** — partially
  rolled dice stay on the felt while the rest wait, and with two dice down
  the board highlights exactly which totals to dodge with the last die.
  Mixing is allowed (roll one, then the rest).
* Server rolls every die individually at request time (CSPRNG); a turn is
  evaluated only when its third die lands.
* **Dice must look real and 3D:** actual 3D cubes with six pip faces that
  tumble with full rotations and a gravity bounce, landing exactly on the
  rolled face. No sprite-swapping or teleporting dice.
* Screen shows: 16-total board (locked = gold), three dice slots on a
  sponsor-branded felt, partial-sum readout with dodge warnings, two big roll
  buttons (ROLL ALL 3 / ROLL ONE AT A TIME), prize chip, plays left.
* Progress metric: totals locked (16 = win).

## 10. Instructions & Loss/Win Feedback

* **Instructions = bulletin board.** Before the first play, rules appear as a
  pinned bulletin: bold numbered steps (1, 2, 3…), one short sentence each,
  readable in five seconds. A big START GAME button sits underneath. After
  start, rules collapse into an always-available info icon that reopens the
  same board in a modal.
* **Loss popup.** The moment a run ends, a popup appears centered OVER the
  game (never below the fold): why the run ended, how far the player got
  (positively framed — "Run it back!"), and a big PLAY AGAIN button. The
  popup is wrapped in an animated moving border with scrolling sponsor-name
  strips top and bottom — every loss is also a sponsor impression.
* **Win celebration.** Confetti barrage, "YOU WON $1,000!", then the payout
  form (Venmo / Zelle / PayPal / Cash App, pre-filled from profile if saved),
  with the verification/one-month note.

## 11. Leaderboards

Daily top-10 per game: rank, display name, best progress today, attempts
today, distinct WINNER styling. Sort: winners first, then best progress, then
earliest achieved. No phone numbers.

## 12. Player Profile

Display name, masked phone + verified badge, member-since date, total plays,
plays today, plays left, wins (with payout status), per-game stats (total
plays, best ever, best today, average, wins), and an editable payout section
(method, handle, full name, note).

## 13. Winner Flow & Owner Notification

* Win → celebration → payout confirmation form → permanent Win record
  (status: pending payout, needs review) with full session replay.
* Owner is notified immediately (admin dashboard + email TODO) with player,
  phone, game, time, session id, full history, payout info, fraud indicators.
* Admin reviews each win (replay + flags) and moves payout through
  pending / approved / paid / rejected / needs_review.

## 14. Security & Fairness

* The client must never receive future outcomes: deck order and dice values
  live only server-side; dice are generated at roll time; all randomness is
  CSPRNG. API responses are built from public-state types only.
* One session per attempt with full action history; finished sessions cannot
  be replayed; starting a new game abandons the old one (multi-tab/refresh
  safe); refresh resumes the active session including mid-turn dice.
* Anti-bot: rate limits (OTP per phone+IP, game-start cooldown + burst, action
  caps), quick human check every ~25 games (Turnstile-ready), play-speed
  heuristics that flag inhuman streaks, alert the owner, and route wins to
  manual review.
* 500/day limit enforced at start; in-flight games may finish.

## 15. Terms & Privacy

Terms cover: free to play, $1,000 prize paid to every verified winner within
one month via Venmo/Zelle/PayPal/Cash App, official game rules, fair-play and
anti-cheat rights, 500/day limit, account rules, sponsor presence, owner
review rights, prize amount changes. Linked from footer and signup; agreement
required before playing. **Attorney review required before public launch.**

## 16. Admin / Owner

Dashboard with: winner review queue (replays, fraud flags, payout status),
sponsor day management + click counts, sponsor inquiries (lead statuses),
prize amount control, site analytics (players, plays, per-game stats, best
today, flagged users).

## 17. Edge Cases

* Disconnect/refresh mid-game: session resumes (including mid-turn dice);
  unverified progress is never awarded.
* Multiple tabs: cannot duplicate attempts; the newest start wins.
* Limit reached mid-game: current attempt may finish.

## 18. Acceptance Criteria

* Browsable logged out; phone verification required to play.
* High Low works with Ace low; Dice Sweep requires all 16 totals (3–18, any
  order, repeat = loss) with both roll-all and roll-one-at-a-time modes.
* Dice render as real tumbling 3D cubes.
* "WIN $1,000" visible everywhere; the word "jackpot" appears nowhere.
* No copy anywhere suggests the games are hard or unlikely.
* All text is bold and readable; rules read as numbered bulletin boards.
* Losses pop up over the game inside the sponsor-branded moving border.
* Sponsor banner is pinned, prominent, and impossible to miss on every page.
* 500/day limit, daily leaderboards, profile stats + payout info, winner
  celebration + payout form, owner notifications, T&C page, anti-bot and
  anti-cheat protections all work as specified above.
