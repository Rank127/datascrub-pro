// Vercel API Client
// Documentation: https://vercel.com/docs/rest-api

import { VercelDeployment, VercelProject, VercelAnalytics } from "./types";

const VERCEL_API_BASE = "https://api.vercel.com";

interface VercelClientConfig {
  accessToken: string;
  projectId: string;
  teamId?: string;
}

function getConfig(): VercelClientConfig | null {
  const accessToken = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!accessToken || !projectId) {
    return null;
  }

  return {
    accessToken,
    projectId,
    teamId,
  };
}

async function vercelFetch<T>(
  endpoint: string,
  config: VercelClientConfig
): Promise<T> {
  const url = new URL(endpoint, VERCEL_API_BASE);

  // Add team ID if configured
  if (config.teamId) {
    url.searchParams.set("teamId", config.teamId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vercel API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Check if Vercel integration is configured
 */
export function isVercelConfigured(): boolean {
  return getConfig() !== null;
}

/**
 * Get project information
 */
export async function getProject(): Promise<VercelProject | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const response = await vercelFetch<{
      id: string;
      name: string;
      framework: string | null;
      updatedAt: number;
    }>(`/v9/projects/${config.projectId}`, config);

    return {
      id: response.id,
      name: response.name,
      framework: response.framework,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    console.error("[Vercel] Failed to get project:", error);
    return null;
  }
}

/**
 * Get recent deployments
 */
export async function getDeployments(limit = 5): Promise<VercelDeployment[]> {
  const config = getConfig();
  if (!config) {
    return [];
  }

  try {
    const response = await vercelFetch<{
      deployments: Array<{
        uid: string;
        name: string;
        url: string;
        state: VercelDeployment["state"];
        created: number;
        buildingAt?: number;
        ready?: number;
        source?: string;
        meta?: {
          githubCommitSha?: string;
          githubCommitMessage?: string;
          githubCommitRef?: string;
          githubCommitAuthorName?: string;
        };
      }>;
    }>(`/v6/deployments?projectId=${config.projectId}&limit=${limit}`, config);

    if (!response.deployments || !Array.isArray(response.deployments)) {
      return [];
    }

    return response.deployments.map((d) => ({
      id: d.uid,
      name: d.name,
      url: d.url,
      state: d.state,
      createdAt: d.created,
      buildingAt: d.buildingAt,
      ready: d.ready,
      source: d.source,
      meta: d.meta,
    }));
  } catch (error) {
    console.error("[Vercel] Failed to get deployments:", error);
    return [];
  }
}

/**
 * Get deployment details by ID
 */
export async function getDeploymentDetails(
  deploymentId: string
): Promise<{
  id: string;
  readyState: string;
  errorMessage?: string;
} | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const response = await vercelFetch<{
      id: string;
      readyState: string;
      errorMessage?: string;
    }>(`/v13/deployments/${deploymentId}`, config);

    return response;
  } catch (error) {
    console.error("[Vercel] Failed to get deployment details:", error);
    return null;
  }
}

/**
 * Get Web Analytics data (requires Vercel Pro plan)
 */
export async function getAnalytics(): Promise<VercelAnalytics | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    // Note: Analytics API requires Pro plan
    // This is a simplified version; full implementation would use /v1/web/insights
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const response = await vercelFetch<{
      data?: {
        pageViews?: number;
        visitors?: number;
        topPages?: Array<{ path: string; views: number }>;
      };
    }>(
      `/v1/insights?projectId=${config.projectId}&from=${dayAgo}&to=${now}&environment=production`,
      config
    );

    if (!response.data) {
      return null;
    }

    return {
      pageViews: response.data.pageViews || 0,
      visitors: response.data.visitors || 0,
      topPages: response.data.topPages || [],
    };
  } catch (error) {
    // Analytics might not be available without Pro plan
    console.warn("[Vercel] Analytics not available:", error);
    return null;
  }
}

/**
 * Trigger a new deployment (redeploy)
 */
export async function triggerRedeploy(): Promise<{
  success: boolean;
  deploymentId?: string;
  error?: string;
}> {
  const config = getConfig();
  if (!config) {
    return { success: false, error: "Vercel not configured" };
  }

  try {
    // Get the latest deployment to redeploy
    const deployments = await getDeployments(1);
    if (deployments.length === 0) {
      return { success: false, error: "No deployments found" };
    }

    const latestDeployment = deployments[0];

    const url = new URL("/v13/deployments", VERCEL_API_BASE);
    if (config.teamId) {
      url.searchParams.set("teamId", config.teamId);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: latestDeployment.name,
        target: "production",
        gitSource: latestDeployment.meta?.githubCommitRef
          ? {
              type: "github",
              ref: latestDeployment.meta.githubCommitRef,
            }
          : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Deploy failed: ${errorText}` };
    }

    const result = await response.json();
    return { success: true, deploymentId: result.id };
  } catch (error) {
    console.error("[Vercel] Failed to trigger redeploy:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get environment variables (names only, not values)
 */
export async function getEnvVarNames(): Promise<string[]> {
  const config = getConfig();
  if (!config) return [];

  try {
    const response = await vercelFetch<{
      envs: Array<{ key: string }>;
    }>(`/v9/projects/${config.projectId}/env`, config);

    return response.envs.map((e) => e.key);
  } catch (error) {
    console.error("[Vercel] Failed to get env vars:", error);
    return [];
  }
}
