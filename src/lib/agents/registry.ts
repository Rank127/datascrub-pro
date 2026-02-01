/**
 * DataScrub Pro Agent Architecture - Agent Registry
 *
 * Singleton registry for managing all agents in the system.
 * Provides:
 * - Agent registration and discovery
 * - Capability lookup
 * - Health monitoring
 * - Agent lifecycle management
 */

import {
  Agent,
  AgentCapability,
  AgentConfig,
  AgentDomain,
  AgentHealthInfo,
  HealthStatuses,
} from "./types";

// ============================================================================
// REGISTRY TYPES
// ============================================================================

export interface RegisteredAgent {
  agent: Agent;
  config: AgentConfig;
  registeredAt: Date;
}

export interface AgentSummary {
  id: string;
  name: string;
  domain: AgentDomain;
  mode: string;
  version: string;
  description: string;
  capabilities: string[];
  enabled: boolean;
}

export interface RegistryStats {
  totalAgents: number;
  enabledAgents: number;
  byDomain: Record<string, number>;
  byMode: Record<string, number>;
  totalCapabilities: number;
}

// ============================================================================
// AGENT REGISTRY CLASS
// ============================================================================

class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, RegisteredAgent> = new Map();
  private capabilityIndex: Map<string, string[]> = new Map(); // capability -> agentIds
  private isInitialized = false;

  private constructor() {}

  /**
   * Get the singleton registry instance
   */
  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  /**
   * Register an agent with the registry
   */
  register(agent: Agent, config?: Partial<AgentConfig>): void {
    const fullConfig: AgentConfig = {
      agentId: agent.id,
      enabled: true,
      ...config,
    };

    // Check for duplicate registration
    if (this.agents.has(agent.id)) {
      console.warn(`[Registry] Agent '${agent.id}' is already registered, updating...`);
    }

    // Register the agent
    this.agents.set(agent.id, {
      agent,
      config: fullConfig,
      registeredAt: new Date(),
    });

    // Index capabilities
    for (const capability of agent.capabilities) {
      const capabilityKey = `${agent.id}.${capability.id}`;
      const agentIds = this.capabilityIndex.get(capability.id) || [];
      if (!agentIds.includes(agent.id)) {
        agentIds.push(agent.id);
      }
      this.capabilityIndex.set(capability.id, agentIds);
      this.capabilityIndex.set(capabilityKey, [agent.id]); // Full path
    }

    console.log(
      `[Registry] Registered agent '${agent.id}' with ${agent.capabilities.length} capabilities`
    );
  }

  /**
   * Unregister an agent from the registry
   */
  unregister(agentId: string): boolean {
    const registered = this.agents.get(agentId);
    if (!registered) {
      return false;
    }

    // Remove from capability index
    for (const capability of registered.agent.capabilities) {
      const agentIds = this.capabilityIndex.get(capability.id) || [];
      const filtered = agentIds.filter((id) => id !== agentId);
      if (filtered.length > 0) {
        this.capabilityIndex.set(capability.id, filtered);
      } else {
        this.capabilityIndex.delete(capability.id);
      }
      this.capabilityIndex.delete(`${agentId}.${capability.id}`);
    }

    // Remove agent
    this.agents.delete(agentId);
    console.log(`[Registry] Unregistered agent '${agentId}'`);

    return true;
  }

  // ============================================================================
  // LOOKUP
  // ============================================================================

  /**
   * Get an agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId)?.agent;
  }

  /**
   * Get agent configuration
   */
  getAgentConfig(agentId: string): AgentConfig | undefined {
    return this.agents.get(agentId)?.config;
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values()).map((r) => r.agent);
  }

  /**
   * Get agents by domain
   */
  getAgentsByDomain(domain: AgentDomain): Agent[] {
    return this.getAllAgents().filter((agent) => agent.domain === domain);
  }

  /**
   * Get agents that can handle a specific capability
   */
  getAgentsForCapability(capability: string): Agent[] {
    // Check if it's a fully qualified capability (agent.capability)
    if (capability.includes(".")) {
      const [agentId] = capability.split(".");
      const agent = this.getAgent(agentId);
      return agent ? [agent] : [];
    }

    // Find agents that have this capability
    const agentIds = this.capabilityIndex.get(capability) || [];
    return agentIds
      .map((id) => this.getAgent(id))
      .filter((agent): agent is Agent => agent !== undefined);
  }

  /**
   * Get all unique capabilities across all agents
   */
  getAllCapabilities(): AgentCapability[] {
    const capabilities: AgentCapability[] = [];
    const seen = new Set<string>();

    for (const { agent } of this.agents.values()) {
      for (const capability of agent.capabilities) {
        const key = `${agent.id}.${capability.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          capabilities.push(capability);
        }
      }
    }

    return capabilities;
  }

  /**
   * Find capability by full path (agent.capability)
   */
  findCapability(fullPath: string): AgentCapability | undefined {
    const [agentId, capabilityId] = fullPath.split(".");
    const agent = this.getAgent(agentId);
    if (!agent) return undefined;

    return agent.capabilities.find((c) => c.id === capabilityId);
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Update agent configuration
   */
  updateConfig(agentId: string, config: Partial<AgentConfig>): boolean {
    const registered = this.agents.get(agentId);
    if (!registered) {
      return false;
    }

    registered.config = {
      ...registered.config,
      ...config,
    };

    return true;
  }

  /**
   * Enable an agent
   */
  enableAgent(agentId: string): boolean {
    return this.updateConfig(agentId, { enabled: true });
  }

  /**
   * Disable an agent
   */
  disableAgent(agentId: string): boolean {
    return this.updateConfig(agentId, { enabled: false });
  }

  /**
   * Check if an agent is enabled
   */
  isAgentEnabled(agentId: string): boolean {
    return this.agents.get(agentId)?.config.enabled ?? false;
  }

  // ============================================================================
  // HEALTH & STATUS
  // ============================================================================

  /**
   * Get health status for all agents
   */
  async getAllHealth(): Promise<Record<string, AgentHealthInfo>> {
    const healthMap: Record<string, AgentHealthInfo> = {};

    for (const [id, { agent }] of this.agents) {
      try {
        healthMap[id] = await agent.getHealth();
      } catch (error) {
        healthMap[id] = {
          agentId: id,
          status: HealthStatuses.UNHEALTHY,
          consecutiveFailures: 0,
          aiAvailable: false,
          errorMessage: `Failed to get health: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }

    return healthMap;
  }

  /**
   * Get a summary of all agents
   */
  getAgentSummaries(): AgentSummary[] {
    return Array.from(this.agents.values()).map(({ agent, config }) => ({
      id: agent.id,
      name: agent.name,
      domain: agent.domain,
      mode: agent.mode,
      version: agent.version,
      description: agent.description,
      capabilities: agent.capabilities.map((c) => c.id),
      enabled: config.enabled,
    }));
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    const agents = Array.from(this.agents.values());

    const byDomain: Record<string, number> = {};
    const byMode: Record<string, number> = {};
    let totalCapabilities = 0;
    let enabledCount = 0;

    for (const { agent, config } of agents) {
      // Count by domain
      byDomain[agent.domain] = (byDomain[agent.domain] || 0) + 1;

      // Count by mode
      byMode[agent.mode] = (byMode[agent.mode] || 0) + 1;

      // Count capabilities
      totalCapabilities += agent.capabilities.length;

      // Count enabled
      if (config.enabled) {
        enabledCount++;
      }
    }

    return {
      totalAgents: agents.length,
      enabledAgents: enabledCount,
      byDomain,
      byMode,
      totalCapabilities,
    };
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  /**
   * Initialize all registered agents
   */
  async initializeAll(): Promise<void> {
    if (this.isInitialized) {
      console.log("[Registry] Already initialized");
      return;
    }

    console.log(`[Registry] Initializing ${this.agents.size} agents...`);

    const results = await Promise.allSettled(
      Array.from(this.agents.values()).map(async ({ agent }) => {
        if (agent.initialize) {
          await agent.initialize();
        }
      })
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.warn(
        `[Registry] ${failed.length} agents failed to initialize`
      );
    }

    this.isInitialized = true;
    console.log("[Registry] Initialization complete");
  }

  /**
   * Shutdown all registered agents
   */
  async shutdownAll(): Promise<void> {
    console.log(`[Registry] Shutting down ${this.agents.size} agents...`);

    await Promise.allSettled(
      Array.from(this.agents.values()).map(async ({ agent }) => {
        if (agent.shutdown) {
          await agent.shutdown();
        }
      })
    );

    this.isInitialized = false;
    console.log("[Registry] Shutdown complete");
  }

  /**
   * Clear all agents (for testing)
   */
  clear(): void {
    this.agents.clear();
    this.capabilityIndex.clear();
    this.isInitialized = false;
    console.log("[Registry] Cleared all agents");
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Get the global agent registry instance
 */
export function getRegistry(): AgentRegistry {
  return AgentRegistry.getInstance();
}

/**
 * Register an agent with the global registry
 */
export function registerAgent(agent: Agent, config?: Partial<AgentConfig>): void {
  getRegistry().register(agent, config);
}

/**
 * Unregister an agent from the global registry
 */
export function unregisterAgent(agentId: string): boolean {
  return getRegistry().unregister(agentId);
}

/**
 * Get an agent by ID
 */
export function getAgent(agentId: string): Agent | undefined {
  return getRegistry().getAgent(agentId);
}

/**
 * Get all registered agents
 */
export function getAllAgents(): Agent[] {
  return getRegistry().getAllAgents();
}

/**
 * Get agents that can handle a specific capability
 */
export function getAgentsForCapability(capability: string): Agent[] {
  return getRegistry().getAgentsForCapability(capability);
}

export default AgentRegistry;
