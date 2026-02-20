/**
 * Broker Learning — learns from removal outcomes to improve broker strategy
 *
 * Updates BrokerIntelligence with learned preferences:
 * - Which brokers reject email (prefer form)
 * - Which brokers respond faster to email vs form
 * - Average response times per broker
 *
 * All operations are non-invasive — failures never break removal pipeline.
 */

import { prisma } from "@/lib/db";
import { captureError } from "@/lib/error-reporting";
import { recordOutcome, hashInput } from "./outcome-recorder";

// ============================================================================
// TYPES
// ============================================================================

interface RemovalOutcomeInput {
  success: boolean;
  method: string;
  message: string;
  isNonRemovable?: boolean;
}

interface BrokerResponseSignal {
  brokerKey: string;
  brokerName?: string;
  rejectsEmail?: boolean;
  requiresForm?: boolean;
  formUrl?: string;
  responseCategory?: string; // CONFIRMED_REMOVAL, NO_RECORD, REQUIRES_MANUAL, UNKNOWN
}

// ============================================================================
// REMOVAL OUTCOME RECORDING
// ============================================================================

/**
 * Record a removal execution outcome. Called after executeRemoval().
 * Fire-and-forget — never throws.
 */
export async function recordRemovalOutcome(
  requestId: string,
  brokerKey: string,
  result: RemovalOutcomeInput
): Promise<void> {
  try {
    // 1. Write to AgentOutcome
    await recordOutcome({
      agentId: "removal-agent",
      capability: "execute-removal",
      outcomeType: result.success ? "SUCCESS" : "FAILURE",
      inputHash: hashInput({ brokerKey, method: result.method }),
      context: { brokerKey, method: result.method, requestId },
      outcome: {
        success: result.success,
        message: result.message,
        isNonRemovable: result.isNonRemovable,
      },
    });

    // 2. Update BrokerIntelligence learning fields
    await updateBrokerLearning(brokerKey, result);
  } catch (error) {
    captureError("[BrokerLearning] Failed to record removal outcome", error);
  }
}

/**
 * Update BrokerIntelligence with learned data from a removal result.
 */
async function updateBrokerLearning(
  brokerKey: string,
  result: RemovalOutcomeInput
): Promise<void> {
  try {
    const existing = await prisma.brokerIntelligence.findUnique({
      where: { source: brokerKey },
      select: {
        preferredMethod: true,
        methodConfidence: true,
        removalsSent: true,
        removalsCompleted: true,
      },
    });

    if (!existing) return; // Only update existing records

    // If email succeeded, increase email confidence
    if (result.success && (result.method === "AUTO_EMAIL" || result.method === "EMAIL")) {
      const newConfidence = Math.min(
        1.0,
        (existing.methodConfidence || 0.5) + 0.05
      );
      await prisma.brokerIntelligence.update({
        where: { source: brokerKey },
        data: {
          preferredMethod: existing.preferredMethod || "EMAIL",
          methodConfidence: newConfidence,
          lastMethodUpdate: new Date(),
        },
      });
    }

    // If email failed and it wasn't a general error, may indicate email rejection
    if (!result.success && (result.method === "AUTO_EMAIL" || result.method === "EMAIL")) {
      const isRejection =
        result.message.toLowerCase().includes("reject") ||
        result.message.toLowerCase().includes("form") ||
        result.message.toLowerCase().includes("portal");

      if (isRejection) {
        const newConfidence = Math.min(
          1.0,
          (existing.methodConfidence || 0.5) + 0.15
        );
        await prisma.brokerIntelligence.update({
          where: { source: brokerKey },
          data: {
            rejectsEmail: true,
            preferredMethod: "FORM",
            methodConfidence: newConfidence,
            lastMethodUpdate: new Date(),
          },
        });
      }
    }
  } catch (error) {
    captureError("[BrokerLearning] Failed to update broker learning", error);
  }
}

// ============================================================================
// BROKER RESPONSE LEARNING (from inbound return emails)
// ============================================================================

/**
 * Process a broker response signal and update learning.
 * Called from operations-agent when parsing return emails.
 */
export async function processBrokerResponseSignal(
  signal: BrokerResponseSignal
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      lastMethodUpdate: new Date(),
    };

    if (signal.rejectsEmail) {
      updateData.rejectsEmail = true;
      updateData.preferredMethod = "FORM";
      updateData.methodConfidence = 0.95;
    }

    if (signal.requiresForm) {
      updateData.requiresForm = true;
      updateData.preferredMethod = "FORM";
      updateData.methodConfidence = 0.9;
    }

    if (signal.formUrl) {
      updateData.formUrl = signal.formUrl;
    }

    await prisma.brokerIntelligence.upsert({
      where: { source: signal.brokerKey },
      update: updateData,
      create: {
        source: signal.brokerKey,
        sourceName: signal.brokerName || signal.brokerKey,
        rejectsEmail: signal.rejectsEmail || false,
        requiresForm: signal.requiresForm || false,
        formUrl: signal.formUrl,
        preferredMethod: signal.rejectsEmail || signal.requiresForm ? "FORM" : null,
        methodConfidence: signal.rejectsEmail ? 0.95 : signal.requiresForm ? 0.9 : null,
        lastMethodUpdate: new Date(),
      },
    });

    // Also record as an AgentOutcome for the learning cron
    await recordOutcome({
      agentId: "operations-agent",
      capability: "process-return-emails",
      outcomeType: signal.responseCategory === "CONFIRMED_REMOVAL" ? "SUCCESS" :
                   signal.responseCategory === "REQUIRES_MANUAL" ? "PARTIAL" : "REJECTED",
      context: {
        brokerKey: signal.brokerKey,
        rejectsEmail: signal.rejectsEmail,
        requiresForm: signal.requiresForm,
        responseCategory: signal.responseCategory,
      },
      outcome: {
        formUrl: signal.formUrl,
        signal: "broker_response",
      },
    });
  } catch (error) {
    captureError("[BrokerLearning] Failed to process broker response signal", error);
  }
}

// ============================================================================
// BROKER INTELLIGENCE QUERIES
// ============================================================================

/**
 * Get learned broker intelligence for strategy selection.
 * Returns null if no learning data exists or confidence is too low.
 */
export async function getBrokerLearning(
  brokerKey: string,
  minConfidence = 0.8
): Promise<{
  preferredMethod: string;
  rejectsEmail: boolean;
  formUrl: string | null;
  methodConfidence: number;
  avgResponseDays: number | null;
} | null> {
  try {
    const intel = await prisma.brokerIntelligence.findUnique({
      where: { source: brokerKey },
      select: {
        preferredMethod: true,
        rejectsEmail: true,
        formUrl: true,
        methodConfidence: true,
        avgResponseDays: true,
      },
    });

    if (!intel?.preferredMethod || !intel.methodConfidence) return null;
    if (intel.methodConfidence < minConfidence) return null;

    return {
      preferredMethod: intel.preferredMethod,
      rejectsEmail: intel.rejectsEmail,
      formUrl: intel.formUrl,
      methodConfidence: intel.methodConfidence,
      avgResponseDays: intel.avgResponseDays,
    };
  } catch {
    return null;
  }
}
