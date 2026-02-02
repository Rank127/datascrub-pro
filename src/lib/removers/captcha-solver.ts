/**
 * CAPTCHA Solver Service using CapSolver
 *
 * Supports:
 * - reCAPTCHA v2 (checkbox and invisible)
 * - reCAPTCHA v3
 * - hCaptcha
 * - Image CAPTCHA (text recognition)
 * - FunCaptcha
 *
 * Pricing (as of 2026):
 * - reCAPTCHA v2: $0.8-1.5 per 1000 solved
 * - reCAPTCHA v3: $1.5-2.5 per 1000 solved
 * - hCaptcha: $0.8-1.5 per 1000 solved
 * - Image CAPTCHA: $0.1-0.2 per 1000
 *
 * Set CAPSOLVER_API_KEY in environment to enable.
 * Get your API key at: https://capsolver.com
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

const CAPSOLVER_API = "https://api.capsolver.com";
const POLL_INTERVAL = 2000;  // 2 seconds (CapSolver is faster)
const MAX_POLL_TIME = 120000; // 2 minutes max wait

/**
 * Check if CAPTCHA solving is enabled
 */
export function isCaptchaSolverEnabled(): boolean {
  return !!process.env.CAPSOLVER_API_KEY;
}

/**
 * Get CapSolver account balance
 */
export async function getCaptchaBalance(): Promise<number | null> {
  const apiKey = process.env.CAPSOLVER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${CAPSOLVER_API}/getBalance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientKey: apiKey }),
    });
    const data = await response.json();

    if (data.errorId === 0) {
      return data.balance;
    }
    console.error("[Captcha] Balance error:", data.errorDescription);
    return null;
  } catch {
    return null;
  }
}

/**
 * Solve a CAPTCHA using CapSolver service
 */
export async function solveCaptcha(request: CaptchaSolveRequest): Promise<CaptchaSolveResult> {
  const apiKey = process.env.CAPSOLVER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "CAPTCHA solver not configured (CAPSOLVER_API_KEY missing)",
    };
  }

  const startTime = Date.now();

  try {
    // Submit CAPTCHA for solving
    const taskResult = await submitCaptcha(apiKey, request);

    if (!taskResult.success) {
      return {
        success: false,
        error: taskResult.error || "Failed to submit CAPTCHA to solver",
      };
    }

    // If solution is returned immediately (CapSolver can do this)
    if (taskResult.solution) {
      const solveTime = (Date.now() - startTime) / 1000;
      console.log(`[Captcha] Solved instantly in ${solveTime.toFixed(1)}s`);
      return {
        success: true,
        solution: taskResult.solution,
        solveTime,
        cost: getCaptchaCost(request.type),
      };
    }

    // Otherwise poll for solution
    if (!taskResult.taskId) {
      return {
        success: false,
        error: "No task ID returned from solver",
      };
    }

    console.log(`[Captcha] Submitted ${request.type} CAPTCHA, task ID: ${taskResult.taskId}`);

    const solution = await pollForSolution(apiKey, taskResult.taskId);

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

interface TaskSubmitResult {
  success: boolean;
  taskId?: string;
  solution?: string;
  error?: string;
}

/**
 * Submit CAPTCHA to CapSolver for solving
 */
async function submitCaptcha(apiKey: string, request: CaptchaSolveRequest): Promise<TaskSubmitResult> {
  let task: Record<string, unknown>;

  switch (request.type) {
    case "recaptcha_v2":
      task = {
        type: "ReCaptchaV2TaskProxyLess",
        websiteURL: request.pageUrl,
        websiteKey: request.siteKey,
      };
      break;

    case "recaptcha_v2_invisible":
      task = {
        type: "ReCaptchaV2TaskProxyLess",
        websiteURL: request.pageUrl,
        websiteKey: request.siteKey,
        isInvisible: true,
      };
      break;

    case "recaptcha_v3":
      task = {
        type: "ReCaptchaV3TaskProxyLess",
        websiteURL: request.pageUrl,
        websiteKey: request.siteKey,
        pageAction: request.action || "verify",
        minScore: request.minScore || 0.7,
      };
      break;

    case "hcaptcha":
      task = {
        type: "HCaptchaTaskProxyLess",
        websiteURL: request.pageUrl,
        websiteKey: request.siteKey,
      };
      break;

    case "image":
      task = {
        type: "ImageToTextTask",
        body: request.imageBase64,
      };
      break;

    case "funcaptcha":
      task = {
        type: "FunCaptchaTaskProxyLess",
        websiteURL: request.pageUrl,
        websitePublicKey: request.siteKey,
      };
      break;

    default:
      return { success: false, error: `Unsupported CAPTCHA type: ${request.type}` };
  }

  try {
    const response = await fetch(`${CAPSOLVER_API}/createTask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientKey: apiKey,
        task,
      }),
    });
    const data = await response.json();

    if (data.errorId !== 0) {
      console.error("[Captcha] Submit error:", data.errorDescription);
      return { success: false, error: data.errorDescription };
    }

    // CapSolver may return solution immediately
    if (data.solution) {
      const solution = data.solution.gRecaptchaResponse ||
                       data.solution.token ||
                       data.solution.text ||
                       data.solution;
      return { success: true, solution: typeof solution === 'string' ? solution : JSON.stringify(solution) };
    }

    return { success: true, taskId: data.taskId };
  } catch (error) {
    console.error("[Captcha] Submit exception:", error);
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Poll CapSolver for solution
 */
async function pollForSolution(apiKey: string, taskId: string): Promise<string | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    await sleep(POLL_INTERVAL);

    try {
      const response = await fetch(`${CAPSOLVER_API}/getTaskResult`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: apiKey,
          taskId,
        }),
      });
      const data = await response.json();

      if (data.errorId !== 0) {
        console.error("[Captcha] Poll error:", data.errorDescription);
        return null;
      }

      if (data.status === "ready" && data.solution) {
        // Extract the solution token based on CAPTCHA type
        const solution = data.solution.gRecaptchaResponse ||
                         data.solution.token ||
                         data.solution.text ||
                         data.solution;
        return typeof solution === 'string' ? solution : JSON.stringify(solution);
      }

      if (data.status === "failed") {
        console.error("[Captcha] Task failed:", data.errorDescription);
        return null;
      }

      // Status is "processing", continue polling
    } catch (error) {
      console.error("[Captcha] Poll exception:", error);
      return null;
    }
  }

  return null; // Timeout
}

/**
 * Get estimated cost for CAPTCHA type (CapSolver pricing)
 */
function getCaptchaCost(type: CaptchaType): number {
  const costs: Record<CaptchaType, number> = {
    recaptcha_v2: 0.001,
    recaptcha_v2_invisible: 0.001,
    recaptcha_v3: 0.002,
    hcaptcha: 0.001,
    image: 0.0001,
    funcaptcha: 0.002,
  };
  return costs[type] || 0.002;
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
    provider: enabled ? "CapSolver" : "None",
  };
}
