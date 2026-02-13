/**
 * Decision Frameworks — Pure Computational Functions
 *
 * Each function encodes a mastermind advisor's core decision-making principle.
 * These are pure functions with no side effects or DB calls.
 * Used in agent rule-based handlers and cron decision logic.
 */

// ============================================================================
// HORMOZI VALUE EQUATION (billing-agent, growth-agent)
// Dream Outcome x Perceived Likelihood / (Time Delay x Effort & Sacrifice)
// ============================================================================

export interface HormoziValueParams {
  /** 1-10: How much does the user want this outcome? */
  dreamOutcome: number;
  /** 0-1: How likely does it feel to achieve? */
  likelihood: number;
  /** 1-10: How long until they see results? (higher = worse) */
  timeDelay: number;
  /** 1-10: How much work/sacrifice required? (higher = worse) */
  effort: number;
}

/**
 * Hormozi Value Equation — higher score = more compelling offer.
 * Used by billing-agent (churn risk: low score = high risk) and
 * growth-agent (upsell potential: high score = strong candidate).
 */
export function hormoziValueScore(params: HormoziValueParams): number {
  const { dreamOutcome, likelihood, timeDelay, effort } = params;

  // Clamp inputs to valid ranges
  const d = Math.max(1, Math.min(10, dreamOutcome));
  const l = Math.max(0.01, Math.min(1, likelihood));
  const t = Math.max(1, Math.min(10, timeDelay));
  const e = Math.max(1, Math.min(10, effort));

  // Value = (Dream × Likelihood) / (Time × Effort)
  // Normalize to 0-100 scale
  const raw = (d * l) / (t * e);
  // Max possible: (10 × 1) / (1 × 1) = 10
  // Min possible: (1 × 0.01) / (10 × 10) = 0.0001
  return Math.min(100, Math.round(raw * 10));
}

// ============================================================================
// CARLSEN POSITIONAL ANALYSIS (competitive-intel-agent, seo-agent)
// Long-term strategic positioning over short-term tactics
// ============================================================================

export interface CarlsenPositionalParams {
  /** 0-10: Immediate benefit of this option */
  shortTermGain: number;
  /** 0-10: Strategic advantage this creates over time */
  longTermPosition: number;
  /** 0-10: How many counter-moves does this leave for competitors? (higher = worse) */
  opponentOptions: number;
  /** 0-10: Does this keep our future options open? */
  flexibility: number;
}

/**
 * Carlsen Positional Score — evaluates strategic options by long-term advantage.
 * Weights long-term position and flexibility over short-term gains.
 * Used by competitive-intel-agent and seo-agent keyword ranking.
 */
export function carlsenPositionalScore(params: CarlsenPositionalParams): number {
  const { shortTermGain, longTermPosition, opponentOptions, flexibility } = params;

  // Clamp inputs
  const stg = Math.max(0, Math.min(10, shortTermGain));
  const ltp = Math.max(0, Math.min(10, longTermPosition));
  const oo = Math.max(0, Math.min(10, opponentOptions));
  const flex = Math.max(0, Math.min(10, flexibility));

  // Weighted formula: heavy on long-term, penalize opponent freedom
  // Long-term position (40%) + Flexibility (25%) + Short-term gain (20%) - Opponent options (15%)
  const score = (ltp * 0.4) + (flex * 0.25) + (stg * 0.2) - (oo * 0.15);

  // Normalize to 0-100
  // Max: 10*0.4 + 10*0.25 + 10*0.2 - 0*0.15 = 8.5 → 100
  // Min: 0*0.4 + 0*0.25 + 0*0.2 - 10*0.15 = -1.5 → 0
  return Math.max(0, Math.min(100, Math.round(((score + 1.5) / 10) * 100)));
}

// ============================================================================
// VOSS TACTICAL EMPATHY (support-agent)
// Quality scoring for support responses
// ============================================================================

export interface VossEmpathyParams {
  /** Does the response acknowledge/label the customer's emotion? */
  acknowledgesEmotion: boolean;
  /** Does it mirror the customer's own language? */
  mirrorsLanguage: boolean;
  /** Does it use calibrated questions ("How" or "What")? */
  calibratedQuestion: boolean;
  /** Does it avoid direct "no" — uses softened alternatives? */
  noDirectNo: boolean;
}

/**
 * Voss Tactical Empathy Score — rates support response quality.
 * Each dimension adds 25 points. Score of 75+ is recommended for auto-send.
 * Used by support-agent to validate response quality before sending.
 */
export function vossEmpathyScore(params: VossEmpathyParams): number {
  let score = 0;
  if (params.acknowledgesEmotion) score += 25;
  if (params.mirrorsLanguage) score += 25;
  if (params.calibratedQuestion) score += 25;
  if (params.noDirectNo) score += 25;
  return score;
}

// ============================================================================
// DALIO RADICAL TRANSPARENCY (process-removals, daily standup)
// Pain + Reflection = Progress
// ============================================================================

export interface DalioRiskParams {
  /** 0-1: Current failure rate */
  failureRate: number;
  /** Direction of the trend */
  trend: "improving" | "stable" | "declining";
  /** 0-10: How much is at stake? */
  exposureLevel: number;
  /** Have we already investigated/addressed this? */
  hasBeenAddressed: boolean;
}

export interface DalioRiskResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: string;
}

