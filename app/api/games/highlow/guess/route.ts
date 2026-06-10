import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";
import { highLowGuess } from "@/lib/games/engine";

const Body = z.object({
  sessionId: z.string(),
  guess: z.enum(["higher", "lower"]),
});

export const POST = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Invalid guess.");
  const { state, result } = await highLowGuess(user, body.data.sessionId, body.data.guess);
  return NextResponse.json({ state, result });
});
