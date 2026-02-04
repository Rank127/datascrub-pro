/**
 * Intelligence Coordinator
 *
 * Central coordinator for agent-to-agent communication, job coordination,
 * and smart scheduling to prevent race conditions and enable predictive automation.
 */

import { prisma } from "@/lib/db";
import { getRegistry, getAgent } from "../registry";
import { getEventBus, subscribe } from "../orchestrator/event-bus";
import type { AgentEvent } from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface JobLock {
  jobName: string;
  lockedAt: Date;
  expiresAt: Date;
  lockId: string;
}

interface JobDependency {
  job: string;
  dependsOn: string[];
  canRunParallel: string[]; // Jobs that can run in parallel with this
  blockedBy: string[]; // Jobs that block this one
}

interface AgentInsight {
  agentId: string;
  capability: string;
  insight: string;
  confidence: number;
  timestamp: Date;
  context?: Record<string, unknown>;
}

interface CoordinationResult {
  success: boolean;
  message: string;
  data?: unknown;
}

interface BrokerIntelligence {
  brokerKey: string;
  successRate: number;
  avgRemovalTime: number;
  lastSuccess: Date | null;
  lastFailure: Date | null;
  recommendedMethod: "EMAIL" | "FORM" | "BOTH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  notes: string[];
}

interface PredictiveInsight {
  type: "ANOMALY" | "PREDICTION" | "RECOMMENDATION";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  affectedEntity: string;
  confidence: number;
  suggestedAction?: string;
  detectedAt: Date;
}

// ============================================================================
// JOB DEPENDENCIES
// ============================================================================

const JOB_DEPENDENCIES: JobDependency[] = [
  {
    job: "process-removals",
    dependsOn: [],
    canRunParallel: ["verify-removals", "removal-digest"],
    blockedBy: ["clear-pending-queue"], // Wait for queue cleanup
  },
  {
    job: "clear-pending-queue",
    dependsOn: [],
    canRunParallel: [],
    blockedBy: [],
  },
  {
    job: "verify-removals",
    dependsOn: [],
    canRunParallel: ["process-removals", "removal-digest"],
    blockedBy: [],
  },
  {
    job: "email-monitor",
    dependsOn: [],
    canRunParallel: ["process-removals"],
    blockedBy: [],
  },
  {
    job: "seo-agent",
    dependsOn: [],
    canRunParallel: [],
    blockedBy: ["content-optimizer"], // Prevent race condition
  },
  {
    job: "content-optimizer",
    dependsOn: [],
    canRunParallel: [],
    blockedBy: ["seo-agent"], // Prevent race condition
  },
  {
    job: "dashboard-validation",
    dependsOn: [],
    canRunParallel: ["health-check"],
    blockedBy: [],
  },
  {
    job: "health-check",
    dependsOn: [],
    canRunParallel: ["dashboard-validation"],
    blockedBy: [],
  },
];

// ============================================================================
// INTELLIGENCE COORDINATOR CLASS
// ============================================================================