/**
 * Dalio Risk Assessment — classifies risk level and recommends action.
 * "Pain + Reflection = Progress" — unaddressed issues with high stakes are critical.
 * Used by process-removals anomaly response and daily standup health classification.
 */
export function dalioRiskAssessment(params: DalioRiskParams): DalioRiskResult {
  const { failureRate, trend, exposureLevel, hasBeenAddressed } = params;

  const fr = Math.max(0, Math.min(1, failureRate));
  const el = Math.max(0, Math.min(10, exposureLevel));

  // Base risk score: failure rate × exposure
  let riskScore = fr * el;

  // Trend modifier
  if (trend === "declining") riskScore *= 1.5;
  if (trend === "improving") riskScore *= 0.6;

  // Unaddressed pain escalates
  if (!hasBeenAddressed && riskScore > 2) riskScore *= 1.4;

  // Classify
  if (riskScore >= 7) {
    return {
      riskLevel: "CRITICAL",
      action: hasBeenAddressed
        ? "Current mitigation insufficient. Escalate to Nucleus for strategic review."
        : "Unaddressed critical risk. Stop and investigate root cause immediately.",
    };
  }
  if (riskScore >= 4) {
    return {
      riskLevel: "HIGH",
      action: hasBeenAddressed
        ? "Continue monitoring. Review mitigation effectiveness within 24h."
        : "Investigate root cause. Reduce batch sizes and increase monitoring.",
    };
  }
  if (riskScore >= 2) {
    return {
      riskLevel: "MEDIUM",
      action: "Monitor trend. Document observations for weekly board review.",
    };
  }
  return {
    riskLevel: "LOW",
    action: "No action needed. System operating within normal parameters.",
  };
}

// ============================================================================
// MRBEAST REMARKABILITY SCORE (content-agent, content-optimizer)
// "What's the biggest possible version of this?"
// ============================================================================

export interface MrBeastRemarkabilityParams {
  /** Does the content have a strong opening hook? */
  hasHook: boolean;
  /** Are there real stakes (something to gain or lose)? */
  hasStakes: boolean;
  /** Is there an unexpected or surprising element? */
  hasSurprise: boolean;
  /** Would someone text this to a friend? */
  isShareWorthy: boolean;
  /** 1-10: How ambitious is the concept? */
  scaleMultiplier: number;
}

/**
 * MrBeast Remarkability Score — rates content's viral potential.
 * Each boolean adds 15 points, scale multiplier adds up to 40.
 * Score of 70+ suggests content is worth publishing.
 * Used by content-agent blog scoring and content-optimizer priority ranking.
 */
export function mrbeastRemarkabilityScore(params: MrBeastRemarkabilityParams): number {
  let score = 0;
  if (params.hasHook) score += 15;
  if (params.hasStakes) score += 15;
  if (params.hasSurprise) score += 15;
  if (params.isShareWorthy) score += 15;

  // Scale multiplier: 1-10 mapped to 0-40
  const scale = Math.max(1, Math.min(10, params.scaleMultiplier));
  score += Math.round((scale / 10) * 40);

  return Math.min(100, score);
}

// ============================================================================
// BUFFETT CIRCLE OF COMPETENCE (billing-agent, growth-agent)
// "Risk comes from not knowing what you're doing" + front-page test
// ============================================================================

export interface BuffettCompetenceParams {
  /** Do we deeply understand this domain? */
  isWithinExpertise: boolean;
  /** What's the downside if we're wrong? Is there a margin of safety? */
  hasMarginOfSafety: boolean;
  /** Would we be proud if this decision was on the front page? */
  frontPageTest: boolean;
  /** Can we explain this in one sentence? */
  isSimpleToExplain: boolean;
}

export interface BuffettCompetenceResult {
  proceed: boolean;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  warning?: string;
}

/**
 * Buffett Circle of Competence Check — should we proceed with this decision?
 * All four factors true = HIGH confidence proceed.
 * Missing expertise or front-page test = do not proceed.
 * Used by billing-agent pricing decisions and growth-agent feature recommendations.
 */
export function buffettCompetenceCheck(params: BuffettCompetenceParams): BuffettCompetenceResult {
  const { isWithinExpertise, hasMarginOfSafety, frontPageTest, isSimpleToExplain } = params;

  // Hard stops
  if (!isWithinExpertise) {
    return {
      proceed: false,
      confidence: "LOW",
      warning: "Outside circle of competence. Do not proceed without expert review.",
    };
  }

  if (!frontPageTest) {
    return {
      proceed: false,
      confidence: "LOW",
      warning: "Fails front-page test. This decision could cause reputational harm.",
    };
  }

  // Soft warnings
  if (!hasMarginOfSafety && !isSimpleToExplain) {
    return {
      proceed: false,
      confidence: "LOW",
      warning: "No margin of safety and too complex. Simplify before proceeding.",
    };
  }

  if (!hasMarginOfSafety) {
    return {
      proceed: true,
      confidence: "MEDIUM",
      warning: "No margin of safety. Proceed with caution and set clear stop-loss.",
    };
  }

  if (!isSimpleToExplain) {
    return {
      proceed: true,
      confidence: "MEDIUM",
      warning: "Decision is complex. Consider simplifying before committing.",
    };
  }

  // All clear
  return { proceed: true, confidence: "HIGH" };
}
