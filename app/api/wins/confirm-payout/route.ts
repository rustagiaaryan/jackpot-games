import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";

// Winner payout confirmation (PRD §14.2): snapshots the winner's chosen
// payout details onto the Win record AND saves them as the user's preferred
// payout info for next time.
//
// PRODUCTION TODO: payouts themselves are manual (owner sends via
// Venmo/Zelle/PayPal/CashApp after review). If this is ever automated,
// payment verification must be added here.

const Body = z.object({
  gameSessionId: z.string(),
  fullName: z.string().min(2).max(80),
  method: z.enum(["venmo", "zelle", "paypal", "cashapp"]),
  handle: z.string().min(2).max(80),
  note: z.string().max(200).optional(),
  agreeToTerms: z.literal(true),
});

export const POST = withErrors(async (req: NextRequest) => {
  const user = await requireUser();
  const body = Body.safeParse(await req.json());
  if (!body.success) {
    return apiError("Please complete all fields and agree to the Terms and Conditions.");
  }
  const win = await db.win.findUnique({ where: { gameSessionId: body.data.gameSessionId } });
  if (!win || win.userId !== user.id) return apiError("Win not found.", 404, "not_found");

  const { fullName, method, handle, note } = body.data;
  await db.win.update({
    where: { id: win.id },
    data: { payoutName: fullName, payoutMethod: method, payoutHandle: handle, payoutNote: note ?? null },
  });
  await db.payoutInfo.upsert({
    where: { userId: user.id },
    update: { method, handle, fullName, note: note ?? null },
    create: { userId: user.id, method, handle, fullName, note: note ?? null },
  });
  return NextResponse.json({ ok: true });
});
