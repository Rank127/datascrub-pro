/**
 * CAPTCHA Solver Service using 2Captcha
 *
 * Supports:
 * - reCAPTCHA v2 (checkbox and invisible)
 * - reCAPTCHA v3
 * - hCaptcha
 * - Image CAPTCHA (text recognition)
 *
 * Pricing (as of 2026):
 * - reCAPTCHA v2: $2.99 per 1000 solved
 * - reCAPTCHA v3: $2.99 per 1000 solved
 * - hCaptcha: $2.99 per 1000 solved
 * - Image CAPTCHA: $0.50-$1.00 per 1000
 *
 * Set TWOCAPTCHA_API_KEY in environment to enable.
 */

export type CaptchaType =
  | "recaptcha_v2"
  | "recaptcha_v2_invisible"
  | "recaptcha_v3"
  | "hcaptcha"
  | "image"
  | "funcaptcha";

export interface CaptchaSolveRequest {
  type: CaptchaType;
  siteKey?: string;      // For reCAPTCHA/hCaptcha
  pageUrl: string;       // URL where CAPTCHA appears
  imageBase64?: string;  // For image CAPTCHA
  action?: string;       // For reCAPTCHA v3
  minScore?: number;     // For reCAPTCHA v3 (0.1-0.9)
}

export interface CaptchaSolveResult {
  success: boolean;
  solution?: string;     // The solved CAPTCHA token/text
  error?: string;
  cost?: number;         // Cost in USD
  solveTime?: number;    // Time in seconds
}

const TWOCAPTCHA_API = "https://2captcha.com";
const POLL_INTERVAL = 5000;  // 5 seconds
const MAX_POLL_TIME = 180000; // 3 minutes max wait

/**
 * Check if CAPTCHA solving is enabled
 */
export function isCaptchaSolverEnabled(): boolean {
  return !!process.env.TWOCAPTCHA_API_KEY;
}

/**
 * Get 2Captcha account balance
 */
