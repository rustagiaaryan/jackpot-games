import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError, withErrors } from "@/lib/api";

export const GET = withErrors(async () => {
  await requireAdmin();
  const sponsors = await db.sponsor.findMany({ orderBy: { activeDate: "desc" } });
  return NextResponse.json({ sponsors });
});

const Create = z.object({
  name: z.string().min(1).max(80),
  websiteUrl: z.string().url().max(300),
  logoUrl: z.string().url().max(500).optional().or(z.literal("")),
  tagline: z.string().max(120).optional(),
  activeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const POST = withErrors(async (req: NextRequest) => {
  await requireAdmin();
  const body = Create.safeParse(await req.json());
  if (!body.success) return apiError("Name, website URL, and active date (YYYY-MM-DD) are required.");
  const sponsor = await db.sponsor.create({
    data: {
      ...body.data,
      logoUrl: body.data.logoUrl || null,
      tagline: body.data.tagline || null,
    },
  });
  return NextResponse.json({ sponsor });
});

const Patch = Create.partial().extend({ id: z.string() });

export const PATCH = withErrors(async (req: NextRequest) => {
  await requireAdmin();
  const body = Patch.safeParse(await req.json());
  if (!body.success) return apiError("Invalid sponsor update.");
  const { id, ...data } = body.data;
  const sponsor = await db.sponsor.update({
    where: { id },
    data: { ...data, logoUrl: data.logoUrl === "" ? null : data.logoUrl },
  });
  return NextResponse.json({ sponsor });
});

export const DELETE = withErrors(async (req: NextRequest) => {
  await requireAdmin();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return apiError("Missing sponsor id.");
  await db.sponsor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
