# PRD: Jackpot Mini-Games Website

## 1. Product Overview

Build a visually polished online mini-games website where users can create a free account using their phone number and play three “nearly impossible” jackpot games. The current jackpot is **$1,000** and should be clearly visible throughout the site.

The site should feel fun, clean, animated, and addictive, with a polished game-room/casino-style visual quality similar in vibe to PokerNow, but without looking sketchy or cluttered. The experience should feel simple enough for anyone to understand immediately.

The initial version should include three games:

1. **High Low**
2. **Dice Staircase**
3. **Doors Challenge**

A user wins the $1,000 jackpot by fully completing **any one** of the three games.

---

## 2. Core Goals

The website should:

* Let users browse available games without logging in.
* Require users to log in with a verified phone number before playing.
* Make the $1,000 jackpot highly visible across the site.
* Provide clear game instructions before each game starts.
* Collapse instructions into an info icon once gameplay begins.
* Track player stats and daily leaderboards.
* Notify the site owner when a user wins.
* Show a celebration animation when a user wins.
* Collect and store winner payout information.
* Prevent users from seeing future game outcomes.
* Strongly prevent botting, automation, cheating, spam play, and fake accounts.
* Limit each user to **500 total game attempts per day**, across all games combined.
* Cleanly integrate a daily sponsor across the website and inside each game.

Important: no system can be literally “unhackable,” but the product should be designed to be as cheat-resistant and bot-resistant as reasonably possible.

---

## 3. Global Site Requirements

### 3.1 Main Pages

The site should include:

* Home page
* Games page
* Individual game pages

  * High Low
  * Dice Staircase
  * Doors Challenge
* Login / signup flow
* Player profile page
* Daily leaderboards page
* Terms and Conditions page
* Privacy / account info page
* Winner payout form page or profile section
* Admin-facing winner notification system
* Admin-facing sponsor management area

---

## 4. Jackpot Display

The current jackpot should be **$1,000**.

The jackpot must be visible in all major areas of the website, including:

* Home page hero section
* Top navigation bar or sticky header
* Games page
* Each individual game screen
* Leaderboards page
* Profile page
* Terms page where relevant

Suggested wording:

> Current Jackpot: $1,000
> Complete any game to win.

The jackpot amount should be treated as configurable, even though the initial value is $1,000.

If a user wins, the game should clearly say:

> Congratulations! You completed the challenge and won the $1,000 jackpot.

---

## 5. Authentication and Account Requirements

### 5.1 Users Can Browse Without Account

Users should be able to visit the website and see:

* The available games
* Basic game descriptions
* Current jackpot
* Daily sponsor
* Leaderboards
* Terms and Conditions

But they should not be able to actually play a game unless logged in.

### 5.2 Phone Number Login Required

When a logged-out user clicks “Play” on any game, show a prompt:

> Create a free account to play.

The account should be connected to the user’s phone number.

The signup/login flow should:

1. Ask for phone number.
2. Send a verification code by SMS.
3. Ask user to enter the code.
4. Verify the code.
5. Create or log into the account.

The product should require a real, verified phone number. The system should reject or flag obvious fake, disposable, temporary, VoIP, emulator, or online SMS receiver numbers where possible.

### 5.3 Account Identity

Each user account should have:

* Verified phone number
* Display name
* Created date
* Last login date
* Total games played
* Games played today
* Daily game limit remaining
* Per-game stats
* Payout info, if submitted
* Cheating / fraud flags, if applicable

The phone number should not be publicly displayed.

---

## 6. Daily Game Limit

Users are limited to **500 total game attempts per day**, across all games combined.

Example:

* 200 High Low attempts
* 200 Dice Staircase attempts
* 100 Doors attempts

Total = 500, so the user cannot play again until the daily reset.

### 6.1 Display

The user should always be able to see their remaining daily attempts while logged in.

Example:

> Plays left today: 437 / 500

This should appear in a clean corner of the screen, such as the top-right area or near the player profile icon.

### 6.2 Info Icon

Next to the daily limit display, include an info icon.

When clicked, show:

> Each account is limited to 500 total game attempts per day. This limit helps keep the games fair, prevents botting, and protects the jackpot system. Your limit resets every day.

### 6.3 Limit Behavior

