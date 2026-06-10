import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, getClientIp, withErrors } from "@/lib/api";
import { hashCode } from "@/lib/auth";
import { normalizePhone, screenPhone } from "@/lib/phone";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";
import { secureOtp } from "@/lib/random";
import { sendVerificationSms, SMS_MOCK_MODE } from "@/lib/sms";

const Body = z.object({ phone: z.string().min(7).max(20) });

const OTP_TTL_MS = 5 * 60 * 1000;

export const POST = withErrors(async (req: NextRequest) => {
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Enter a valid phone number.");

  const phone = normalizePhone(body.data.phone);
  if (!phone) return apiError("Enter a valid phone number.");

  // Account-creation / OTP-spam protection (per phone AND per IP).
  const ip = getClientIp(req);
  const perPhone = checkRateLimit(`otp:${phone}`, LIMITS.otpPerPhone.max, LIMITS.otpPerPhone.windowMs);
  const perIp = checkRateLimit(`otp-ip:${ip}`, LIMITS.otpPerIp.max, LIMITS.otpPerIp.windowMs);
  if (!perPhone.allowed || !perIp.allowed) {
    return apiError("Too many code requests. Please wait a few minutes.", 429, "rate_limited");
  }

  // Disposable/VoIP screening hook (real check is a PRODUCTION TODO in lib/phone.ts).
  const screen = await screenPhone(phone);
  if (!screen.allowed) return apiError(screen.reason ?? "This phone number can't be used.", 400);

  const code = secureOtp();
  await db.otpCode.create({
    data: { phone, codeHash: hashCode(code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  await sendVerificationSms(phone, code);

  const existing = await db.user.findUnique({ where: { phone }, select: { id: true } });
  return NextResponse.json({
    sent: true,
    phone,
    // Tells the client whether to collect a display name + terms agreement.
    isNewUser: !existing,
    // Surfaced in the UI only in mock mode so the demo is self-explanatory.
    mockMode: SMS_MOCK_MODE,
  });
});
