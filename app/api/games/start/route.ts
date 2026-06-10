import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";
import { startGame } from "@/lib/games/engine";

const Body = z.object({ gameType: z.enum(["highlow", "dice", "doors"]) });

export const POST = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Unknown game.");
  const state = await startGame(user, body.data.gameType);
  return NextResponse.json({ state });
});
