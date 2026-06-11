import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";
import { setPrizeAmount } from "@/lib/settings";

const Body = z.object({ amount: z.number().int().min(1).max(1000000) });

/** Owner can update the per-win prize amount live (PRD §21). */
export const PATCH = withErrors(async (req: NextRequest) => {
  await requireAdmin();
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Enter a valid prize amount.");
  await setPrizeAmount(body.data.amount);
  return NextResponse.json({ ok: true, amount: body.data.amount });
});