When the user reaches 500 attempts:

* Disable all “Play Again” buttons.
* Show a friendly message:

> You’ve used all 500 plays for today. Come back tomorrow when your limit resets.

---

## 7. Daily Sponsor System

Every day there is one sponsor across the entire website.

Each sponsor has:

* Sponsor name
* Sponsor logo
* Sponsor website URL
* Active date
* Optional short tagline

The sponsor should appear cleanly throughout the website without interrupting gameplay.

### 7.1 Global Sponsor Banner

At the top of the website, always show a clean sponsor banner.

Example:

> Today’s Sponsor: [Logo] Sponsor Name
> Visit Sponsor

The banner should link to the sponsor’s website.

The banner should be visually polished and not annoying. It should not block game controls.

### 7.2 Sponsor Integration in Games

The sponsor should also be integrated into each game visually:

#### High Low

* Sponsor logo appears on the back of each face-down card.
* The card back should still look like a real card back, just branded tastefully.

#### Dice Staircase

* Sponsor logo appears on the velvet dice mat.
* It should feel like a clean branded table/mat, not a pop-up ad.

#### Doors Challenge

* Sponsor logo appears naturally in the room environment.
* Acceptable placements:

  * On the floor
  * On the ceiling
  * On a wall banner
  * Subtly on each door
* It should feel integrated into the game room.

### 7.3 Admin Sponsor Management

There should be an admin-facing way to set or update:

* Sponsor name
* Logo
* Website
* Active date
* Tagline

The site should gracefully handle no sponsor being set.

---

## 8. Game 1: High Low

### 8.1 Game Description

High Low is a card prediction game.

A shuffled 52-card deck is used. The first card starts face up. For every next card, the user must guess whether the next card will be higher or lower than the current card.

If the user guesses wrong, they lose.

If the next card is equal in value to the current card, they lose automatically.

If the user successfully gets through the entire 52-card deck, they win the $1,000 jackpot.

### 8.2 Card Ranking

Ace is low.

Card order:

> A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K

Ace = 1.
King = 13.

### 8.3 Game Start

When the user starts a High Low game:

* Show one card face up.
* Show two large buttons:

  * Higher
  * Lower
* Show the current jackpot.
* Show the player’s daily plays remaining.
* Show the sponsor-branded card back on the unrevealed card/deck.

### 8.4 Gameplay

For each round:

1. User chooses Higher or Lower.
2. The next card slowly peels, flips, or turns over.
3. The result is revealed.
4. If correct:

   * Card glows/sparkles.
   * User continues.
5. If wrong:

   * Show loss animation.
   * Show how far they got.
   * Show “Play Again” button if they have daily plays left.
6. If equal rank:

   * User loses automatically.
   * Message should explain:

> Equal card. Game over.

### 8.5 Winning

The user wins if all 52 cards are successfully revealed.

On win:

* Trigger major congratulations animation.
* Show jackpot win message.
* Notify site owner.
* Show payout form prompt.
* Save the win permanently to the user profile.
* Display the user differently on the leaderboard.

### 8.6 Previous Cards Display

At all times during the game, the user should be able to view every card revealed so far.

Requirements:

* Show revealed cards in a horizontal scrollable row or tray.
* Allow the user to scroll back to see previous cards.
* Clearly show the current card.
* The game should feel satisfying as the revealed card history grows.

### 8.7 High Low Progress Metric

Track progress as:

* Cards revealed before losing
* Highest cards revealed in a day
* All-time highest cards revealed
* Whether user completed all 52

For example:

> You reached 23 cards.

A perfect win is:

> 52 cards revealed.

---

## 9. Game 2: Dice Staircase

### 9.1 Game Description

Dice Staircase is a two-dice rolling challenge.

The user must roll the following sums in exact order:

> 8 → 7 → 6 → 5 → 4 → 3 → 2

If the user rolls the correct current target sum, they advance to the next target.

If the user rolls anything else, they lose and must restart.

If they complete the full sequence, they win the $1,000 jackpot.

### 9.2 Game Start

Before play, show instructions clearly:

> Roll two dice and hit the sums in order: 8, 7, 6, 5, 4, 3, 2. If you roll the wrong sum, the game ends. Complete the full staircase to win the $1,000 jackpot.