export async function getCaptchaBalance(): Promise<number | null> {
  const apiKey = process.env.TWOCAPTCHA_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${TWOCAPTCHA_API}/res.php?key=${apiKey}&action=getbalance&json=1`
    );
    const data = await response.json();

    if (data.status === 1) {
      return parseFloat(data.request);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Solve a CAPTCHA using 2Captcha service
 */
export async function solveCaptcha(request: CaptchaSolveRequest): Promise<CaptchaSolveResult> {
  const apiKey = process.env.TWOCAPTCHA_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "CAPTCHA solver not configured (TWOCAPTCHA_API_KEY missing)",
    };
  }

  const startTime = Date.now();

  try {
    // Submit CAPTCHA for solving
    const taskId = await submitCaptcha(apiKey, request);

    if (!taskId) {
      return {
        success: false,
        error: "Failed to submit CAPTCHA to solver",
      };
    }

    console.log(`[Captcha] Submitted ${request.type} CAPTCHA, task ID: ${taskId}`);

    // Poll for solution
    const solution = await pollForSolution(apiKey, taskId);

    if (!solution) {
      return {
        success: false,
        error: "CAPTCHA solving timed out or failed",
      };
    }

    const solveTime = (Date.now() - startTime) / 1000;
    console.log(`[Captcha] Solved in ${solveTime.toFixed(1)}s`);

    return {
      success: true,
      solution,
      solveTime,
      cost: getCaptchaCost(request.type),
    };
  } catch (error) {
    console.error("[Captcha] Solve error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Submit CAPTCHA to 2Captcha for solving
 */
async function submitCaptcha(apiKey: string, request: CaptchaSolveRequest): Promise<string | null> {
  const params = new URLSearchParams({
    key: apiKey,
    json: "1",
    soft_id: "4706", // 2Captcha partner ID for tracking
  });

  switch (request.type) {
    case "recaptcha_v2":
    case "recaptcha_v2_invisible":
      params.append("method", "userrecaptcha");
      params.append("googlekey", request.siteKey!);
      params.append("pageurl", request.pageUrl);
      if (request.type === "recaptcha_v2_invisible") {
        params.append("invisible", "1");
      }
      break;

    case "recaptcha_v3":
      params.append("method", "userrecaptcha");
      params.append("googlekey", request.siteKey!);
      params.append("pageurl", request.pageUrl);
      params.append("version", "v3");
      params.append("action", request.action || "verify");
      params.append("min_score", String(request.minScore || 0.3));
      break;

    case "hcaptcha":
      params.append("method", "hcaptcha");
      params.append("sitekey", request.siteKey!);
      params.append("pageurl", request.pageUrl);
      break;

    case "image":
      params.append("method", "base64");
      params.append("body", request.imageBase64!);
      break;

    case "funcaptcha":
      params.append("method", "funcaptcha");
      params.append("publickey", request.siteKey!);
      params.append("pageurl", request.pageUrl);
      break;

    default:
      return null;
  }

  const response = await fetch(`${TWOCAPTCHA_API}/in.php?${params.toString()}`);
  const data = await response.json();

  if (data.status === 1) {
    return data.request; // Task ID
  }

  console.error("[Captcha] Submit error:", data.request);
  return null;
}

/**
 * Poll 2Captcha for solution
 */
async function pollForSolution(apiKey: string, taskId: string): Promise<string | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    await sleep(POLL_INTERVAL);

    const response = await fetch(
      `${TWOCAPTCHA_API}/res.php?key=${apiKey}&action=get&id=${taskId}&json=1`
    );
    const data = await response.json();

    if (data.status === 1) {
      return data.request; // Solution
    }

    if (data.request !== "CAPCHA_NOT_READY") {
      console.error("[Captcha] Poll error:", data.request);
      return null;
    }

    // Still processing, continue polling
  }

  return null; // Timeout
}

/**
 * Get estimated cost for CAPTCHA type
 */
function getCaptchaCost(type: CaptchaType): number {
  const costs: Record<CaptchaType, number> = {
    recaptcha_v2: 0.00299,
    recaptcha_v2_invisible: 0.00299,
    recaptcha_v3: 0.00299,
    hcaptcha: 0.00299,
    image: 0.001,
    funcaptcha: 0.00299,
  };
  return costs[type] || 0.003;
}

/**
 * Helper sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Detect CAPTCHA type on a page (used by browser automation)
 * Returns the CAPTCHA configuration if found
 */
export function detectCaptchaType(html: string): { type: CaptchaType; siteKey: string } | null {
  // reCAPTCHA v2/v3
  const recaptchaMatch = html.match(/data-sitekey="([^"]+)"/);
  if (recaptchaMatch) {
    const isV3 = html.includes("grecaptcha.execute") || html.includes("recaptcha/api.js?render=");
    return {
      type: isV3 ? "recaptcha_v3" : "recaptcha_v2",
      siteKey: recaptchaMatch[1],
    };
  }

  // Check for invisible reCAPTCHA
  const invisibleMatch = html.match(/data-size="invisible".*?data-sitekey="([^"]+)"/);
  if (invisibleMatch) {
    return {
      type: "recaptcha_v2_invisible",
      siteKey: invisibleMatch[1],
    };
  }

  // hCaptcha
  const hcaptchaMatch = html.match(/data-sitekey="([^"]+)".*?class="h-captcha"/i) ||
                        html.match(/class="h-captcha".*?data-sitekey="([^"]+)"/i);
  if (hcaptchaMatch) {
    return {
      type: "hcaptcha",
      siteKey: hcaptchaMatch[1],
    };
  }

  // FunCaptcha
  const funcaptchaMatch = html.match(/data-pkey="([^"]+)"/);
  if (funcaptchaMatch) {
    return {
      type: "funcaptcha",
      siteKey: funcaptchaMatch[1],
    };
  }

  return null;
}

/**
 * Get solver status and stats
 */
export async function getCaptchaSolverStatus(): Promise<{
  enabled: boolean;
  balance: number | null;
  provider: string;
}> {
  const enabled = isCaptchaSolverEnabled();
  const balance = enabled ? await getCaptchaBalance() : null;

  return {
    enabled,
    balance,
    provider: enabled ? "2Captcha" : "None",
  };
}
