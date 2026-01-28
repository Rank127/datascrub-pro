import twilio from "twilio";

// Initialize Twilio client (lazy initialization)
let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn("[SMS] Twilio credentials not configured");
      return null;
    }

    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GhostMyData";
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS message
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<SMSResult> {
  const client = getClient();

  if (!client) {
    return { success: false, error: "Twilio not configured" };
  }

  if (!FROM_NUMBER) {
    return { success: false, error: "Twilio phone number not configured" };
  }

  try {
    const message = await client.messages.create({
      body,
      from: FROM_NUMBER,
      to,
    });

    console.log(`[SMS] Sent to ${to}: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("[SMS] Failed to send:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send verification code using Twilio Verify (bypasses carrier filtering)
 */
export async function sendVerificationCode(
  phone: string,
  _code?: string // Ignored - Twilio Verify generates its own code
): Promise<SMSResult> {
  const client = getClient();
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!client) {
    return { success: false, error: "Twilio not configured" };
  }

  if (!verifyServiceSid) {
    // Fallback to regular SMS if Verify not configured
    const body = `${APP_NAME}: Your verification code is ${_code}. This code expires in 10 minutes.`;
    return sendSMS(phone, body);
  }

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone, channel: "sms" });

    console.log(`[SMS] Verify sent to ${phone}: ${verification.sid}`);
    return { success: true, messageId: verification.sid };
  } catch (error) {
    console.error("[SMS] Verify failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check verification code using Twilio Verify
 */
export async function checkVerificationCode(
  phone: string,
  code: string
): Promise<{ success: boolean; valid: boolean; error?: string }> {
  const client = getClient();
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!client || !verifyServiceSid) {
    return { success: false, valid: false, error: "Twilio Verify not configured" };
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code });

    console.log(`[SMS] Verify check for ${phone}: ${verificationCheck.status}`);
    return {
      success: true,
      valid: verificationCheck.status === "approved"
    };
  } catch (error) {
    console.error("[SMS] Verify check failed:", error);
    return {
      success: false,
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send new exposure alert
 */
export async function sendExposureAlert(
  phone: string,
  exposureCount: number,
  criticalCount: number = 0
): Promise<SMSResult> {
  let body = `${APP_NAME} Alert: ${exposureCount} new exposure(s) found`;

  if (criticalCount > 0) {
    body += ` (${criticalCount} critical!)`;
  }

  body += `. View details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/exposures`;

  return sendSMS(phone, body);
}

/**
 * Send removal completion notification
 */
export async function sendRemovalComplete(
  phone: string,
  sourceName: string,
  totalRemoved: number
): Promise<SMSResult> {
  const body = `${APP_NAME}: Your data has been removed from ${sourceName}. Total removed: ${totalRemoved} sites. View: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/removals`;
  return sendSMS(phone, body);
}

/**
 * Send urgent breach alert
 */
export async function sendBreachAlert(
  phone: string,
  breachName: string,
  dataTypes: string[]
): Promise<SMSResult> {
  const body = `🚨 ${APP_NAME} URGENT: Your data was found in the ${breachName} breach. Exposed: ${dataTypes.join(", ")}. Take action: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
  return sendSMS(phone, body);
}

/**
 * Send scan complete notification
 */
export async function sendScanComplete(
  phone: string,
  exposuresFound: number
): Promise<SMSResult> {
  const body = exposuresFound > 0
    ? `${APP_NAME}: Scan complete. Found ${exposuresFound} exposure(s). Review: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/exposures`
    : `${APP_NAME}: Scan complete. No new exposures found. You're protected! 🛡️`;

  return sendSMS(phone, body);
}

/**
 * Send ticket update notification
 */
export async function sendTicketUpdate(
  phone: string,
  ticketNumber: string,
  status: string
): Promise<SMSResult> {
  const body = `${APP_NAME}: Your support ticket ${ticketNumber} has been updated to: ${status}. View: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support`;
  return sendSMS(phone, body);
}

/**
 * Check if SMS is configured
 */
export function isSMSConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneE164(phone: string, countryCode: string = "1"): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // If already has country code (11+ digits for US), return with +
  if (cleaned.length >= 11) {
    return `+${cleaned}`;
  }

  // Add country code
  return `+${countryCode}${cleaned}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // Valid US number: 10 digits, or 11 with country code
  return cleaned.length >= 10 && cleaned.length <= 15;
}