After the user starts, collapse this into an info icon.

### 9.3 Gameplay

The screen should show:

* A nice animated velvet dice mat.
* Two dice.
* Current target sum.
* Completed sums.
* Remaining sums.
* Current jackpot.
* Daily plays remaining.
* Sponsor branding on the mat.

The user presses a “Roll” button.

Each roll should:

1. Animate both dice realistically.
2. Dice should bounce/roll across the velvet pad.
3. Dice should land in a random-looking position on the pad.
4. The final dice faces should determine the sum.
5. The rolled sum should be highlighted.

### 9.4 Correct Roll Animation

If the sum matches the current target:

* The current target sum lights up.
* The dice glow/sparkle.
* The velvet mat may pulse softly.
* Move to the next target.

Example:

Target: 8
Roll: 5 + 3 = 8
Result: correct, advance to 7.

### 9.5 Incorrect Roll Animation

If the sum does not match the current target:

* Show a failed roll animation.
* Show the target and actual roll.
* Show how far the user got.
* Show restart option.

Example:

> Needed 5, rolled 9. Game over.

### 9.6 Winning

The user wins if they successfully roll:

> 8, 7, 6, 5, 4, 3, 2

in exact order.

On win:

* Major congratulations animation.
* Jackpot win message.
* Notify site owner.
* Prompt payout form.
* Save win to profile.
* Mark distinctly on leaderboard.

### 9.7 Dice Staircase Progress Metric

Track progress as:

* Number of correct target sums completed
* Highest step reached today
* All-time highest step reached
* Whether user completed the full sequence

Example:

> You completed 5 / 7 steps.

A perfect win is:

> 7 / 7 steps completed.

---

## 10. Game 3: Doors Challenge

### 10.1 Game Description

Doors Challenge is a room progression game.

The user enters a room with doors. One door is correct. If they choose the correct door, they move to the next level. If they choose the wrong door, they fall into the abyss and lose.

The number of doors changes by level:

* Level 1: 1 door
* Level 2: 2 doors
* Level 3: 4 doors
* Level 4: 8 doors
* Level 5: 16 doors
* Level 6: 32 doors
* Level 7: 64 doors
* Level 8: 2 doors

If the user survives all 8 levels, they win the $1,000 jackpot.

### 10.2 Game Start

Before play, show instructions:

> Pick the correct door to move to the next room. The number of doors increases each level until Level 7, then the final level has 2 doors. Choose wrong and you fall into the abyss. Complete all 8 levels to win the $1,000 jackpot.

After the user starts, collapse this into an info icon.

### 10.3 Gameplay

Each level should show:

* Current level number
* Number of doors
* Current jackpot
* Daily plays remaining
* Sponsor branding in the room
* Doors arranged in a visually pleasing way

The user picks one door.

### 10.4 Correct Door Animation

When the user picks the correct door:

1. Door glows.
2. Door opens.
3. User visually moves/enters through it.
4. Transition into the next room.
5. New room appears with more doors.

The transition should feel smooth and satisfying.

### 10.5 Wrong Door Animation

When the user picks a wrong door:

1. Door opens.
2. User enters.
3. Camera looks downward.
4. Abyss is revealed.
5. User falls.
6. Loss screen appears.

The loss should feel dramatic but fun, not scary.

### 10.6 Level 1 Behavior

Level 1 has only 1 door, so it is guaranteed correct.

The user should still click the door and go through the animation, because it helps set the tone of the game.

### 10.7 Winning

The user wins if they successfully pass Level 8.

On win:

* Major congratulations animation.
* Jackpot win message.
* Notify site owner.
* Prompt payout form.
* Save win to profile.
* Mark distinctly on leaderboard.

### 10.8 Doors Progress Metric

Track progress as:

* Highest level reached
* Highest level cleared
* Daily best level
* All-time best level
* Whether user completed Level 8

Example:

> You reached Level 7.

A perfect win is:

> Cleared Level 8.

---

## 11. Instructions System

Each game should have clear instructions before the user starts playing.

Requirements:

* Instructions appear before the first play.
* User must click a clear “Start Game” button.
* After game starts, instructions collapse into an info icon.
* The info icon remains available throughout gameplay.
* Clicking the info icon opens the instructions again in a modal or clean overlay.
* Instructions should be short, clear, and beginner-friendly.

