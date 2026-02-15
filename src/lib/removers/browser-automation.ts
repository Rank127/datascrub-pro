/**
 * Browser Automation Service for Form-Based Opt-Outs
 *
 * This service handles automated form submissions for data broker opt-outs.
 *
 * Requirements:
 * - BROWSERLESS_API_KEY: For browser automation ($50/month for 10,000 sessions)
 * - CAPSOLVER_API_KEY: For CAPTCHA solving (~$1-2 per 1000 CAPTCHAs)
 *
 * Supports:
 * - Simple forms (no CAPTCHA)
 * - reCAPTCHA v2/v3
 * - hCaptcha
 * - Image CAPTCHAs
 */

import { DATA_BROKER_DIRECTORY } from "./data-broker-directory";
import { solveCaptcha, isCaptchaSolverEnabled, type CaptchaType } from "./captcha-solver";

// Browser automation result
export interface AutomationResult {
  success: boolean;
  method: "FORM_SUBMIT" | "API" | "MANUAL_REQUIRED" | "DRY_RUN";
  message: string;
  screenshotUrl?: string;
  confirmationCode?: string;
  nextSteps?: string[];
  error?: string;
}

// Form field mapping for different data brokers
export interface FormFieldMapping {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  reason?: string;
  captcha?: boolean;
  additionalFields?: Record<string, string>;
}

// Opt-out form configurations for different brokers
// NOTE: Most data broker sites now use Cloudflare bot protection
// Sites with hasCloudflare: true require manual submission or residential proxies
const FORM_CONFIGS: Record<string, {
  url: string;
  fields: FormFieldMapping;
  submitButton: string;
  confirmationIndicator: string;
  requiresCaptcha: boolean;
  captchaType?: CaptchaType;
  captchaSiteKey?: string;
  hasCloudflare?: boolean; // Sites with Cloudflare bot protection
  notes?: string;
}> = {
  TRUEPEOPLESEARCH: {
    url: "https://www.truepeoplesearch.com/removal",
    fields: {
      name: "input[name='name'], #name",
      email: "input[name='email'], #email",
    },
    submitButton: "button[type='submit'], .remove-btn",
    confirmationIndicator: ".success-message, .confirmation",
    requiresCaptcha: false,
    hasCloudflare: true,
    notes: "Has Cloudflare protection - use email opt-out instead",
  },
  FASTPEOPLESEARCH: {
    url: "https://www.fastpeoplesearch.com/removal",
    fields: {
      name: "input[name='name']",
      email: "input[name='email']",
    },
    submitButton: "button[type='submit']",
    confirmationIndicator: ".success, .removed",
    requiresCaptcha: false,
    hasCloudflare: true,
  },
  SPOKEO: {
    url: "https://www.spokeo.com/optout",
    fields: {
      email: "input[name='email'], input[type='email']",
    },
    submitButton: "button[type='submit'], .submit-btn",
    confirmationIndicator: ".confirmation, .success",
    requiresCaptcha: true,
    captchaType: "recaptcha_v2",
    captchaSiteKey: "6LcJpRgTAAAAAHXTqG3_fvGnf7rvLrGb5CIqTfJK",
    hasCloudflare: true,
    notes: "Has Cloudflare - requires email verification after submission",
  },
  WHITEPAGES: {
    url: "https://www.whitepages.com/suppression-requests",
    fields: {
      name: "input[name='name']",
      email: "input[name='email']",
      phone: "input[name='phone']",
    },
    submitButton: "button[type='submit']",
    confirmationIndicator: ".success, .confirmation",
    requiresCaptcha: true,
    captchaType: "recaptcha_v2",
    captchaSiteKey: "6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-",
    hasCloudflare: true,
    notes: "Has Cloudflare - may require phone verification",
  },
  BEENVERIFIED: {
    url: "https://www.beenverified.com/opt-out/",
    fields: {
      email: "input[name='email']",
    },
    submitButton: "button[type='submit']",
    confirmationIndicator: ".success",
    requiresCaptcha: true,
    captchaType: "recaptcha_v2",
    captchaSiteKey: "6LfF1dcZAAAAADq_P7WHVAsB6nRhCYZm1vHxuicc",
    hasCloudflare: true,
  },
  RADARIS: {
    url: "https://radaris.com/control/privacy",
    fields: {
      name: "input[name='name']",
      email: "input[name='email']",
    },
    submitButton: "button[type='submit']",
    confirmationIndicator: ".success",
    requiresCaptcha: true,
    captchaType: "recaptcha_v2",
    captchaSiteKey: "6LcmrUMUAAAAAJlYG-LN_3smS_uu3p-w9G6ZBaU7",
    hasCloudflare: true,
    notes: "Complex multi-step process",
  },
  FAMILYTREENOW: {
    url: "https://www.familytreenow.com/optout",
    fields: {
      name: "input[name='name']",
    },
    submitButton: "button.opt-out",
    confirmationIndicator: ".success, .opted-out",
    requiresCaptcha: false,
    hasCloudflare: true,
  },
  THATSTHEM: {
    url: "https://thatsthem.com/optout",
    fields: {
      name: "input[name='name']",
      email: "input[name='email']",
    },
    submitButton: "button[type='submit']",
    confirmationIndicator: ".success",
    requiresCaptcha: false,
    hasCloudflare: true,
  },
};

