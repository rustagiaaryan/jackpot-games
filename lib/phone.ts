// Phone normalization + basic screening.
//
// PRODUCTION TODO: integrate Twilio Lookup (or similar) to detect VoIP,
// disposable, and online-SMS-receiver numbers, and reject/flag them per the
// PRD. The `screenPhone` hook below is where that call belongs.

/** Normalize user input to E.164. US numbers get +1 by default. Returns null if invalid. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let e164: string;
  if (digits.startsWith("+")) {
    e164 = "+" + digits.slice(1).replace(/\D/g, "");
  } else {
    const bare = digits.replace(/\D/g, "");
    if (bare.length === 10) e164 = "+1" + bare;
    else if (bare.length === 11 && bare.startsWith("1")) e164 = "+" + bare;
    else return null;
  }
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) return null;
  return e164;
}

/** Mask for display: (***) ***-1234. Phone numbers are never shown in full. */
export function maskPhone(e164: string): string {
  const last4 = e164.slice(-4);
  return `(***) ***-${last4}`;
}

export interface PhoneScreenResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Screen a number before sending an OTP.
 * PRODUCTION TODO: call Twilio Lookup `line_type_intelligence` here and reject
 * line types "voip" / "prepaid" or numbers from known disposable-SMS ranges.
 * Mock mode only blocks an obviously fake test prefix.
 */
export async function screenPhone(e164: string): Promise<PhoneScreenResult> {
  // Obviously fake numbers like +1555555xxxx are reserved for local demo use.
  if (/^\+1?555/.test(e164) && process.env.MOCK_SMS !== "true") {
    return { allowed: false, reason: "This number cannot receive SMS." };
  }
  return { allowed: true };
}
