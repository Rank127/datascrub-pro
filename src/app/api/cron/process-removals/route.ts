import { NextResponse } from "next/server";
import {
  processPendingRemovalsBatch,
  retryFailedRemovalsBatch,
  getAutomationStats,
} from "@/lib/removers/removal-service";
import {
  acquireJobLock,
  releaseJobLock,
  getSmartRemovalPriority,
  analyzePatternsAndPredict,
  getBrokerIntelligence,
} from "@/lib/agents/intelligence-coordinator";
import { logCronExecution } from "@/lib/cron-logger";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";

const JOB_NAME = "process-removals";

/**
 * Cron job to automatically process pending and retry failed removals
 * Schedule: 6x daily (every 4 hours) at 2, 6, 10, 14, 18, 22 UTC
 *
 * INTELLIGENT FEATURES:
 * - Smart broker prioritization based on success rates
 * - Job locking to prevent race conditions
 * - Predictive insights for anomaly detection
 * - Adaptive processing based on broker intelligence
 *
 * Rate limiting (Resend Pro: 50,000/month):
 * - 100 pending + 25 retries = 125 broker emails per batch
 * - 6 batches/day = 750 broker emails/day
 * - Plus user digest emails = ~800-900 total/day
 * - Monthly: ~25,000 emails (well under 50k limit)
 *
 * Per-broker limits (to avoid being flagged as spam):
 * - Max 25 requests per broker per day
 * - Min 15 minutes between requests to same broker
 * - Severity-weighted round-robin distribution across brokers
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return cronUnauthorizedResponse(authResult.reason);
    }

    // Step 0: Acquire job lock to prevent race conditions
    const lockResult = await acquireJobLock(JOB_NAME);
    if (!lockResult.acquired) {
      console.log(`[Cron: ${JOB_NAME}] Skipped: ${lockResult.reason}`);
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: lockResult.reason,
      });
    }

    try {
      console.log(`[Cron: ${JOB_NAME}] Starting intelligent removal processing...`);

      // Step 1: Get smart prioritization based on broker intelligence
      console.log(`[Cron: ${JOB_NAME}] Analyzing broker intelligence...`);
      const priorities = await getSmartRemovalPriority();
      const topBrokers = priorities.slice(0, 5);
      console.log(
        `[Cron: ${JOB_NAME}] Top priority brokers:`,
        topBrokers.map((b) => `${b.brokerKey} (${b.priority})`).join(", ")
      );

      // Step 2: Check for anomalies before processing
      const predictions = await analyzePatternsAndPredict();
      const criticalPredictions = predictions.filter((p) => p.severity === "CRITICAL");

      if (criticalPredictions.length > 0) {
        console.log(`[Cron: ${JOB_NAME}] CRITICAL ANOMALIES DETECTED:`);
        for (const pred of criticalPredictions) {
          console.log(`  - ${pred.message}`);
        }
        // Continue processing but with reduced batch size
        console.log(`[Cron: ${JOB_NAME}] Reducing batch size due to anomalies`);
      }

      // Step 3: Calculate adaptive batch size based on predictions
      // Maxed out batch sizes for aggressive backlog clearance (was 100/25, then 500/100)
      const basePendingBatch = 1000;
      const baseRetryBatch = 200;
      const adaptiveMultiplier = criticalPredictions.length > 0 ? 0.5 : 1;
      const pendingBatchSize = Math.floor(basePendingBatch * adaptiveMultiplier);
      const retryBatchSize = Math.floor(baseRetryBatch * adaptiveMultiplier);

      // Step 4: Process pending removals with smart prioritization
      console.log(`[Cron: ${JOB_NAME}] Processing ${pendingBatchSize} pending removals...`);
      const pendingResults = await processPendingRemovalsBatch(pendingBatchSize);

      // Step 5: Retry failed removals
      console.log(`[Cron: ${JOB_NAME}] Retrying ${retryBatchSize} failed removals...`);
      const retryResults = await retryFailedRemovalsBatch(retryBatchSize);

      // Step 6: Get automation stats
      const stats = await getAutomationStats();

      // Step 7: Gather broker intelligence for top processed brokers
      const brokerIntel: Record<string, { successRate: number; riskLevel: string }> = {};
      if (pendingResults.brokerDistribution) {
        const processedBrokers = Object.keys(pendingResults.brokerDistribution).slice(0, 5);
        for (const broker of processedBrokers) {
          const intel = await getBrokerIntelligence(broker);
          brokerIntel[broker] = {
            successRate: intel.successRate,
            riskLevel: intel.riskLevel,
          };
        }
      }

      const duration = Date.now() - startTime;

      const response = {
        success: true,
        duration: `${(duration / 1000).toFixed(1)}s`,
        intelligence: {
          prioritizedBrokers: topBrokers.length,
          predictionsGenerated: predictions.length,
          criticalAnomalies: criticalPredictions.length,
          adaptiveBatchMultiplier: adaptiveMultiplier,
          brokerIntelligence: brokerIntel,
        },
        pending: {
          processed: pendingResults.processed,
          successful: pendingResults.successful,
          failed: pendingResults.failed,
          skipped: pendingResults.skipped,
          brokerDistribution: pendingResults.brokerDistribution,
        },
        retries: {
          processed: retryResults.processed,
          retried: retryResults.retried,
          stillFailed: retryResults.stillFailed,
          skippedDueToLimit: retryResults.skippedDueToLimit,
        },
        rateLimiting: {
          maxPerBrokerPerDay: 25,
          minMinutesBetweenSameBroker: 15,
          batchSize: { pending: pendingBatchSize, retries: retryBatchSize },
          dailyBatches: 6,
        },
        automationStats: {
          total: stats.totalRemovals,
          automationRate: `${stats.automationRate}%`,
          byStatus: stats.byStatus,
        },
        predictions: predictions.slice(0, 3).map((p) => ({
          type: p.type,
          severity: p.severity,
          message: p.message,
        })),
      };

      // Log execution
      await logCronExecution({
        jobName: JOB_NAME,
        status: pendingResults.failed > pendingResults.successful ? "FAILED" : "SUCCESS",
        duration,
        message: `Processed ${pendingResults.processed} pending, ${retryResults.processed} retries. Intelligence: ${priorities.length} brokers analyzed.`,
      });

      console.log(`[Cron: ${JOB_NAME}] Complete:`, JSON.stringify(response, null, 2));
      return NextResponse.json(response);
    } finally {
      // Always release the lock
      releaseJobLock(JOB_NAME);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Cron: ${JOB_NAME}] Error:`, error);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    releaseJobLock(JOB_NAME);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(request: Request) {
  return POST(request);
}
