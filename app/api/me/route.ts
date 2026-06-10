import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withErrors } from "@/lib/api";
import { maskPhone } from "@/lib/phone";
import { playsUsedToday } from "@/lib/games/engine";
import { DAILY_PLAY_LIMIT, getJackpotAmount } from "@/lib/settings";

/** Session info polled by the client shell (nav, plays-left chip). */
export const GET = withErrors(async () => {
  const jackpot = await getJackpotAmount();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, jackpot, dailyLimit: DAILY_PLAY_LIMIT });
  }
  const used = await playsUsedToday(user.id);
  return NextResponse.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      phoneMasked: maskPhone(user.phone),
      isAdmin: user.isAdmin,
      banned: user.banned,
    },
    playsUsedToday: used,
    playsRemaining: Math.max(0, DAILY_PLAY_LIMIT - used),
    dailyLimit: DAILY_PLAY_LIMIT,
    jackpot,
  });
});
