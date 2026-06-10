import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withErrors } from "@/lib/api";

const Body = z.object({ sponsorId: z.string() });

/** Sponsor click tracking (PRD §22 — sponsor click count). */
export const POST = withErrors(async (req: NextRequest) => {
  const body = Body.safeParse(await req.json());
  if (body.success) {
    await db.sponsor
      .update({ where: { id: body.data.sponsorId }, data: { clickCount: { increment: 1 } } })
      .catch(() => {}); // unknown id: ignore, never block the redirect
  }
  return NextResponse.json({ ok: true });
});
