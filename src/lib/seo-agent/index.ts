/**
 * @deprecated This module has been moved to @/lib/agents/seo-agent
 *
 * The SEO Agent is now part of the unified agent architecture.
 * Please update your imports to use the new location:
 *
 * Old: import { ... } from "@/lib/seo-agent"
 * New: import { getSEOAgent, runSEOAudit, runFullSEOReport } from "@/lib/agents/seo-agent"
 *
 * This file re-exports from the new location for backward compatibility.
 */

// Re-export from new location for backward compatibility
export * from "../agents/seo-agent/blog-generator";
export * from "../agents/seo-agent/technical-audit";
export * from "../agents/seo-agent/content-optimizer";
export * from "../agents/seo-agent/report-generator";