---

## 12. Leaderboards

There should be daily leaderboards for each game.

Each game has its own leaderboard showing the top 10 players for the current day.

### 12.1 Leaderboard Requirements

For each leaderboard entry, show:

* Rank
* Display name
* Progress metric
* Number of attempts today
* Win status if applicable

Do not show phone numbers.

### 12.2 High Low Leaderboard

Sort by:

1. Completed full game/winners first
2. Highest cards revealed
3. Earliest time achieved, as tie-breaker

Example:

| Rank | Player | Best Today |
| ---- | ------ | ---------- |
| 1    | Alex   | 32 cards   |
| 2    | Maya   | 29 cards   |

If someone wins, display distinctly:

> WINNER — 52 cards completed

### 12.3 Dice Staircase Leaderboard

Sort by:

1. Winners first
2. Most steps completed
3. Earliest time achieved, as tie-breaker

Example:

| Rank | Player | Best Today  |
| ---- | ------ | ----------- |
| 1    | Sam    | 6 / 7 steps |
| 2    | Jordan | 5 / 7 steps |

If someone wins:

> WINNER — completed 8 → 2 staircase

### 12.4 Doors Leaderboard

Sort by:

1. Winners first
2. Highest level cleared
3. Earliest time achieved, as tie-breaker

Example:

| Rank | Player | Best Today      |
| ---- | ------ | --------------- |
| 1    | Chris  | Cleared Level 6 |
| 2    | Nina   | Reached Level 6 |

If someone wins:

> WINNER — cleared Level 8

---

## 13. Player Profile Page

Each logged-in user should have a profile page.

### 13.1 Profile Info

Show:

* Display name
* Verified phone number status
* Account created date
* Total games played
* Games played today
* Daily plays remaining
* Jackpot wins, if any

Phone number should be partially masked.

Example:

> Phone: (***) ***-1234

### 13.2 Game Stats

Show separate stats for each game.

#### High Low Stats

* Total attempts
* Best ever cards revealed
* Best today cards revealed
* Average cards revealed
* Number of wins

#### Dice Staircase Stats

* Total attempts
* Best ever steps completed
* Best today steps completed
* Average steps completed
* Number of wins

#### Doors Challenge Stats

* Total attempts
* Best ever level reached
* Best today level reached
* Average level reached
* Number of wins

### 13.3 Payout Info

The user should have a payout section on their profile.

This section should allow the user to add or edit their preferred payout method.

Supported payout choices:

* Venmo
* Zelle
* PayPal
* Cash App

Fields:

* Preferred payout method
* Payment handle/email/phone
* Full name
* Optional note

This payout info should be editable at any time.

If a user wins and has not filled it out yet, immediately prompt them to fill it out.

If a user wins and already has payout info saved, show it and ask them to confirm or update it.

---

## 14. Winner Flow

When a user wins any game:

### 14.1 Immediate User Experience

Show:

* Large congratulations animation
* Confetti
* Sparkles
* Jackpot message

Text:

> Congratulations! You completed the challenge and won the $1,000 jackpot.

Then show:

> Please confirm how you would like to be paid. Payouts are sent through Venmo, Zelle, PayPal, or Cash App within one month, subject to verification and the Terms and Conditions.

### 14.2 Payout Form

Show a form asking:

* Full name
* Preferred payout method
* Payment handle/email/phone
* Confirmation checkbox agreeing to Terms and Conditions

### 14.3 Owner Notification

When someone wins, the owner should be notified.

The notification should include:

* Player display name
* Verified phone number
* Game won
* Date/time of win
* Game session ID
* Full game history for the winning attempt
* Payout info, if provided
* Fraud/risk indicators, if any

Notification methods can include email, admin dashboard alert, or both.

### 14.4 Winner Record

The system should permanently store:

* User ID
* Game type
* Win timestamp
* Full game session details
* Replay/history of the winning game
* Payout status
* Admin review status
* Fraud review status

---

## 15. Security and Fairness Requirements

The games must be designed so users cannot know future outcomes.

### 15.1 Never Reveal Future Outcomes

The frontend must never receive:

