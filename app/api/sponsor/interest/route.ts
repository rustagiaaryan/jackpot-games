import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, getClientIp, withErrors } from "@/lib/api";
import { checkRateLimit } from "@/lib/rateLimit";
import { notifyOwner } from "@/lib/notifications";

// "Become a sponsor" interest form. The inquiry is stored for the admin
// dashboard and an owner notification is sent addressed to OWNER_EMAIL
// (rustagiaaryan@gmail.com). Current model: owner reaches out and nurtures
// the lead — no self-serve payment yet.
// PRODUCTION TODO: wire real email delivery in lib/notifications.ts; later,
// optionally add self-serve checkout (Stripe) + date picker for booking days.

const Body = z.object({
  companyName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(20).optional(),
  website: z.string().max(200).optional(),
  budget: z.string().max(60).optional(),
  preferredDates: z.string().max(120).optional(),
  message: z.string().max(1000).optional(),
});

export const POST = withErrors(async (req: NextRequest) => {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`sponsor-form:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) return apiError("Too many submissions. Please try again later.", 429, "rate_limited");

  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Please fill in company, contact name, and a valid email.");

  const inquiry = await db.sponsorInquiry.create({
    data: {
      ...body.data,
      phone: body.data.phone ?? null,
      website: body.data.website ?? null,
      budget: body.data.budget ?? null,
      preferredDates: body.data.preferredDates ?? null,
      message: body.data.message ?? null,
    },
  });

  await notifyOwner({
    type: "sponsor_inquiry",
    title: `💼 New sponsor inquiry: ${body.data.companyName}`,
    body: [
      `Company: ${body.data.companyName}`,
      `Contact: ${body.data.contactName} <${body.data.email}>`,
      body.data.phone ? `Phone: ${body.data.phone}` : null,
      body.data.website ? `Website: ${body.data.website}` : null,
      body.data.budget ? `Budget: ${body.data.budget}` : null,
      body.data.preferredDates ? `Preferred dates: ${body.data.preferredDates}` : null,
      body.data.message ? `Message: ${body.data.message}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    payload: { inquiryId: inquiry.id },
  });

  return NextResponse.json({ ok: true });
});
