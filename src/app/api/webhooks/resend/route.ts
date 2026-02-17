/**
 * Resend Webhook Handler
 *
 * Receives real-time email delivery events from Resend.
 * Tracks bounces, complaints, and deliveries in EmailSuppression table.
 *
 * Setup: In Resend dashboard → Webhooks → Add endpoint:
 *   URL: https://ghostmydata.com/api/webhooks/resend?secret=YOUR_SECRET
 *   Events: email.bounced, email.complained, email.delivered
 *
 * Env: RESEND_WEBHOOK_SECRET — shared secret for request verification
 */

import { NextResponse } from "next/server";
import {
  recordBounce,
  recordComplaint,
  categorizeEmail,
  lookupBrokerByEmail,
  type BounceType,
} from "@/lib/email/suppression";

export const dynamic = "force-dynamic";

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce?: {
      message: string;
      type?: string; // "hard" | "soft"
    };
  };
}

function verifyWebhookSecret(request: Request): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // If no secret configured, log warning but allow (for initial setup)
    console.warn("[Resend Webhook] RESEND_WEBHOOK_SECRET not set — accepting all events");
    return true;
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const headerSecret = request.headers.get("x-webhook-secret");

  return querySecret === secret || headerSecret === secret;
}

export async function POST(request: Request) {
  // Verify webhook authenticity
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const event: ResendWebhookEvent = await request.json();

    if (!event?.type || !event?.data) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const { type, data } = event;
    const recipients = data.to || [];
    const emailId = data.email_id;

    console.log(
      `[Resend Webhook] ${type} — to: ${recipients.join(", ")} — subject: ${data.subject?.slice(0, 50)}`
    );

    switch (type) {
      case "email.bounced": {
        // Determine bounce type from Resend's data
        const bounceType: BounceType =
          data.bounce?.type === "hard"
            ? "permanent"
            : data.bounce?.type === "soft"
              ? "transient"
              : "undetermined";

        for (const recipient of recipients) {
          const category = categorizeEmail(recipient);
          const brokerKey = lookupBrokerByEmail(recipient);

          const result = await recordBounce({
            email: recipient,
            bounceType,
            category,
            brokerKey: brokerKey || undefined,
            resendEmailId: emailId,
          });

          if (result.suppressed) {
            console.log(
              `[Resend Webhook] SUPPRESSED ${recipient} (${bounceType} bounce #${result.bounceCount}, category: ${category}${brokerKey ? `, broker: ${brokerKey}` : ""})`
            );
          }
        }
        break;
      }

      case "email.complained": {
        for (const recipient of recipients) {
          const category = categorizeEmail(recipient);
          await recordComplaint({
            email: recipient,
            category,
            resendEmailId: emailId,
          });
          console.log(
            `[Resend Webhook] COMPLAINT from ${recipient} — immediately suppressed`
          );
        }
        break;
      }

      case "email.delivered": {
        // Successful delivery — could reset transient bounce count, but
        // we keep the record for analytics. Only log for monitoring.
        console.log(
          `[Resend Webhook] Delivered to ${recipients.join(", ")}`
        );
        break;
      }

      default:
        console.log(`[Resend Webhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Resend Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
