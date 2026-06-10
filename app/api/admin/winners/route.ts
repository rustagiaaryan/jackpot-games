import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";

/** Winner review queue: full session replay + payout + fraud indicators (PRD §21). */
export const GET = withErrors(async () => {
  await requireAdmin();
  const wins = await db.win.findMany({
    orderBy: { wonAt: "desc" },
    include: {
      user: { select: { displayName: true, phone: true, flagged: true, flagReason: true } },
      gameSession: {
        select: { history: true, suspicious: true, suspicionReason: true, startedAt: true, endedAt: true },
      },
    },
  });
  return NextResponse.json({ wins });
});

const Patch = z.object({
  winId: z.string(),
  payoutStatus: z.enum(["pending", "approved", "paid", "rejected", "needs_review"]).optional(),
  reviewStatus: z.enum(["needs_review", "approved", "rejected"]).optional(),
  fraudNotes: z.string().max(1000).optional(),
});

export const PATCH = withErrors(async (req: NextRequest) => {
  await requireAdmin();
  const body = Patch.safeParse(await req.json());
  if (!body.success) return apiError("Invalid update.");
  const { winId, ...data } = body.data;
  const win = await db.win.update({ where: { id: winId }, data });
  return NextResponse.json({ win });
});