// Browserless.io configuration
// FREE TIER: 1,000 units/month, 1 concurrent, 1 min max session
// Set BROWSERLESS_DRY_RUN=true to simulate without using units
interface BrowserlessConfig {
  apiKey: string;
  endpoint: string;
  dryRun: boolean;
}

// Track usage to warn when approaching limits
let browserlessUnitsUsed = 0;
const BROWSERLESS_MONTHLY_LIMIT = 1000;
const BROWSERLESS_WARNING_THRESHOLD = 800;

function getBrowserlessConfig(): BrowserlessConfig | null {
  const apiKey = process.env.BROWSERLESS_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    endpoint: process.env.BROWSERLESS_ENDPOINT || "https://production-sfo.browserless.io",
    dryRun: process.env.BROWSERLESS_DRY_RUN === "true",
  };
}

/**
 * Check if a broker can be automated via FORM (no blockers)
 * Use this to pre-check before attempting form automation
 */
export function canAutomateBroker(brokerKey: string): {
  canAutomate: boolean;
  reason?: string;
} {
  const formConfig = FORM_CONFIGS[brokerKey];

  if (!formConfig) {
    return { canAutomate: false, reason: "No form configuration" };
  }

  if (formConfig.hasCloudflare) {
    return { canAutomate: false, reason: "Cloudflare bot protection" };
  }

  if (formConfig.requiresCaptcha && !isCaptchaSolverEnabled()) {
    return { canAutomate: false, reason: "Requires CAPTCHA, solver not configured" };
  }

  return { canAutomate: true };
}

/**
 * Determine the best automation method for a broker
 * Priority: Form (if possible) → Email (if available) → Manual
 *
 * This ensures we maximize automation before falling back to manual requests
 */
export function getBestAutomationMethod(brokerKey: string): {
  method: "FORM" | "EMAIL" | "MANUAL";
  reason: string;
  canAutomate: boolean;
} {
  const broker = DATA_BROKER_DIRECTORY[brokerKey];

  if (!broker) {
    return {
      method: "MANUAL",
      reason: "Unknown broker - not in directory",
      canAutomate: false,
    };
  }

  // Check if form automation is possible
  const formCheck = canAutomateBroker(brokerKey);

  if (formCheck.canAutomate) {
    return {
      method: "FORM",
      reason: "Form automation available",
      canAutomate: true,
    };
  }

  // Form blocked - check if email is available
  const supportsEmail = broker.removalMethod === "EMAIL" || broker.removalMethod === "BOTH";
  const hasPrivacyEmail = !!broker.privacyEmail;

  if (supportsEmail && hasPrivacyEmail) {
    return {
      method: "EMAIL",
      reason: `Form blocked (${formCheck.reason}), using email automation instead`,
      canAutomate: true,
    };
  }

  // Neither form nor email available
  return {
    method: "MANUAL",
    reason: broker.removalMethod === "FORM"
      ? `Form-only broker with Cloudflare protection`
      : `No automation available - ${formCheck.reason}`,
    canAutomate: false,
  };
}

/**
 * Check if a broker supports any form of automation (form OR email)
 */
export function canAutomateBrokerAny(brokerKey: string): {
  canAutomate: boolean;
  preferredMethod: "FORM" | "EMAIL" | "MANUAL";
  reason: string;
} {
  const result = getBestAutomationMethod(brokerKey);
  return {
    canAutomate: result.canAutomate,
    preferredMethod: result.method,
    reason: result.reason,
  };
}

/**
 * Get current Browserless usage stats
 */
