import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";
import { getActiveSession } from "@/lib/games/engine";
import { isGameType } from "@/lib/games/types";

/** Resume an in-flight session after a refresh (PRD §23.2). */
export const GET = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const gameType = req.nextUrl.searchParams.get("gameType") ?? "";
  if (!isGameType(gameType)) return apiError("Unknown game.");
  const state = await getActiveSession(user, gameType);
  return NextResponse.json({ state });
});
