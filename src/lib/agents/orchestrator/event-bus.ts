/**
 * DataScrub Pro Agent Architecture - Event Bus
 *
 * Inter-agent communication and event handling.
 * Provides pub/sub pattern for loose coupling between agents.
 */

import { nanoid } from "nanoid";
import { AgentEvent, AgentEventHandler, AgentEventType } from "../types";

// ============================================================================
// TYPES
// ============================================================================

export interface Subscription {
  id: string;
  eventType: AgentEventType | "*";
  handler: AgentEventHandler;
  agentId?: string; // Optional filter by source agent
  once?: boolean;
}

export interface EventBusStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  subscriberCount: number;
  averageProcessingTime: number;
}

// ============================================================================
// EVENT BUS CLASS
// ============================================================================

class EventBus {
  private static instance: EventBus;
  private subscriptions: Map<string, Subscription> = new Map();
  private eventHistory: AgentEvent[] = [];
  private processingTimes: number[] = [];
  private maxHistorySize = 1000;
  private isProcessing = false;
  private eventQueue: AgentEvent[] = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // ============================================================================
  // SUBSCRIPTION
  // ============================================================================

  /**
   * Subscribe to events
   */
  subscribe(
    eventType: AgentEventType | "*",
    handler: AgentEventHandler,
    options?: { agentId?: string; once?: boolean }
  ): string {
    const id = nanoid();
    const subscription: Subscription = {
      id,
      eventType,
      handler,
      agentId: options?.agentId,
      once: options?.once,
    };

    this.subscriptions.set(id, subscription);
    console.log(
      `[EventBus] Subscribed to '${eventType}' events (subscription: ${id})`
    );

    return id;
  }

  /**
   * Subscribe to one event only
   */
  once(
    eventType: AgentEventType | "*",
    handler: AgentEventHandler,
    agentId?: string
  ): string {
    return this.subscribe(eventType, handler, { agentId, once: true });
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    const result = this.subscriptions.delete(subscriptionId);
    if (result) {
      console.log(`[EventBus] Unsubscribed (subscription: ${subscriptionId})`);
    }
    return result;
  }

  /**
   * Unsubscribe all handlers for a specific event type
   */
  unsubscribeAll(eventType: AgentEventType): number {
    let count = 0;
    for (const [id, sub] of this.subscriptions) {
      if (sub.eventType === eventType) {
        this.subscriptions.delete(id);
        count++;
      }
    }
    console.log(`[EventBus] Unsubscribed ${count} handlers for '${eventType}'`);
    return count;
  }

  // ============================================================================
  // PUBLISHING
  // ============================================================================

  /**
   * Publish an event
   */
  async publish(event: Omit<AgentEvent, "id" | "timestamp">): Promise<void> {
    const fullEvent: AgentEvent = {
      ...event,
      id: nanoid(),
      timestamp: new Date(),
    };

    // Add to queue
    this.eventQueue.push(fullEvent);

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Process the event queue
   */
  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.processEvent(event);
    }

