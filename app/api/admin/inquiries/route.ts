import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";

export const GET = withErrors(async () => {
  await requireAdmin();
  const inquiries = await db.sponsorInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ inquiries });
});

const Patch = z.object({ id: z.string(), status: z.enum(["new", "contacted", "closed"]) });

export const PATCH = withErrors(async (req: NextRequest) => {
  await requireAdmin();
  const body = Patch.safeParse(await req.json());
  if (!body.success) return apiError("Invalid update.");
  const inquiry = await db.sponsorInquiry.update({
    where: { id: body.data.id },
    data: { status: body.data.status },
  });
  return NextResponse.json({ inquiry });
});