export function getBrowserlessUsage(): {
  unitsUsed: number;
  limit: number;
  remaining: number;
  warningThreshold: number;
  nearLimit: boolean;
} {
  return {
    unitsUsed: browserlessUnitsUsed,
    limit: BROWSERLESS_MONTHLY_LIMIT,
    remaining: BROWSERLESS_MONTHLY_LIMIT - browserlessUnitsUsed,
    warningThreshold: BROWSERLESS_WARNING_THRESHOLD,
    nearLimit: browserlessUnitsUsed >= BROWSERLESS_WARNING_THRESHOLD,
  };
}

/**
 * Execute form submission via Browserless.io
 * Uses their /function API for custom browser automation
 */
async function executeBrowserlessForm(
  brokerKey: string,
  formData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    profileUrl?: string;
  }
): Promise<AutomationResult> {
  const config = getBrowserlessConfig();
  if (!config) {
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: "Browser automation not configured (BROWSERLESS_API_KEY missing)",
      nextSteps: ["Configure BROWSERLESS_API_KEY in environment variables"],
    };
  }

  const formConfig = FORM_CONFIGS[brokerKey];
  if (!formConfig) {
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: `No form configuration for ${brokerKey}`,
      nextSteps: ["Submit opt-out manually using the broker's website"],
    };
  }

  // Check for Cloudflare bot protection (no API call needed)
  if (formConfig.hasCloudflare) {
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: `${brokerKey} has Cloudflare bot protection - form automation blocked`,
      nextSteps: [
        "This site blocks automated browsers",
        `Visit ${formConfig.url} manually to submit opt-out`,
        "Or use email-based CCPA/GDPR request instead (recommended)",
      ],
    };
  }

  // Check usage limits before making API call
  const usage = getBrowserlessUsage();
  if (usage.remaining <= 0) {
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: `Browserless monthly limit reached (${usage.limit} units)`,
      nextSteps: [
        "Wait for monthly reset or upgrade plan",
        `Visit ${formConfig.url} manually to submit opt-out`,
      ],
    };
  }

  if (usage.nearLimit) {
    console.warn(`[Browserless] WARNING: ${usage.remaining} units remaining this month`);
  }

  // Dry-run mode - simulate without using API units
  if (config.dryRun) {
    console.log(`[Browserless] DRY-RUN: Would submit form for ${brokerKey}`);
    console.log(`[Browserless] DRY-RUN: URL: ${formConfig.url}`);
    console.log(`[Browserless] DRY-RUN: Fields: ${Object.keys(formConfig.fields).join(", ")}`);
    return {
      success: false,
      method: "DRY_RUN",
      message: `DRY-RUN: Form submission simulated for ${brokerKey}`,
      nextSteps: ["Set BROWSERLESS_DRY_RUN=false to enable real submissions"],
    };
  }

  // Handle CAPTCHA if required
  let captchaToken: string | undefined;

  if (formConfig.requiresCaptcha) {
    if (!isCaptchaSolverEnabled()) {
      return {
        success: false,
        method: "MANUAL_REQUIRED",
        message: `${brokerKey} requires CAPTCHA - solver not configured`,
        nextSteps: [
          "Set CAPSOLVER_API_KEY in environment, or:",
          `Visit ${formConfig.url}`,
          "Complete the opt-out form manually",
          "Solve the CAPTCHA",
          "Submit and save confirmation",
        ],
      };
    }

    if (!formConfig.captchaType || !formConfig.captchaSiteKey) {
      return {
        success: false,
        method: "MANUAL_REQUIRED",
        message: `${brokerKey} CAPTCHA configuration incomplete`,
        nextSteps: [`Visit ${formConfig.url}`, "Complete manually"],
      };
    }

    console.log(`[Automation] Solving ${formConfig.captchaType} CAPTCHA for ${brokerKey}...`);

    const captchaResult = await solveCaptcha({
      type: formConfig.captchaType,
      siteKey: formConfig.captchaSiteKey,
      pageUrl: formConfig.url,
    });

    if (!captchaResult.success || !captchaResult.solution) {
      return {
        success: false,
        method: "MANUAL_REQUIRED",
        message: `CAPTCHA solving failed: ${captchaResult.error}`,
        nextSteps: [`Visit ${formConfig.url}`, "Complete manually"],
      };
    }

    captchaToken = captchaResult.solution;
    console.log(`[Automation] CAPTCHA solved in ${captchaResult.solveTime}s`);
  }

  try {
    // Browserless function to fill and submit the form (ES module format for v2)
    const browserlessCode = `
export default async function ({ page, context }) {
  const { url, fields, submitButton, confirmationIndicator, formData, captchaToken, captchaType } = context;

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Fill form fields
  if (fields.name && formData.name) {
    await page.waitForSelector(fields.name, { timeout: 5000 }).catch(() => null);
    await page.type(fields.name, formData.name);
  }

  if (fields.email && formData.email) {
    await page.waitForSelector(fields.email, { timeout: 5000 }).catch(() => null);
    await page.type(fields.email, formData.email);
  }

  if (fields.phone && formData.phone) {
    await page.waitForSelector(fields.phone, { timeout: 5000 }).catch(() => null);
    await page.type(fields.phone, formData.phone);
  }

  // Inject CAPTCHA token if solved
  if (captchaToken) {
    if (captchaType === 'recaptcha_v2' || captchaType === 'recaptcha_v2_invisible' || captchaType === 'recaptcha_v3') {
      await page.evaluate((token) => {
        const textarea = document.getElementById('g-recaptcha-response');
        if (textarea) {
          textarea.innerHTML = token;
          textarea.value = token;
        }
        const input = document.querySelector('input[name="g-recaptcha-response"]');
        if (input) input.value = token;
        if (window.grecaptcha && window.grecaptcha.getResponse) {
          try { window.___grecaptcha_cfg.clients[0].K.K.callback(token); } catch(e) { console.warn('[CAPTCHA] reCAPTCHA callback injection failed:', e); }
        }
      }, captchaToken);
    } else if (captchaType === 'hcaptcha') {
      await page.evaluate((token) => {
        const textarea = document.querySelector('textarea[name="h-captcha-response"]');
        if (textarea) {
          textarea.innerHTML = token;
          textarea.value = token;
        }
        const input = document.querySelector('input[name="h-captcha-response"]');
        if (input) input.value = token;
      }, captchaToken);
    }
  }

  // Click submit button
  await page.waitForSelector(submitButton, { timeout: 5000 });
  await page.click(submitButton);

  // Wait for confirmation
  await page.waitForTimeout(3000);

  // Check for success indicator
  const success = await page.$(confirmationIndicator) !== null;

  // Take screenshot
  const screenshot = await page.screenshot({ encoding: 'base64' });

  return {
    data: { success, screenshot, url: page.url() },
    type: 'application/json',
  };
}
    `;

    const response = await fetch(`${config.endpoint}/function?token=${config.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: browserlessCode,
        context: {
          url: formConfig.url,
          fields: formConfig.fields,
          submitButton: formConfig.submitButton,
          confirmationIndicator: formConfig.confirmationIndicator,
          formData,
          captchaToken,
          captchaType: formConfig.captchaType,
        },
      }),
    });

    // Track unit usage (each API call uses 1 unit)
    browserlessUnitsUsed++;
    console.log(`[Browserless] API call made. Units used this session: ${browserlessUnitsUsed}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Browserless API error: ${error}`);
    }

    const result = await response.json();

    // Handle both direct response and wrapped { data, type } format
    const data = result.data || result;

    if (data.success) {
      return {
        success: true,
        method: "FORM_SUBMIT",
        message: `Successfully submitted opt-out form for ${brokerKey}`,
        screenshotUrl: data.screenshot ? `data:image/png;base64,${data.screenshot}` : undefined,
        nextSteps: formConfig.notes
          ? [formConfig.notes]
          : ["Check your email for verification link if required"],
      };
    } else {
      return {
        success: false,
        method: "MANUAL_REQUIRED",
        message: `Form submission did not show confirmation for ${brokerKey}`,
        nextSteps: [
          `Visit ${formConfig.url} to complete opt-out manually`,
          "The form may have changed or requires additional steps",
        ],
      };
    }
  } catch (error) {
    console.error(`[BrowserAutomation] Error for ${brokerKey}:`, error);
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: `Automation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error",
      nextSteps: [
        `Visit ${formConfig.url} to complete opt-out manually`,
      ],
    };
  }
}

