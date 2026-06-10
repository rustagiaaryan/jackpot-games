import { db } from "@/lib/db";

// Owner notification fan-out.
//
// Every notification is stored in the OwnerNotification table and surfaces on
// the /admin dashboard immediately.
//
// PRODUCTION TODO: also deliver by email so wins are never missed. Recommended:
// Resend (or SendGrid/Postmark). Example with Resend:
//
//   import { Resend } from "resend";
//   const resend = new Resend(process.env.RESEND_API_KEY);
//   await resend.emails.send({
//     from: "alerts@yourdomain.com",
//     to: process.env.OWNER_EMAIL!,
//     subject: input.title,
//     text: input.body,
//   });
//
// For jackpot wins specifically, consider also an SMS to the owner.

export interface OwnerNotificationInput {
  type: "jackpot_win" | "suspicious_activity" | "sponsor_inquiry";
  title: string;
  body: string;
  payload?: unknown;
}

export async function notifyOwner(input: OwnerNotificationInput): Promise<void> {
  await db.ownerNotification.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body,
      payload: JSON.stringify(input.payload ?? {}),
    },
  });

  const ownerEmail = process.env.OWNER_EMAIL ?? "(OWNER_EMAIL not set)";
  // Mock email delivery: logged to the server console for now.
  console.log(`\n📧 [MOCK EMAIL → ${ownerEmail}] ${input.title}\n${input.body}\n`);
}
