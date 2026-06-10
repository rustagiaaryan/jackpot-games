import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";
import { doorsPick } from "@/lib/games/engine";

const Body = z.object({
  sessionId: z.string(),
  doorIndex: z.number().int().min(0).max(63),
});

export const POST = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Invalid door.");
  const { state, result } = await doorsPick(user, body.data.sessionId, body.data.doorIndex);
  return NextResponse.json({ state, result });
});
