import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";

export const GET = withErrors(async () => {
  await requireAdmin();
  const notifications = await db.ownerNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ notifications });
});

const Patch = z.object({ id: z.string(), read: z.boolean() });

export const PATCH = withErrors(async (req: NextRequest) => {
  await requireAdmin();
  const body = Patch.safeParse(await req.json());
  if (!body.success) return apiError("Invalid update.");
  await db.ownerNotification.update({ where: { id: body.data.id }, data: { read: body.data.read } });
  return NextResponse.json({ ok: true });
});
