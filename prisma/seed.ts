import { PrismaClient } from "@prisma/client";

// Demo/development seed data.
// Everything here is clearly fake: demo players use +1555… numbers and the
// sponsor is a placeholder brand. Safe to re-run (upserts / dayKey-scoped).
//
// PRODUCTION TODO: do NOT run this seed in production — real sponsors are
// managed from /admin and real users come through phone verification.

const db = new PrismaClient();

const TZ = process.env.APP_TIMEZONE || "America/Los_Angeles";
function dayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function main() {
  const today = dayKey();

  // Jackpot setting
  await db.setting.upsert({
    where: { key: "prizeAmount" },
    update: {},
    create: { key: "prizeAmount", value: process.env.PRIZE_AMOUNT ?? "1000" },
  });

  // Admin/owner account — log in with this phone (code 123456 in mock mode)
  const adminPhone = process.env.ADMIN_PHONE ?? "+15555550100";
  await db.user.upsert({
    where: { phone: adminPhone },
    update: { isAdmin: true },
    create: { phone: adminPhone, displayName: "Owner", isAdmin: true, agreedToTermsAt: new Date() },
  });

  // Today's demo sponsor
  const existingSponsor = await db.sponsor.findFirst({ where: { activeDate: today } });
  if (!existingSponsor) {
    await db.sponsor.create({
      data: {
        name: "Nova Energy Drink",
        websiteUrl: "https://example.com",
        tagline: "Fuel your lucky streak",
        activeDate: today,
      },
    });
  }

  // Demo players + plausible game sessions so leaderboards look alive
  const demoPlayers = [
    { phone: "+15555550101", displayName: "Alex" },
    { phone: "+15555550102", displayName: "Maya" },
    { phone: "+15555550103", displayName: "Sam" },
    { phone: "+15555550104", displayName: "Jordan" },
    { phone: "+15555550105", displayName: "Chris" },
    { phone: "+15555550106", displayName: "Nina" },
  ];

  const users = [];
  for (const p of demoPlayers) {
    users.push(
      await db.user.upsert({
        where: { phone: p.phone },
        update: {},
        create: { ...p, agreedToTermsAt: new Date() },
      })
    );
  }

  const seededToday = await db.gameSession.count({
    where: { dayKey: today, user: { phone: { startsWith: "+1555555010" } } },
  });
  if (seededToday === 0) {
    // progress values intentionally modest — these games are nearly impossible
    const sessions: { user: number; gameType: string; progress: number }[] = [
      { user: 0, gameType: "highlow", progress: 18 },
      { user: 0, gameType: "highlow", progress: 9 },
      { user: 1, gameType: "highlow", progress: 14 },
      { user: 2, gameType: "highlow", progress: 11 },
      { user: 3, gameType: "highlow", progress: 7 },
      { user: 2, gameType: "dice", progress: 11 },
      { user: 3, gameType: "dice", progress: 9 },
      { user: 4, gameType: "dice", progress: 8 },
      { user: 5, gameType: "dice", progress: 6 },
      { user: 1, gameType: "dice", progress: 4 },
    ];
    for (const s of sessions) {
      await db.gameSession.create({
        data: {
          userId: users[s.user].id,
          gameType: s.gameType,
          status: "lost",
          // plausible shape per game so any state reader stays happy
          secretState:
            s.gameType === "dice"
              ? JSON.stringify({
                  collected: Array.from({ length: s.progress }, (_, i) => 3 + i),
                })
              : "{}",
          progress: s.progress,
          history: JSON.stringify([{ t: "seed", at: Date.now() }]),
          dayKey: today,
          endedAt: new Date(),
        },
      });
    }
  }

  console.log("✅ Seeded: prize setting, admin user, today's sponsor, demo leaderboard data");
  console.log(`   Admin login: ${adminPhone} (verification code 123456 in mock mode)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
