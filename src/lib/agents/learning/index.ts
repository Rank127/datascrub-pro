/**
 * Agent Learning System — barrel exports
 *
 * Self-learning infrastructure for all agents:
 * - Outcome recording (what happened after agent decisions)
 * - Lesson extraction (AI-powered pattern recognition)
 * - Learning context injection (feed lessons back into prompts)
 * - Broker-specific learning (removal method preferences)
 */

export {
  recordOutcome,
  getLessonsForAgent,
  getOutcomeStats,
  hashInput,
} from "./outcome-recorder";

export type { RecordOutcomeInput } from "./outcome-recorder";

export {
  recordRemovalOutcome,
  processBrokerResponseSignal,
  getBrokerLearning,
} from "./broker-learning";