    this.isProcessing = false;
  }

  /**
   * Process a single event
   */
  private async processEvent(event: AgentEvent): Promise<void> {
    const startTime = Date.now();

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Find matching subscriptions
    const subscriptionsToRemove: string[] = [];

    for (const [id, sub] of this.subscriptions) {
      // Check event type match
      if (sub.eventType !== "*" && sub.eventType !== event.type) {
        continue;
      }

      // Check agent filter
      if (sub.agentId && sub.agentId !== event.sourceAgentId) {
        continue;
      }

      // Execute handler
      try {
        await sub.handler(event);
      } catch (error) {
        console.error(
          `[EventBus] Error in handler for '${event.type}':`,
          error
        );
      }

      // Mark for removal if once
      if (sub.once) {
        subscriptionsToRemove.push(id);
      }
    }

    // Remove one-time subscriptions
    for (const id of subscriptionsToRemove) {
      this.subscriptions.delete(id);
    }

    // Track processing time
    const processingTime = Date.now() - startTime;
    this.processingTimes.push(processingTime);
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }
  }

  // ============================================================================
  // CONVENIENCE PUBLISHERS
  // ============================================================================

  /**
   * Emit agent started event
   */
  async emitAgentStarted(
    agentId: string,
    capability: string,
    requestId: string
  ): Promise<void> {
    await this.publish({
      type: "agent.started",
      sourceAgentId: agentId,
      payload: { capability, requestId },
      correlationId: requestId,
    });
  }

  /**
   * Emit agent completed event
   */
  async emitAgentCompleted(
    agentId: string,
    capability: string,
    requestId: string,
    result: unknown
  ): Promise<void> {
    await this.publish({
      type: "agent.completed",
      sourceAgentId: agentId,
      payload: { capability, requestId, result },
      correlationId: requestId,
    });
  }

  /**
   * Emit agent failed event
   */
  async emitAgentFailed(
    agentId: string,
    capability: string,
    requestId: string,
    error: unknown
  ): Promise<void> {
    await this.publish({
      type: "agent.failed",
      sourceAgentId: agentId,
      payload: { capability, requestId, error },
      correlationId: requestId,
    });
  }

  /**
   * Emit needs review event
   */
  async emitNeedsReview(
    agentId: string,
    requestId: string,
    reason: string,
    data: unknown
  ): Promise<void> {
    await this.publish({
      type: "agent.needs_review",
      sourceAgentId: agentId,
      payload: { requestId, reason, data },
      correlationId: requestId,
    });
  }

  /**
   * Emit escalation requested event
   */
  async emitEscalation(
    sourceAgentId: string,
    targetAgentId: string,
    requestId: string,
    reason: string,
    data: unknown
  ): Promise<void> {
    await this.publish({
      type: "escalation.requested",
      sourceAgentId,
      targetAgentId,
      payload: { requestId, reason, data },
      correlationId: requestId,
    });
  }

  /**
   * Emit alert event
   */
  async emitAlert(
    agentId: string,
    alertType: string,
    message: string,
    data?: unknown
  ): Promise<void> {
    await this.publish({
      type: "alert.triggered",
      sourceAgentId: agentId,
      payload: { alertType, message, data },
    });
  }

  /**
   * Emit custom event
   */
  async emitCustom(
    agentId: string,
    eventName: string,
    payload: unknown,
    correlationId?: string
  ): Promise<void> {
    await this.publish({
      type: "custom",
      sourceAgentId: agentId,
      payload: { eventName, ...((payload as object) || {}) },
      correlationId,
    });
  }

  // ============================================================================
  // QUERY
  // ============================================================================

  /**
   * Get recent events
   */
  getRecentEvents(limit = 100): AgentEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: AgentEventType, limit = 100): AgentEvent[] {
    return this.eventHistory
      .filter((e) => e.type === type)
      .slice(-limit);
  }

  /**
   * Get events by correlation ID
   */
  getEventsByCorrelation(correlationId: string): AgentEvent[] {
    return this.eventHistory.filter((e) => e.correlationId === correlationId);
  }

  /**
   * Get events by source agent
   */
  getEventsByAgent(agentId: string, limit = 100): AgentEvent[] {
    return this.eventHistory
      .filter((e) => e.sourceAgentId === agentId)
      .slice(-limit);
  }

  // ============================================================================
  // STATS
  // ============================================================================

  /**
   * Get event bus statistics
   */
  getStats(): EventBusStats {
    const eventsByType: Record<string, number> = {};
    for (const event of this.eventHistory) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    const avgProcessingTime =
      this.processingTimes.length > 0
        ? this.processingTimes.reduce((a, b) => a + b, 0) /
          this.processingTimes.length
        : 0;

    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      subscriberCount: this.subscriptions.size,
      averageProcessingTime: avgProcessingTime,
    };
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
    this.processingTimes = [];
    console.log("[EventBus] History cleared");
  }

  /**
   * Clear all subscriptions (for testing)
   */
  clearSubscriptions(): void {
    this.subscriptions.clear();
    console.log("[EventBus] All subscriptions cleared");
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Get the global event bus instance
 */
export function getEventBus(): EventBus {
  return EventBus.getInstance();
}

/**
 * Subscribe to events
 */
export function subscribe(
  eventType: AgentEventType | "*",
  handler: AgentEventHandler,
  options?: { agentId?: string; once?: boolean }
): string {
  return getEventBus().subscribe(eventType, handler, options);
}

/**
 * Publish an event
 */
export async function publish(
  event: Omit<AgentEvent, "id" | "timestamp">
): Promise<void> {
  return getEventBus().publish(event);
}

export default EventBus;
