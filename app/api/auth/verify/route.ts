import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, withErrors } from "@/lib/api";
import { createAuthSession, hashCode } from "@/lib/auth";
import { maskPhone, normalizePhone } from "@/lib/phone";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";
import { MOCK_OTP_CODE, SMS_MOCK_MODE } from "@/lib/sms";

const Body = z.object({
  phone: z.string(),
  code: z.string().min(4).max(8),
  // Required only when creating a new account:
  displayName: z.string().min(2).max(24).optional(),
  agreeToTerms: z.boolean().optional(),
});

const MAX_OTP_ATTEMPTS = 5;

export const POST = withErrors(async (req: NextRequest) => {
  const body = Body.safeParse(await req.json());
  if (!body.success) return apiError("Invalid verification request.");
  const phone = normalizePhone(body.data.phone);
  if (!phone) return apiError("Invalid phone number.");

  // Brute-force protection on code verification.
  const rl = checkRateLimit(`verify:${phone}`, LIMITS.verifyPerPhone.max, LIMITS.verifyPerPhone.windowMs);
  if (!rl.allowed) return apiError("Too many attempts. Please wait a few minutes.", 429, "rate_limited");

  const otp = await db.otpCode.findFirst({
    where: { phone, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  const mockAccepted = SMS_MOCK_MODE && body.data.code === MOCK_OTP_CODE;
  if (!otp && !mockAccepted) return apiError("Code expired. Request a new one.", 400, "otp_expired");

  if (otp && !mockAccepted) {
    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      return apiError("Too many wrong attempts. Request a new code.", 429, "otp_locked");
    }
    if (hashCode(body.data.code) !== otp.codeHash) {
      await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      return apiError("Incorrect code. Try again.", 400, "otp_wrong");
    }
  }

  let user = await db.user.findUnique({ where: { phone } });
  if (!user) {
    // New account: display name + terms agreement are required up front.
    if (!body.data.displayName?.trim()) {
      return apiError("Pick a display name to finish creating your account.", 400, "need_profile");
    }
    if (!body.data.agreeToTerms) {
      return apiError("You must agree to the Terms and Conditions to play.", 400, "need_terms");
    }
    user = await db.user.create({
      data: {
        phone,
        displayName: body.data.displayName.trim(),
        agreedToTermsAt: new Date(),
        // The configured owner phone gets admin automatically.
        isAdmin: phone === (process.env.ADMIN_PHONE ?? ""),
      },
    });
  } else {
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  }

  if (otp) await db.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
  await createAuthSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      phoneMasked: maskPhone(user.phone),
      isAdmin: user.isAdmin,
    },
  });
});
