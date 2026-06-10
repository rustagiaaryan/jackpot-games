import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";

const Body = z.object({
  method: z.enum(["venmo", "zelle", "paypal", "cashapp"]),
  handle: z.string().min(2).max(80),
  fullName: z.string().min(2).max(80),
  note: z.string().max(200).optional(),
});

export const GET = withErrors(async () => {
  const user = await requireUser();
  const payout = await db.payoutInfo.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ payout });
});

/** Add or edit preferred payout info (editable any time — PRD §13.3). */
export const PUT = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Please fill in all payout fields.");
  const payout = await db.payoutInfo.upsert({
    where: { userId: user.id },
    update: { ...body.data, note: body.data.note ?? null },
    create: { userId: user.id, ...body.data, note: body.data.note ?? null },
  });
  return NextResponse.json({ payout });
});
