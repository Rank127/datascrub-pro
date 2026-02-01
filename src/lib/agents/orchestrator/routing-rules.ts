/**
 * DataScrub Pro Agent Architecture - Routing Rules
 *
 * Defines how requests are routed to appropriate agents.
 * Supports pattern matching, conditions, and fallbacks.
 */

import { AgentContext } from "../types";

// ============================================================================
// TYPES
// ============================================================================

export interface RoutingRule {
  /** Rule identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Pattern to match against action */
  pattern: string | RegExp;
  /** Target agent ID */
  targetAgent: string;
  /** Target capability (optional, derived from action if not specified) */
  targetCapability?: string;
  /** Priority for rule matching (higher = evaluated first) */
  priority: number;
  /** Whether this rule is enabled */
  enabled: boolean;
  /** Conditions that must be met */
  conditions?: RoutingCondition[];
  /** Fallback agent if target is unavailable */
  fallbackAgent?: string;
  /** Transform input before passing to agent */
  inputTransform?: (input: unknown) => unknown;
  /** Description of the rule */
  description?: string;
}

export interface RoutingCondition {
  /** Condition type */
  type: "user_plan" | "priority" | "time_of_day" | "feature_flag" | "custom";
  /** Operator */
  operator: "equals" | "not_equals" | "in" | "not_in" | "greater_than" | "less_than";
  /** Value to compare against */
  value: unknown;
  /** For custom conditions, the evaluation function */
  evaluate?: (context: AgentContext) => boolean;
}

export interface RoutingResult {
  /** Whether a route was found */
  found: boolean;
  /** Target agent ID */
  agentId?: string;
  /** Target capability */
  capability?: string;
  /** Transformed input */
  input?: unknown;
  /** The rule that matched */
  matchedRule?: RoutingRule;
  /** Fallback agent if primary unavailable */
  fallbackAgentId?: string;
}

// ============================================================================
// ROUTING RULES DEFINITIONS
// ============================================================================

/**
 * Default routing rules for the agent system
 */
