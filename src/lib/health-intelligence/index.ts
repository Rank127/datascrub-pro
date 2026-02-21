export { analyzeHealthTrends, computeTrendDirection } from "./trend-analyzer";
export type { TrendAnalysis, TrendResult, TrendDirection, MetricCategory, DataPoint } from "./trend-analyzer";

export { proposeAdaptationsFromTrends, applyAdaptations, evaluatePastAdaptations } from "./threshold-adapter";
export type { AdaptationProposal, AdaptationResult, EvaluationResult } from "./threshold-adapter";

export { generateRuntimeQualityInsights } from "./quality-monitor";
export type { QualityInsight, InsightSeverity } from "./quality-monitor";
