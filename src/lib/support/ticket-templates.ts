/**
 * Ticket Templates & Rule Engine
 *
 * Shared deterministic logic for ticket analysis and response generation.
 * Used by both ticketing-agent and support-agent as the first resolution path.
 * Claude is only called when these rules return null (escalation needed).
 */

import type { TicketContext, SentimentAnalysis } from "@/lib/agents/ticketing-agent";

// ============================================================================
// ESCALATION KEYWORDS
// ============================================================================

export const LEGAL_THREAT_KEYWORDS = [
  "lawsuit", "attorney", "lawyer", "legal action", "class action",
  "ftc", "bbb", "consumer protection",
];

export const SECURITY_KEYWORDS = [
  "hacked", "breach", "unauthorized access", "identity theft",
  "stolen", "compromised",
];

// ============================================================================
// ESCALATION GATE
// ============================================================================

/**
 * Determines whether a ticket requires AI analysis (Claude).
 * Returns true if any escalation gate fires — meaning rules cannot handle it.
 */
export function shouldEscalateToAI(context: TicketContext): boolean {
  const text = `${context.subject} ${context.description} ${context.newComment || ""}`.toLowerCase();

  // 1. Legal threat keywords
  if (LEGAL_THREAT_KEYWORDS.some((kw) => text.includes(kw))) return true;

  // 2. Security keywords
  if (SECURITY_KEYWORDS.some((kw) => text.includes(kw))) return true;

  // 3. VIP user + frustrated
  if (context.userHistory?.isVIP && context.sentiment?.frustration) return true;

  // 4. Critical urgency level
  if (context.sentiment?.urgency === "critical") return true;

  // 5. URGENT priority already set
  if (context.priority === "URGENT") return true;

  // 6. Repeat customer with poor resolution history + frustration
  if (
    context.userHistory &&
    context.userHistory.totalTickets > 3 &&
    context.userHistory.resolvedTickets / Math.max(context.userHistory.totalTickets, 1) < 0.5 &&
    context.sentiment?.frustration
  ) {
    return true;
  }

  // 7. Follow-up comment with 2+ prior user messages (conversation needs continuity)
  if (context.newComment) {
    const userMessages = context.previousComments.filter((c) => c.isFromUser).length;
    if (userMessages >= 2) return true;
  }

  return false;
}

// ============================================================================
// TEMPLATE RESPONSES
// ============================================================================

/**
 * Returns a personalized template response for the given ticket type.
 */
export function getTemplateResponse(
  type: string,
  userName: string,
  userPlan: string,
  context: TicketContext
): string {
  const isVIP = context.userHistory?.isVIP;
  const greeting = isVIP
    ? `Hi ${userName}, thank you for being a valued GhostMyData subscriber.`
    : `Hi ${userName}, thank you for reaching out to GhostMyData support.`;

  switch (type) {
    case "SCAN_ERROR": {
      const scanRef = context.linkedScan
        ? ` We can see your recent scan encountered a ${context.linkedScan.status.toLowerCase()} status.`
        : "";
      return `${greeting}${scanRef} Our scanning infrastructure processes thousands of data sources and occasionally encounters temporary delays. Please try running your scan again — if the issue persists, our team will investigate further. We appreciate your patience.`;
    }

    case "REMOVAL_FAILED": {
      const brokerName = context.linkedRemoval?.brokerName || "the data broker";
      const attempts = context.linkedRemoval?.attempts || 0;
      const attemptNote = attempts > 1 ? ` We've already made ${attempts} attempts on your behalf.` : "";
      return `${greeting} We understand how important it is to get your data removed from ${brokerName}.${attemptNote} Data brokers have varying response times and removal processes — most complete within 2-4 weeks. Our system will continue to follow up automatically. We'll notify you as soon as the removal is confirmed.`;
    }

    case "PAYMENT_ISSUE":
      return `${greeting} We take billing concerns very seriously. A member of our team will review your account within 24 hours and reach out with a resolution. In the meantime, your service will continue uninterrupted. If you need immediate assistance, please email support@ghostmydata.com.`;

    case "ACCOUNT_ISSUE":
      return `${greeting} Here's how to regain access to your account:\n\n1. Go to the GhostMyData login page\n2. Click "Forgot Password"\n3. Enter the email address associated with your account\n4. Check your inbox (and spam folder) for the reset link\n5. Create a new password and log in\n\nIf you're still having trouble after these steps, let us know and we'll assist you further.`;

    case "FEATURE_REQUEST":
      return `${greeting} We appreciate you taking the time to share your idea! Your feedback has been logged and shared with our product team. Suggestions from our users are a key part of how we prioritize our roadmap. Thank you for helping us improve GhostMyData!`;

    default: {
      // OTHER — plan-aware response
      const planNote =
        userPlan === "FREE"
          ? " As a free user, you have full access to scan and view your exposures. Upgrade to PRO or ENTERPRISE to unlock automated removals and monitoring."
          : " As a valued subscriber, you have full access to our automated removal and monitoring features.";
      return `${greeting}${planNote} We've received your message and our support team will review it shortly. If you need immediate help, please email support@ghostmydata.com.`;
    }
  }
}