class IntelligenceCoordinator {
  private static instance: IntelligenceCoordinator;
  private activeLocks: Map<string, JobLock> = new Map();
  private insights: AgentInsight[] = [];
  private brokerIntelligence: Map<string, BrokerIntelligence> = new Map();
  private predictions: PredictiveInsight[] = [];
  private readonly LOCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_INSIGHTS = 500;

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): IntelligenceCoordinator {
    if (!IntelligenceCoordinator.instance) {
      IntelligenceCoordinator.instance = new IntelligenceCoordinator();
    }
    return IntelligenceCoordinator.instance;
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================

  private setupEventListeners(): void {
    // Listen for agent completions to gather insights
    subscribe("agent.completed", async (event: AgentEvent) => {
      const payload = event.payload as Record<string, unknown> | undefined;
      if (payload?.insights) {
        this.addInsight({
          agentId: event.sourceAgentId || "unknown",
          capability: payload.capability as string,
          insight: payload.insights as string,
          confidence: (payload.confidence as number) || 0.8,
          timestamp: new Date(),
          context: payload,
        });
      }
    });

    // Listen for failures to update broker intelligence
    subscribe("agent.failed", async (event: AgentEvent) => {
      const payload = event.payload as Record<string, unknown> | undefined;
      if (payload?.brokerKey) {
        await this.recordBrokerFailure(payload.brokerKey as string);
      }
    });
  }

  // ==========================================================================
  // JOB COORDINATION
  // ==========================================================================

  /**
   * Acquire a lock before running a job. Returns false if job is blocked.
   */
  async acquireJobLock(jobName: string): Promise<{ acquired: boolean; reason?: string }> {
    // Clean expired locks
    this.cleanExpiredLocks();

    // Check if this job is already running
    if (this.activeLocks.has(jobName)) {
      return { acquired: false, reason: `Job ${jobName} is already running` };
    }

    // Check dependencies
    const dependency = JOB_DEPENDENCIES.find((d) => d.job === jobName);
    if (dependency) {
      for (const blocker of dependency.blockedBy) {
        if (this.activeLocks.has(blocker)) {
          return { acquired: false, reason: `Blocked by running job: ${blocker}` };
        }
      }
    }

    // Acquire lock
    const lock: JobLock = {
      jobName,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + this.LOCK_TIMEOUT_MS),
      lockId: `${jobName}-${Date.now()}`,
    };
    this.activeLocks.set(jobName, lock);

    console.log(`[Coordinator] Acquired lock for ${jobName}`);
    return { acquired: true };
  }

  /**
   * Release a job lock after completion
   */
  releaseJobLock(jobName: string): void {
    this.activeLocks.delete(jobName);
    console.log(`[Coordinator] Released lock for ${jobName}`);
  }

  private cleanExpiredLocks(): void {
    const now = new Date();
    for (const [jobName, lock] of this.activeLocks) {
      if (lock.expiresAt < now) {
        this.activeLocks.delete(jobName);
        console.log(`[Coordinator] Expired lock for ${jobName}`);
      }
    }
  }

  /**
   * Check if a job can run now
   */
  canJobRun(jobName: string): { canRun: boolean; reason?: string } {
    this.cleanExpiredLocks();

    if (this.activeLocks.has(jobName)) {
      return { canRun: false, reason: "Job is already running" };
    }

    const dependency = JOB_DEPENDENCIES.find((d) => d.job === jobName);
    if (dependency) {
      for (const blocker of dependency.blockedBy) {
        if (this.activeLocks.has(blocker)) {
          return { canRun: false, reason: `Blocked by: ${blocker}` };
        }
      }
    }

    return { canRun: true };
  }

  // ==========================================================================
  // BROKER INTELLIGENCE
  // ==========================================================================

  /**
   * Get intelligence about a specific broker
   */
  async getBrokerIntelligence(brokerKey: string): Promise<BrokerIntelligence> {
    // Check cache first
    if (this.brokerIntelligence.has(brokerKey)) {
      const cached = this.brokerIntelligence.get(brokerKey)!;
      // Refresh if older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (cached.lastSuccess && cached.lastSuccess > oneHourAgo) {
        return cached;
      }
    }

    // Calculate from database
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalRemovals, successfulRemovals, failedRemovals, avgTimeResult] = await Promise.all([
      prisma.removalRequest.count({
        where: {
          exposure: { source: brokerKey },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.removalRequest.count({
        where: {
          exposure: { source: brokerKey },
          status: "COMPLETED",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.removalRequest.count({
        where: {
          exposure: { source: brokerKey },
          status: "FAILED",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.removalRequest.aggregate({
        where: {
          exposure: { source: brokerKey },
          status: "COMPLETED",
          completedAt: { not: null },
        },
        _avg: {
          attempts: true,
        },
      }),
    ]);

    const lastSuccess = await prisma.removalRequest.findFirst({
      where: {
        exposure: { source: brokerKey },
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    });

    const lastFailure = await prisma.removalRequest.findFirst({
      where: {
        exposure: { source: brokerKey },
        status: "FAILED",
      },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    const successRate = totalRemovals > 0 ? (successfulRemovals / totalRemovals) * 100 : 0;
    const riskLevel: "LOW" | "MEDIUM" | "HIGH" =
      successRate >= 80 ? "LOW" : successRate >= 50 ? "MEDIUM" : "HIGH";

    const notes: string[] = [];
    if (failedRemovals > 5) {
      notes.push(`High failure rate: ${failedRemovals} failures in last 30 days`);
    }
    if (successRate < 50) {
      notes.push("Consider manual removal methods for this broker");
    }

    const intelligence: BrokerIntelligence = {
      brokerKey,
      successRate,
      avgRemovalTime: avgTimeResult._avg.attempts || 0,
      lastSuccess: lastSuccess?.completedAt || null,
      lastFailure: lastFailure?.updatedAt || null,
      recommendedMethod: successRate >= 70 ? "EMAIL" : successRate >= 40 ? "BOTH" : "FORM",
      riskLevel,
      notes,
    };

    this.brokerIntelligence.set(brokerKey, intelligence);
    return intelligence;
  }

  /**
   * Record a broker failure for learning
   */
  private async recordBrokerFailure(brokerKey: string): Promise<void> {
    const intel = await this.getBrokerIntelligence(brokerKey);
    intel.lastFailure = new Date();
    intel.notes.push(`Failure recorded at ${new Date().toISOString()}`);
    this.brokerIntelligence.set(brokerKey, intel);
  }

  /**
   * Get smart prioritization for removal processing
   */
  async getSmartRemovalPriority(): Promise<
    Array<{
      brokerKey: string;
      priority: number;
      reason: string;
    }>
  > {
    const brokers = await prisma.exposure.groupBy({
      by: ["source"],
      where: {
        status: "ACTIVE",
        removalRequest: { status: "PENDING" },
      },
      _count: true,
    });

    const priorities = await Promise.all(
      brokers.map(async (broker) => {
        const intel = await this.getBrokerIntelligence(broker.source);
        let priority = 50; // Base priority
        let reasons: string[] = [];

        // Higher success rate = higher priority
        if (intel.successRate >= 80) {
          priority += 30;
          reasons.push("High success rate");
        } else if (intel.successRate >= 50) {
          priority += 15;
          reasons.push("Moderate success rate");
        }

        // Recent success = boost priority
        if (intel.lastSuccess) {
          const hoursSinceSuccess =
            (Date.now() - intel.lastSuccess.getTime()) / (1000 * 60 * 60);
          if (hoursSinceSuccess < 24) {
            priority += 10;
            reasons.push("Recent success");
          }
        }

        // Recent failure = reduce priority temporarily
        if (intel.lastFailure) {
          const hoursSinceFailure =
            (Date.now() - intel.lastFailure.getTime()) / (1000 * 60 * 60);
          if (hoursSinceFailure < 4) {
            priority -= 20;
            reasons.push("Recent failure - cooling off");
          }
        }

        // Low risk = higher priority
        if (intel.riskLevel === "LOW") {
          priority += 10;
        } else if (intel.riskLevel === "HIGH") {
          priority -= 10;
        }

        return {
          brokerKey: broker.source,
          priority: Math.max(0, Math.min(100, priority)),
          reason: reasons.join("; ") || "Standard priority",
        };
      })
    );

    return priorities.sort((a, b) => b.priority - a.priority);
  }

  // ==========================================================================
  // AGENT INSIGHTS
  // ==========================================================================

  /**
   * Add an insight from an agent
   */
  addInsight(insight: AgentInsight): void {
    this.insights.push(insight);
    if (this.insights.length > this.MAX_INSIGHTS) {
      this.insights = this.insights.slice(-this.MAX_INSIGHTS);
    }
  }

  /**
   * Get recent insights
   */
  getRecentInsights(
    agentId?: string,
    capability?: string,
    limit: number = 20
  ): AgentInsight[] {
    let filtered = this.insights;

    if (agentId) {
      filtered = filtered.filter((i) => i.agentId === agentId);
    }
    if (capability) {
      filtered = filtered.filter((i) => i.capability === capability);
    }

    return filtered.slice(-limit);
  }

  /**
   * Request action from another agent
   */
  async requestAgentAction(
    fromAgent: string,
    toAgent: string,
    capability: string,
    input: unknown
  ): Promise<CoordinationResult> {
    const targetAgent = getAgent(toAgent);

    if (!targetAgent) {
      return { success: false, message: `Agent ${toAgent} not found` };
    }

    try {
      const result = await targetAgent.execute(capability, input, {
        requestId: `coord-${Date.now()}`,
        userId: "system",
        invocationType: "MANUAL",
        correlationId: `${fromAgent}->${toAgent}`,
        createdAt: new Date(),
      });

      return {
        success: result.success,
        message: result.success ? "Action completed" : result.error?.message || "Action failed",
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ==========================================================================
  // PREDICTIVE INTELLIGENCE
  // ==========================================================================

  /**
   * Analyze patterns and generate predictions
   */
  async analyzePatternsAndPredict(): Promise<PredictiveInsight[]> {
    const predictions: PredictiveInsight[] = [];
    const now = new Date();

    // 1. Detect anomalies in removal success rate
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentRemovals = await prisma.removalRequest.groupBy({
      by: ["status"],
      where: { updatedAt: { gte: oneDayAgo } },
      _count: true,
    });

    const total = recentRemovals.reduce((sum, r) => sum + r._count, 0);
    const failed = recentRemovals.find((r) => r.status === "FAILED")?._count || 0;

    if (total > 10 && failed / total > 0.3) {
      predictions.push({
        type: "ANOMALY",
        severity: "WARNING",
        message: `High failure rate detected: ${((failed / total) * 100).toFixed(1)}% of removals failed in last 24h`,
        affectedEntity: "removal-system",
        confidence: 0.85,
        suggestedAction: "Review failed removals and consider pausing automated processing",
        detectedAt: now,
      });
    }

    // 2. Predict queue backlog
    const pendingCount = await prisma.removalRequest.count({
      where: { status: "PENDING" },
    });
    const avgProcessedPerDay = await this.getAverageProcessedPerDay();

    if (pendingCount > avgProcessedPerDay * 3) {
      const daysToProcess = pendingCount / avgProcessedPerDay;
      predictions.push({
        type: "PREDICTION",
        severity: daysToProcess > 7 ? "CRITICAL" : "WARNING",
        message: `Queue backlog detected: ${pendingCount} pending removals, estimated ${daysToProcess.toFixed(1)} days to clear`,
        affectedEntity: "removal-queue",
        confidence: 0.75,
        suggestedAction:
          daysToProcess > 7
            ? "Increase processing frequency or batch size"
            : "Monitor queue progress",
        detectedAt: now,
      });
    }

    // 3. Detect broker-specific issues
    const brokerStats = await prisma.removalRequest.groupBy({
      by: ["exposureId"],
      where: {
        status: "FAILED",
        updatedAt: { gte: oneDayAgo },
      },
      _count: { _all: true },
    });

    for (const stat of brokerStats.slice(0, 5)) {
      if (stat._count._all >= 5) {
        predictions.push({
          type: "ANOMALY",
          severity: "WARNING",
          message: `Exposure experiencing high failure rate: ${stat._count._all} failures in 24h`,
          affectedEntity: stat.exposureId,
          confidence: 0.7,
          suggestedAction: "Consider pausing removals for this broker or switching to manual method",
          detectedAt: now,
        });
      }
    }

    // 4. Detect stale data
    const oldestPending = await prisma.removalRequest.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    if (oldestPending) {
      const daysOld = (now.getTime() - oldestPending.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld > 7) {
        predictions.push({
          type: "ANOMALY",
          severity: "WARNING",
          message: `Stale pending removals: oldest request is ${daysOld.toFixed(0)} days old`,
          affectedEntity: "removal-queue",
          confidence: 0.9,
          suggestedAction: "Investigate why old requests are not being processed",
          detectedAt: now,
        });
      }
    }

    this.predictions = predictions;
    return predictions;
  }

  private async getAverageProcessedPerDay(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const completed = await prisma.removalRequest.count({
      where: {
        status: { in: ["COMPLETED", "FAILED"] },
        updatedAt: { gte: sevenDaysAgo },
      },
    });
    return completed / 7;
  }

  /**
   * Get current predictions
   */
  getPredictions(): PredictiveInsight[] {
    return this.predictions;
  }

  // ==========================================================================
  // STATUS & METRICS
  // ==========================================================================

  /**
   * Get coordinator status
   */
  getStatus(): {
    activeLocks: string[];
    insightCount: number;
    brokerIntelCount: number;
    predictionCount: number;
  } {
    return {
      activeLocks: Array.from(this.activeLocks.keys()),
      insightCount: this.insights.length,
      brokerIntelCount: this.brokerIntelligence.size,
      predictionCount: this.predictions.length,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const coordinator = IntelligenceCoordinator.getInstance();

export async function getSmartRemovalPriority() {
  return coordinator.getSmartRemovalPriority();
}

export async function getBrokerIntelligence(brokerKey: string) {
  return coordinator.getBrokerIntelligence(brokerKey);
}

export async function acquireJobLock(jobName: string) {
  return coordinator.acquireJobLock(jobName);
}

export function releaseJobLock(jobName: string) {
  return coordinator.releaseJobLock(jobName);
}

export function canJobRun(jobName: string) {
  return coordinator.canJobRun(jobName);
}

export async function analyzePatternsAndPredict() {
  return coordinator.analyzePatternsAndPredict();
}

export async function requestAgentAction(
  fromAgent: string,
  toAgent: string,
  capability: string,
  input: unknown
) {
  return coordinator.requestAgentAction(fromAgent, toAgent, capability, input);
}

export function getCoordinatorStatus() {
  return coordinator.getStatus();
}

export { IntelligenceCoordinator };