/**
 * Get manual opt-out instructions for a broker
 */
export function getManualOptOutInstructions(brokerKey: string): {
  url: string;
  steps: string[];
  estimatedDays: number;
} {
  const broker = DATA_BROKER_DIRECTORY[brokerKey];
  const formConfig = FORM_CONFIGS[brokerKey];

  if (!broker) {
    return {
      url: "",
      steps: ["Data broker not found in directory"],
      estimatedDays: 30,
    };
  }

  const steps: string[] = [];

  if (broker.optOutUrl) {
    steps.push(`1. Visit the opt-out page: ${broker.optOutUrl}`);
    steps.push("2. Search for your listing using your name and location");
    steps.push("3. Select your profile from the search results");
  }

  if (formConfig) {
    steps.push("4. Fill out the opt-out form with your information");
    if (formConfig.requiresCaptcha) {
      steps.push("5. Complete the CAPTCHA verification");
    }
    steps.push(`${formConfig.requiresCaptcha ? "6" : "5"}. Submit the form and save any confirmation`);
  } else if (broker.privacyEmail) {
    steps.push(`4. If no form is available, email: ${broker.privacyEmail}`);
    steps.push("5. Include your full name and any profile URLs");
    steps.push("6. Reference CCPA/GDPR rights in your request");
  }

  if (broker.notes) {
    steps.push(`Note: ${broker.notes}`);
  }

  return {
    url: broker.optOutUrl || "",
    steps,
    estimatedDays: broker.estimatedDays,
  };
}

