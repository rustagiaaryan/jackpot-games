import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";
import { diceRoll } from "@/lib/games/engine";

const Body = z.object({ sessionId: z.string() });

export const POST = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Invalid roll.");
  const { state, result } = await diceRoll(user, body.data.sessionId);
  return NextResponse.json({ state, result });
});