* Future cards in the High Low deck
* Future dice rolls
* Correct future doors
* Any hidden random seed
* Any data that lets users predict future outcomes

Only reveal the current necessary result after the user makes a choice or roll.

### 15.2 Game Session Integrity

Each game attempt should have a unique session record.

The system should track:

* User
* Game type
* Start time
* End time
* Inputs/actions
* Outcomes
* Progress
* Whether the game was won/lost
* Whether the game was suspicious

Users should not be able to alter game results, replay old winning states, or fake a completed game.

### 15.3 Anti-Cheating

The product should detect or prevent:

* Multiple accounts using the same device/browser/IP pattern
* Suspiciously fast gameplay
* Automated clicking
* Impossible reaction/play speeds
* Tampered requests
* Reused game sessions
* Repeated failed auth attempts
* Disposable phone numbers
* Temporary phone verification services
* VPN/proxy abuse where possible
* Bot-like behavior

If suspicious behavior is detected:

* The user can be temporarily blocked from playing.
* The account can be flagged.
* A potential winning claim can require manual review.
* The owner should be alerted.

### 15.4 Anti-Bot Requirements

The site should include bot prevention that does not ruin gameplay.

Possible user-facing behavior:

* Quick human check after every few games.
* Human check when suspicious behavior is detected.
* Human check before starting a new session after rapid repeated plays.
* Rate limit rapid actions.
* Rate limit game starts.
* Rate limit login attempts.

The human check should be quick and not annoying for normal users.

### 15.5 Rate Limiting

The product should enforce:

* 500 total game attempts per user per day
* Reasonable cooldowns between game starts
* Protection against spam clicking
* Protection against repeated failed login attempts
* Protection against account creation abuse

---

## 16. Terms and Conditions Page

Create a Terms and Conditions page.

The page should be visible from the footer and during signup.

Users should have to agree to the Terms and Conditions before playing.

The Terms should clearly state:

* The site offers free-to-play jackpot games.
* The current jackpot is $1,000.
* A user wins by fully completing one of the games according to the official rules.
* Payout methods are Venmo, Zelle, PayPal, or Cash App.
* The user can choose their preferred payout method.
* Payout will be sent within one month of a verified win.
* The site owner has the right to review any win before payout.
* The site owner has the right to refuse payout if cheating, botting, automation, account abuse, fake identity, tampering, or suspicious behavior is detected.
* Users may not use bots, scripts, automation, exploits, modified clients, fake accounts, disposable phone numbers, or any other unfair method.
* Users may not attempt to reverse engineer, manipulate, or interfere with game outcomes.
* Users are limited to 500 game attempts per day.
* The site can suspend or ban accounts for abuse.
* The jackpot amount may be updated in the future.
* Sponsor logos and links may appear on the site.
* The user is responsible for providing accurate payout information.
* The site is not responsible for delays caused by incorrect payout info.
* The site owner may request additional verification before payout.
* The terms may change in the future.

Important: Include a note in the project that the Terms and Conditions should be reviewed by a qualified attorney before the site is publicly launched with real-money prizes.

---

## 17. Visual Design Requirements

The site should feel:

* Fun
* Clean
* Modern
* Smooth
* Polished
* Slightly casino/game-room inspired
* Trustworthy
* Mobile-friendly
* Addictive but not overwhelming

Avoid:

* Cheap-looking casino graphics
* Scammy visuals
* Too many popups
* Cluttered banners
* Distracting ads
* Slow or janky animations

### 17.1 Design Style

Suggested visual tone:

* Dark elegant background
* Rich accent colors
* Smooth shadows
* Rounded cards/buttons
* High-quality animations
* Clear typography
* Sponsor branding integrated subtly

### 17.2 Mobile Experience

All games should work well on mobile.

Buttons should be large.

Animations should fit phone screens.

Leaderboards and profile pages should be responsive.

---

## 18. Animation Requirements

Animations are a key part of the product.

The games should not feel static.

### 18.1 Global Animation Principles

Animations should be:

* Smooth
* Fast enough to keep replaying fun
* Satisfying when correct
* Dramatic but not annoying when losing
* Visually polished
* Not too slow after repeated plays

Allow users to quickly start another game after losing.

### 18.2 Correct Action Feedback

When the user gets something right:

