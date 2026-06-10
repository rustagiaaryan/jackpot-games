import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";
import { verifyHumanCheck } from "@/lib/antibot";

// PRODUCTION TODO: when swapping to Cloudflare Turnstile, this endpoint
// receives the Turnstile token and verifies it with the secret key instead
// of comparing arithmetic answers (see lib/antibot.ts).

const Body = z.object({ answer: z.string().max(10) });

export const POST = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Invalid answer.");
  const ok = await verifyHumanCheck(user, body.data.answer);
  if (!ok) return apiError("That's not quite right — try again.", 400, "human_check_failed");
  return NextResponse.json({ ok: true });
});