export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
  // =========================================================================
  // REMOVAL AGENT ROUTES
  // =========================================================================
  {
    id: "removal.batch",
    name: "Batch Removal Processing",
    pattern: /^removal\.(batch|process-batch)$/,
    targetAgent: "removal-agent",
    targetCapability: "batch-process",
    priority: 100,
    enabled: true,
    description: "Route batch removal requests to Removal Agent",
  },
  {
    id: "removal.execute",
    name: "Execute Single Removal",
    pattern: /^removal\.(execute|process)$/,
    targetAgent: "removal-agent",
    targetCapability: "execute-removal",
    priority: 100,
    enabled: true,
  },
  {
    id: "removal.verify",
    name: "Verify Removal",
    pattern: /^removal\.verify$/,
    targetAgent: "removal-agent",
    targetCapability: "verify-removal",
    priority: 100,
    enabled: true,
  },
  {
    id: "removal.strategy",
    name: "Select Removal Strategy",
    pattern: /^removal\.strategy$/,
    targetAgent: "removal-agent",
    targetCapability: "select-strategy",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // SCANNING AGENT ROUTES
  // =========================================================================
  {
    id: "scanning.run",
    name: "Run Scan",
    pattern: /^scan(ning)?\.(run|execute)$/,
    targetAgent: "scanning-agent",
    targetCapability: "run-scan",
    priority: 100,
    enabled: true,
  },
  {
    id: "scanning.analyze",
    name: "Analyze Scan Results",
    pattern: /^scan(ning)?\.analyze$/,
    targetAgent: "scanning-agent",
    targetCapability: "analyze-results",
    priority: 100,
    enabled: true,
  },
  {
    id: "scanning.rescan",
    name: "Monthly Rescan",
    pattern: /^scan(ning)?\.rescan$/,
    targetAgent: "scanning-agent",
    targetCapability: "monthly-rescan",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // SUPPORT AGENT ROUTES
  // =========================================================================
  {
    id: "support.analyze",
    name: "Analyze Support Ticket",
    pattern: /^support\.(analyze|classify)$/,
    targetAgent: "support-agent",
    targetCapability: "analyze-ticket",
    priority: 100,
    enabled: true,
  },
  {
    id: "support.respond",
    name: "Generate Response",
    pattern: /^support\.respond$/,
    targetAgent: "support-agent",
    targetCapability: "generate-response",
    priority: 100,
    enabled: true,
  },
  {
    id: "support.process",
    name: "Process Ticket",
    pattern: /^support\.(process|handle)$/,
    targetAgent: "support-agent",
    targetCapability: "process-ticket",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // INSIGHTS AGENT ROUTES
  // =========================================================================
  {
    id: "insights.risk",
    name: "Calculate Risk Score",
    pattern: /^insights\.risk$/,
    targetAgent: "insights-agent",
    targetCapability: "calculate-risk",
    priority: 100,
    enabled: true,
  },
  {
    id: "insights.report",
    name: "Generate Report",
    pattern: /^insights\.report$/,
    targetAgent: "insights-agent",
    targetCapability: "generate-report",
    priority: 100,
    enabled: true,
  },
  {
    id: "insights.predict",
    name: "Generate Predictions",
    pattern: /^insights\.predict$/,
    targetAgent: "insights-agent",
    targetCapability: "predict",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // COMMUNICATIONS AGENT ROUTES
  // =========================================================================
  {
    id: "communications.email",
    name: "Send Email",
    pattern: /^(communications|email)\.(send|deliver)$/,
    targetAgent: "communications-agent",
    targetCapability: "send-email",
    priority: 100,
    enabled: true,
  },
  {
    id: "communications.digest",
    name: "Send Digest",
    pattern: /^(communications|email)\.digest$/,
    targetAgent: "communications-agent",
    targetCapability: "send-digest",
    priority: 100,
    enabled: true,
  },
  {
    id: "communications.reminder",
    name: "Send Reminder",
    pattern: /^(communications|email)\.reminder$/,
    targetAgent: "communications-agent",
    targetCapability: "send-reminder",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // OPERATIONS AGENT ROUTES
  // =========================================================================
  {
    id: "operations.health",
    name: "Health Check",
    pattern: /^operations\.health(-check)?$/,
    targetAgent: "operations-agent",
    targetCapability: "health-check",
    priority: 100,
    enabled: true,
  },
  {
    id: "operations.cleanup",
    name: "System Cleanup",
    pattern: /^operations\.cleanup$/,
    targetAgent: "operations-agent",
    targetCapability: "cleanup",
    priority: 100,
    enabled: true,
  },
  {
    id: "operations.links",
    name: "Check Links",
    pattern: /^operations\.links$/,
    targetAgent: "operations-agent",
    targetCapability: "check-links",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // BILLING AGENT ROUTES
  // =========================================================================
  {
    id: "billing.sync",
    name: "Sync Subscriptions",
    pattern: /^billing\.sync$/,
    targetAgent: "billing-agent",
    targetCapability: "sync-subscriptions",
    priority: 100,
    enabled: true,
  },
  {
    id: "billing.churn",
    name: "Predict Churn",
    pattern: /^billing\.churn$/,
    targetAgent: "billing-agent",
    targetCapability: "predict-churn",
    priority: 100,
    enabled: true,
  },
  {
    id: "billing.upsell",
    name: "Detect Upsell",
    pattern: /^billing\.upsell$/,
    targetAgent: "billing-agent",
    targetCapability: "detect-upsell",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // QA AGENT ROUTES
  // =========================================================================
  {
    id: "qa.validate",
    name: "Validate Agent",
    pattern: /^qa\.validate$/,
    targetAgent: "qa-agent",
    targetCapability: "validate-agent",
    priority: 100,
    enabled: true,
  },
  {
    id: "qa.regression",
    name: "Run Regression Tests",
    pattern: /^qa\.regression$/,
    targetAgent: "qa-agent",
    targetCapability: "run-regression",
    priority: 100,
    enabled: true,
  },
  {
    id: "qa.report",
    name: "Generate QA Report",
    pattern: /^qa\.report$/,
    targetAgent: "qa-agent",
    targetCapability: "generate-report",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // COMPLIANCE AGENT ROUTES
  // =========================================================================
  {
    id: "compliance.gdpr",
    name: "GDPR Processing",
    pattern: /^compliance\.gdpr$/,
    targetAgent: "compliance-agent",
    targetCapability: "process-gdpr",
    priority: 100,
    enabled: true,
  },
  {
    id: "compliance.ccpa",
    name: "CCPA Processing",
    pattern: /^compliance\.ccpa$/,
    targetAgent: "compliance-agent",
    targetCapability: "process-ccpa",
    priority: 100,
    enabled: true,
  },
  {
    id: "compliance.retention",
    name: "Data Retention",
    pattern: /^compliance\.retention$/,
    targetAgent: "compliance-agent",
    targetCapability: "manage-retention",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // SECURITY AGENT ROUTES
  // =========================================================================
  {
    id: "security.threat",
    name: "Detect Threats",
    pattern: /^security\.threat$/,
    targetAgent: "security-agent",
    targetCapability: "detect-threats",
    priority: 100,
    enabled: true,
  },
  {
    id: "security.fraud",
    name: "Detect Fraud",
    pattern: /^security\.fraud$/,
    targetAgent: "security-agent",
    targetCapability: "detect-fraud",
    priority: 100,
    enabled: true,
  },
  {
    id: "security.breach",
    name: "Breach Notification",
    pattern: /^security\.breach$/,
    targetAgent: "security-agent",
    targetCapability: "notify-breach",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // INTELLIGENCE AGENT ROUTES
  // =========================================================================
  {
    id: "intel.broker",
    name: "Broker Intelligence",
    pattern: /^intel\.broker$/,
    targetAgent: "broker-intel-agent",
    targetCapability: "monitor-brokers",
    priority: 100,
    enabled: true,
  },
  {
    id: "intel.threat",
    name: "Threat Intelligence",
    pattern: /^intel\.threat$/,
    targetAgent: "threat-intel-agent",
    targetCapability: "monitor-threats",
    priority: 100,
    enabled: true,
  },
  {
    id: "intel.competitive",
    name: "Competitive Intelligence",
    pattern: /^intel\.competitive$/,
    targetAgent: "competitive-intel-agent",
    targetCapability: "monitor-competitors",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // CUSTOMER SUCCESS AGENT ROUTES
  // =========================================================================
  {
    id: "success.health",
    name: "User Health Score",
    pattern: /^success\.health$/,
    targetAgent: "success-agent",
    targetCapability: "calculate-health",
    priority: 100,
    enabled: true,
  },
  {
    id: "success.outreach",
    name: "Proactive Outreach",
    pattern: /^success\.outreach$/,
    targetAgent: "success-agent",
    targetCapability: "proactive-outreach",
    priority: 100,
    enabled: true,
  },
  {
    id: "feedback.analyze",
    name: "Analyze Feedback",
    pattern: /^feedback\.analyze$/,
    targetAgent: "feedback-agent",
    targetCapability: "analyze-feedback",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // GROWTH & REVENUE AGENT ROUTES
  // =========================================================================
  {
    id: "growth.referral",
    name: "Referral Optimization",
    pattern: /^growth\.referral$/,
    targetAgent: "growth-agent",
    targetCapability: "optimize-referrals",
    priority: 100,
    enabled: true,
  },
  {
    id: "pricing.discount",
    name: "Discount Optimization",
    pattern: /^pricing\.discount$/,
    targetAgent: "pricing-agent",
    targetCapability: "optimize-discount",
    priority: 100,
    enabled: true,
  },
  {
    id: "partner.affiliate",
    name: "Affiliate Management",
    pattern: /^partner\.affiliate$/,
    targetAgent: "partner-agent",
    targetCapability: "manage-affiliates",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // SPECIALIZED OPERATIONS AGENT ROUTES
  // =========================================================================
  {
    id: "escalation.broker",
    name: "Escalate Broker",
    pattern: /^escalation\.broker$/,
    targetAgent: "escalation-agent",
    targetCapability: "escalate-broker",
    priority: 100,
    enabled: true,
  },
  {
    id: "verification.monitor",
    name: "Monitor Reappearance",
    pattern: /^verification\.monitor$/,
    targetAgent: "verification-agent",
    targetCapability: "monitor-reappearance",
    priority: 100,
    enabled: true,
  },
  {
    id: "regulatory.track",
    name: "Track Regulations",
    pattern: /^regulatory\.track$/,
    targetAgent: "regulatory-agent",
    targetCapability: "track-laws",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // CONTENT AGENT ROUTES
  // =========================================================================
  {
    id: "content.blog",
    name: "Generate Blog Post",
    pattern: /^content\.blog$/,
    targetAgent: "content-agent",
    targetCapability: "generate-blog",
    priority: 100,
    enabled: true,
  },
  {
    id: "content.help",
    name: "Generate Help Article",
    pattern: /^content\.help$/,
    targetAgent: "content-agent",
    targetCapability: "generate-help-article",
    priority: 100,
    enabled: true,
  },

  // =========================================================================
  // ONBOARDING AGENT ROUTES
  // =========================================================================
  {
    id: "onboarding.personalize",
    name: "Personalize Onboarding",
    pattern: /^onboarding\.personalize$/,
    targetAgent: "onboarding-agent",
    targetCapability: "personalize-flow",
    priority: 100,
    enabled: true,
  },
  {
    id: "onboarding.guide",
    name: "First Scan Guide",
    pattern: /^onboarding\.guide$/,
    targetAgent: "onboarding-agent",
    targetCapability: "first-scan-guide",
    priority: 100,
    enabled: true,
  },
];

// ============================================================================
// ROUTER CLASS
// ============================================================================

export class Router {
  private rules: RoutingRule[];

  constructor(rules: RoutingRule[] = DEFAULT_ROUTING_RULES) {
    // Sort by priority (highest first)
    this.rules = [...rules].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Route a request to the appropriate agent
   */
  route(action: string, input: unknown, context: AgentContext): RoutingResult {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Check pattern match
      const matches = this.matchPattern(action, rule.pattern);
      if (!matches) continue;

      // Check conditions
      if (rule.conditions && !this.evaluateConditions(rule.conditions, context)) {
        continue;
      }

      // Extract capability from action if not specified
      const capability = rule.targetCapability || action.split(".").slice(1).join(".");

      // Transform input if needed
      const transformedInput = rule.inputTransform
        ? rule.inputTransform(input)
        : input;

      return {
        found: true,
        agentId: rule.targetAgent,
        capability,
        input: transformedInput,
        matchedRule: rule,
        fallbackAgentId: rule.fallbackAgent,
      };
    }

    // No matching rule found
    return { found: false };
  }

  /**
   * Check if a pattern matches an action
   */
  private matchPattern(action: string, pattern: string | RegExp): boolean {
    if (typeof pattern === "string") {
      // Simple string match or wildcard
      if (pattern === action) return true;
      if (pattern.endsWith("*")) {
        return action.startsWith(pattern.slice(0, -1));
      }
      return false;
    }

    // RegExp match
    return pattern.test(action);
  }

  /**
   * Evaluate routing conditions
   */
  private evaluateConditions(
    conditions: RoutingCondition[],
    context: AgentContext
  ): boolean {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: RoutingCondition,
    context: AgentContext
  ): boolean {
    // Custom condition
    if (condition.type === "custom" && condition.evaluate) {
      return condition.evaluate(context);
    }

    // Get the value to compare
    let contextValue: unknown;
    switch (condition.type) {
      case "priority":
        contextValue = context.priority;
        break;
      case "user_plan":
        contextValue = context.metadata?.userPlan;
        break;
      case "time_of_day": {
        const hour = new Date().getHours();
        contextValue = hour;
        break;
      }
      case "feature_flag": {
        const featureFlags = context.metadata?.featureFlags as Record<string, boolean> | undefined;
        contextValue = featureFlags?.[String(condition.value)];
        break;
      }
      default:
        return true;
    }

    // Evaluate operator
    switch (condition.operator) {
      case "equals":
        return contextValue === condition.value;
      case "not_equals":
        return contextValue !== condition.value;
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      case "greater_than":
        return Number(contextValue) > Number(condition.value);
      case "less_than":
        return Number(contextValue) < Number(condition.value);
      default:
        return true;
    }
  }

  /**
   * Add a new routing rule
   */
  addRule(rule: RoutingRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove a routing rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index >= 0) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Get all rules
   */
  getRules(): RoutingRule[] {
    return [...this.rules];
  }

  /**
   * Get rules for a specific agent
   */
  getRulesForAgent(agentId: string): RoutingRule[] {
    return this.rules.filter((r) => r.targetAgent === agentId);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Singleton router instance
let routerInstance: Router | null = null;

/**
 * Get the global router instance
 */
export function getRouter(): Router {
  if (!routerInstance) {
    routerInstance = new Router();
  }
  return routerInstance;
}

/**
 * Route a request to the appropriate agent
 */
export function routeRequest(
  action: string,
  input: unknown,
  context: AgentContext
): RoutingResult {
  return getRouter().route(action, input, context);
}

export default Router;