* Glow
* Shine
* Sparkle
* Pulse
* Smooth transition to next step

### 18.3 Losing Feedback

When the user loses:

* Clear loss animation
* Show why they lost
* Show progress
* Offer restart

### 18.4 Winning Feedback

When the user wins:

* Big celebration
* Confetti
* Jackpot animation
* Clear payout prompt

---

## 19. Home Page Requirements

The home page should include:

* Current jackpot: $1,000
* Short description of the site
* Three game cards
* Daily sponsor banner
* Login/signup button
* Leaderboard teaser
* Call-to-action buttons

Suggested hero copy:

> Three games. One jackpot.
> Complete any challenge and win $1,000.

Game cards should show:

* Game name
* Short description
* Difficulty vibe
* Play button

If user is logged out and clicks Play:

> Create a free account with your phone number to play.

---

## 20. Games Page Requirements

The games page should list the three games:

1. High Low
2. Dice Staircase
3. Doors Challenge

Each game card should include:

* Name
* Visual preview
* Short rules summary
* Current best daily score
* Play button
* Jackpot label

---

## 21. Admin / Owner Requirements

The owner should be able to:

* See when a user wins.
* Review winner details.
* Review game session history.
* Review fraud/suspicion indicators.
* See payout information.
* Mark payout as pending, approved, paid, rejected, or needs review.
* Manage daily sponsor.
* Update jackpot amount.
* View player counts and attempt totals.
* View daily game stats.

---

## 22. Analytics / Stats Requirements

Track global stats:

* Total users
* Total games played
* Total games played today
* Games played per game type
* Total winners
* Daily winners
* Best High Low score today
* Best Dice Staircase score today
* Best Doors score today
* Average progress by game
* Sponsor click count

The site can optionally display some public stats, such as:

* Total attempts today
* Best streak today
* Number of jackpot winners

---

## 23. Edge Cases

### 23.1 User Loses Internet Mid-Game

The game should not accidentally create a fake win.

If the user disconnects:

* Save current session state if possible.
* Otherwise mark the session incomplete.
* Do not award progress that was not verified.

### 23.2 User Refreshes Page Mid-Game

The game should handle refresh safely.

Options:

* Resume active game if possible.
* Or mark attempt abandoned.

Either way, the user should not be able to exploit refreshes.

### 23.3 User Opens Multiple Tabs

The user should not be able to gain extra attempts or manipulate game state by using multiple tabs.

### 23.4 User Reaches Daily Limit During Game

If the game has already started, allow that attempt to finish.

After it ends, prevent more attempts until reset.

---

## 24. Acceptance Criteria

The project is complete when:

* Users can view the site and games while logged out.
* Users must verify phone number before playing.
* The High Low game works with Ace as 1.
* The Dice Staircase game requires sums 8 → 7 → 6 → 5 → 4 → 3 → 2.
* The Doors game has levels 1, 2, 4, 8, 16, 32, 64, then 2 doors.
* Each game has clear starting instructions and an info icon.
* The $1,000 jackpot is clearly shown everywhere.
* Users are limited to 500 total attempts per day.
* Daily leaderboards exist for all three games.
* User profiles show stats and payout info.
* Winners trigger celebration animation.
* Winners can submit/edit payout info.
* Owner is notified when someone wins.
* Terms and Conditions page exists.
* Sponsor banner exists globally.
* Sponsor branding appears inside all three games.
* Future cards, dice rolls, and correct doors are never exposed to the user before needed.
* The site includes anti-bot, anti-cheat, and rate-limiting protections.
* The visual design is polished, animated, and fun to replay.

____

- Oh i forgot, their should be an easy way for companies looking to reach out to become a sponsor. Maybe on the same top banner or whatever that has the current days sponsor, there should be something on the side that says want to be a sponsor? And takes them to a different page where they get information about how many viewers the site gets and basically where there site/logo will be shown throughout site and other stuff that will convince them to become a sponsor, and it should have a form which gets sent to my email rustagiaaryan@gmail.com for now which has their company name, and other important info i need. I don’t know if they should just pay right then and there and set an available date to be a sponsor, or if after they fill an interest form i reach out to them and nurture from there.
- Consistently make updates, commits, and pushes to my github throughout entire process