// ============================================================================
// SUGGESTED ACTIONS (aligned with ticket-service.ts AUTO_RESOLVE_ACTIONS)
// ============================================================================

/**
 * Returns suggested internal actions for the given ticket type.
 */
export function getSuggestedActions(type: string): string[] {
  const actions: Record<string, string[]> = {
    SCAN_ERROR: ["retry_scan"],
    REMOVAL_FAILED: ["retry_removal", "retry_alternate_emails"],
    PAYMENT_ISSUE: ["check_stripe", "send_payment_link"],
    ACCOUNT_ISSUE: ["reset_sessions", "verify_email"],
    FEATURE_REQUEST: ["log_feature", "check_roadmap"],
    OTHER: ["check_status"],
  };
  return actions[type] || actions.OTHER;
}

// ============================================================================
// RULE-BASED ANALYZE (main entry point)
// ============================================================================

interface RuleBasedResponse {
  canAutoResolve: boolean;
  response: string;
  suggestedActions: string[];
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  needsHumanReview: boolean;
  internalNote: string;
  managerReviewItems: string[];
}

/**
 * Attempts to fully resolve a ticket using deterministic rules.
 * Returns a complete AgentResponse if rules can handle it, or null if Claude is needed.
 */
export function ruleBasedAnalyze(context: TicketContext): RuleBasedResponse | null {
  // Check escalation gates — if any fire, defer to AI
  if (shouldEscalateToAI(context)) {
    return null;
  }

  const sentiment = context.sentiment;

  // Calculate priority from sentiment
  let priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" = "NORMAL";
  if (sentiment?.frustration || sentiment?.urgency === "high") {
    priority = "HIGH";
  } else if (sentiment?.score && sentiment.score > 0 && sentiment.urgency === "low") {
    priority = "LOW";
  }

  // Generate template response
  const response = getTemplateResponse(
    context.type,
    context.userName,
    context.userPlan,
    context
  );

  // Determine auto-resolve eligibility
  const autoResolvableTypes = ["SCAN_ERROR", "FEATURE_REQUEST", "ACCOUNT_ISSUE"];
  const canAutoResolve =
    autoResolvableTypes.includes(context.type) &&
    !sentiment?.frustration &&
    priority !== "HIGH";

  return {
    canAutoResolve,
    response,
    suggestedActions: getSuggestedActions(context.type),
    priority,
    needsHumanReview: !canAutoResolve,
    internalNote: `Rule-based resolution (type=${context.type}, sentiment=${sentiment?.score?.toFixed(1) ?? "n/a"}, frustration=${sentiment?.frustration ?? false})`,
    managerReviewItems: [],
  };
}
