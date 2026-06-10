// SMS delivery layer.
//
// MOCK MODE (default): no SMS is sent. The verification code is printed to the
// server console, and the fixed demo code "123456" is also accepted so the
// flow is easy to demo. The rest of the auth pipeline (hashed codes, expiry,
// attempt limits, sessions) is production-shaped and unchanged by this flag.
//
// PRODUCTION TODO: implement `sendSms` with a real provider. Recommended:
// Twilio Verify (handles delivery, retries, and fraud screening):
//
//   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//   await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//     .verifications.create({ to: phone, channel: "sms" });
//
// then flip MOCK_SMS=false in the environment.

export const SMS_MOCK_MODE = process.env.MOCK_SMS !== "false";

/** Demo code accepted in mock mode only. */
export const MOCK_OTP_CODE = "123456";

export async function sendVerificationSms(phone: string, code: string): Promise<void> {
  if (SMS_MOCK_MODE) {
    console.log(
      `\n📱 [MOCK SMS] Verification code for ${phone}: ${code} (demo code ${MOCK_OTP_CODE} also works)\n`
    );
    return;
  }
  // PRODUCTION TODO: real SMS send goes here (see file header).
  throw new Error("Real SMS provider not configured. Set MOCK_SMS=true or implement lib/sms.ts.");
}