/**
 * Main function to attempt automated form opt-out
 */
export async function attemptAutomatedOptOut(
  brokerKey: string,
  userData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    profileUrl?: string;
  }
): Promise<AutomationResult> {
  const broker = DATA_BROKER_DIRECTORY[brokerKey];

  if (!broker) {
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: `Unknown broker: ${brokerKey}`,
    };
  }

  // Check if we have form configuration for this broker
  const formConfig = FORM_CONFIGS[brokerKey];

  if (!formConfig) {
    // No form config - provide manual instructions
    const instructions = getManualOptOutInstructions(brokerKey);
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: `Automated opt-out not available for ${broker.name}`,
      nextSteps: instructions.steps,
    };
  }

  // Check if form requires CAPTCHA and we can't solve it
  if (formConfig.requiresCaptcha && !isCaptchaSolverEnabled()) {
    return {
      success: false,
      method: "MANUAL_REQUIRED",
      message: `${broker.name} requires CAPTCHA verification and solver is not configured`,
      nextSteps: [
        `Visit ${formConfig.url}`,
        "Complete the opt-out form",
        "Solve the CAPTCHA",
        "Submit and note any confirmation number",
      ],
    };
  }

  // Attempt automated form submission via Browserless (handles CAPTCHA with solver)
  return executeBrowserlessForm(brokerKey, userData);
}

/**
 * Get brokers that support automated FORM opt-out (no Cloudflare)
 */
export function getAutomatedOptOutBrokers(): string[] {
  return Object.entries(FORM_CONFIGS)
    .filter(([, config]) => !config.requiresCaptcha && !config.hasCloudflare)
    .map(([key]) => key);
}

/**
 * Get brokers that require manual opt-out (no automation available)
 */
export function getManualOptOutBrokers(): string[] {
  return Object.keys(DATA_BROKER_DIRECTORY).filter(key => {
    const best = getBestAutomationMethod(key);
    return !best.canAutomate;
  });
}

/**
 * Get all brokers that can be automated (form OR email)
 * This is the key metric - shows how many brokers we can handle without user intervention
 */
export function getAllAutomatableBrokers(): {
  total: number;
  formAutomated: string[];
  emailAutomated: string[];
  manualOnly: string[];
  stats: {
    formCount: number;
    emailCount: number;
    manualCount: number;
    automationRate: number;
  };
} {
  const formAutomated: string[] = [];
  const emailAutomated: string[] = [];
  const manualOnly: string[] = [];

  for (const key of Object.keys(DATA_BROKER_DIRECTORY)) {
    const best = getBestAutomationMethod(key);
    if (best.method === "FORM") {
      formAutomated.push(key);
    } else if (best.method === "EMAIL") {
      emailAutomated.push(key);
    } else {
      manualOnly.push(key);
    }
  }

  const total = Object.keys(DATA_BROKER_DIRECTORY).length;
  const automated = formAutomated.length + emailAutomated.length;

  return {
    total,
    formAutomated,
    emailAutomated,
    manualOnly,
    stats: {
      formCount: formAutomated.length,
      emailCount: emailAutomated.length,
      manualCount: manualOnly.length,
      automationRate: total > 0 ? Math.round((automated / total) * 100) : 0,
    },
  };
}

/**
 * Check if Browserless automation is configured
 */
export function isAutomationEnabled(): boolean {
  return !!process.env.BROWSERLESS_API_KEY;
}

/**
 * Get automation status and capabilities
 */
export function getAutomationStatus(): {
  enabled: boolean;
  provider: string;
  automatedBrokers: number;
  manualBrokers: number;
} {
  const automatedBrokers = getAutomatedOptOutBrokers();
  const manualBrokers = getManualOptOutBrokers();

  return {
    enabled: isAutomationEnabled(),
    provider: process.env.BROWSERLESS_API_KEY ? "Browserless.io" : "None",
    automatedBrokers: automatedBrokers.length,
    manualBrokers: manualBrokers.length,
  };
}
