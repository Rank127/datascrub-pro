/**
 * Daily Standup - Email Formatter
 *
 * Produces a dark-themed HTML email matching the existing
 * baseTemplate styling (#0f172a bg, #1e293b cards, #e2e8f0 text).
 */

import type { StandupMetrics } from "./collect-metrics";
import type { StandupAnalysis, HealthStatus } from "./analyze";

const HEALTH_COLORS: Record<HealthStatus, { bg: string; text: string; label: string }> = {
  EXCELLENT: { bg: "#059669", text: "#ffffff", label: "Excellent" },
  GOOD: { bg: "#10b981", text: "#ffffff", label: "Good" },
  ATTENTION_NEEDED: { bg: "#f59e0b", text: "#000000", label: "Attention Needed" },
  CRITICAL: { bg: "#ef4444", text: "#ffffff", label: "Critical" },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#3b82f6",
};

function card(title: string, content: string): string {
  return `
    <div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
      <h2 style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0; border-bottom: 1px solid #334155; padding-bottom: 8px;">${title}</h2>
      ${content}
    </div>`;
}

function statBox(label: string, value: string | number, color?: string): string {
  return `
    <div style="text-align: center; padding: 8px 12px;">
      <div style="font-size: 24px; font-weight: bold; color: ${color || "#e2e8f0"};">${value}</div>
      <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">${label}</div>
    </div>`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatStandupEmail(
  metrics: StandupMetrics,
  analysis: StandupAnalysis
): string {
  const healthStyle = HEALTH_COLORS[analysis.overallHealth];
  const dateStr = formatDate(metrics.collectedAt);

  // --- Header ---
  const header = `
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #e2e8f0; font-size: 22px; margin: 0 0 8px 0;">Daily Cabinet Meeting</h1>
      <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px 0;">${dateStr}</p>
      <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: ${healthStyle.bg}; color: ${healthStyle.text}; font-weight: bold; font-size: 13px;">
        ${healthStyle.label}
      </div>
    </div>`;

  // --- Executive Summary ---
  const executiveSummary = card(
    "Executive Summary",
    `<p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">${analysis.executiveSummary}</p>`
  );

  // --- Highlights ---
  const highlightsHtml = analysis.highlights.length > 0
    ? card(
        "Highlights",
        `<ul style="margin: 0; padding-left: 20px;">
          ${analysis.highlights
            .map(
              (h) =>
                `<li style="color: #a7f3d0; font-size: 13px; margin-bottom: 6px; line-height: 1.5;">${h}</li>`
            )
            .join("")}
        </ul>`
      )
    : "";

  // --- Concerns ---
  const concernsHtml = analysis.concerns.length > 0
    ? card(
        "Concerns",
        `<ul style="margin: 0; padding-left: 20px;">
          ${analysis.concerns
            .map(
              (c) =>
                `<li style="color: #fca5a5; font-size: 13px; margin-bottom: 6px; line-height: 1.5;">${c}</li>`
            )
            .join("")}
        </ul>`
      )
    : "";

  // --- Action Items ---
  const actionItemsHtml = analysis.actionItems.length > 0
    ? card(
        "Action Items",
        `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="border-bottom: 1px solid #334155;">
            <th style="text-align: left; padding: 8px; color: #94a3b8; font-weight: 600;">Priority</th>
            <th style="text-align: left; padding: 8px; color: #94a3b8; font-weight: 600;">Action</th>
            <th style="text-align: left; padding: 8px; color: #94a3b8; font-weight: 600;">Rationale</th>
          </tr>
          ${analysis.actionItems
            .map(
              (item) =>
                `<tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px; vertical-align: top;">
                    <span style="color: ${PRIORITY_COLORS[item.priority] || "#94a3b8"}; font-weight: bold;">${item.priority}</span>
                  </td>
                  <td style="padding: 8px; color: #e2e8f0; vertical-align: top;">${item.action}</td>
                  <td style="padding: 8px; color: #94a3b8; vertical-align: top;">${item.rationale}</td>
                </tr>`
            )
            .join("")}
        </table>`
      )
    : "";

  // --- Suggestions ---
  const suggestionsHtml = (analysis.suggestions || []).length > 0
    ? card(
        "Suggestions",
        `<div style="border-left: 3px solid #3b82f6; padding-left: 12px;">
          <ul style="margin: 0; padding-left: 16px;">
            ${analysis.suggestions
              .map(
                (s) =>
                  `<li style="color: #93c5fd; font-size: 13px; margin-bottom: 6px; line-height: 1.5;">${s}</li>`
              )
              .join("")}
          </ul>
        </div>`
      )
    : "";

  // --- Nucleus Advisory Insight ---
  const mastermindHtml = analysis.mastermindInsight
    ? `<div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #f59e0b;">
        <h2 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px 0;">Nucleus Advisory Insight</h2>
        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-style: italic;">${analysis.mastermindInsight}</p>
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">— Mastermind Nucleus (Huang, Buffett, Nadella, Hassabis, Amodei)</p>
      </div>`
    : "";

  // --- Agent Performance ---
  // Build per-agent detail table (show agents that executed or are non-healthy)
  const visibleAgents = metrics.agents.agents.filter(
    (a) => a.executions24h > 0 || a.status !== "HEALTHY"
  );

  function formatAgentName(agentId: string): string {
    return agentId
      .replace(/-agent$/i, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  const agentDetailRows = visibleAgents
    .sort((a, b) => b.executions24h - a.executions24h)
    .map((agent) => {
      let statusColor: string;
      if (agent.status === "HEALTHY") statusColor = "#10b981";
      else if (agent.status === "DEGRADED") statusColor = "#f59e0b";
      else statusColor = "#ef4444";

      const successStr = agent.successRate24h !== null
        ? `${agent.successRate24h.toFixed(0)}%`
        : "—";
      const confidenceStr = agent.avgConfidence !== null
        ? `${agent.avgConfidence.toFixed(0)}%`
        : "—";
      const costStr = `$${agent.estimatedCost24h.toFixed(2)}`;
      const capsStr = agent.recentCapabilities.length > 0
        ? agent.recentCapabilities.join(", ")
        : "(idle)";

      return `<tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 4px 8px; color: ${statusColor}; font-size: 12px;">&#9679;</td>
        <td style="padding: 4px 8px; color: #e2e8f0; font-size: 12px; font-weight: 600;">${formatAgentName(agent.agentId)}</td>
        <td style="padding: 4px 8px; color: #94a3b8; font-size: 12px; text-align: center;">${agent.executions24h}</td>
        <td style="padding: 4px 8px; color: ${agent.successRate24h !== null && agent.successRate24h < 80 ? "#f59e0b" : "#94a3b8"}; font-size: 12px; text-align: center;">${successStr}</td>
        <td style="padding: 4px 8px; color: ${agent.avgConfidence !== null && agent.avgConfidence < 70 ? "#f59e0b" : "#94a3b8"}; font-size: 12px; text-align: center;">${confidenceStr}</td>
        <td style="padding: 4px 8px; color: #94a3b8; font-size: 12px; text-align: right;">${costStr}</td>
        <td style="padding: 4px 8px; color: #64748b; font-size: 11px;">${capsStr}</td>
      </tr>`;
    })
    .join("");

  const agentDetailTable = visibleAgents.length > 0
    ? `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <tr style="border-bottom: 1px solid #334155;">
          <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-size: 11px;"></th>
          <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Agent</th>
          <th style="text-align: center; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Execs</th>
          <th style="text-align: center; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Success</th>
          <th style="text-align: center; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Confidence</th>
          <th style="text-align: right; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Cost</th>
          <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-size: 11px;">What It Did</th>
        </tr>
        ${agentDetailRows}
      </table>`
    : "";

  const agentSection = card(
    "Agent Performance",
    `<div style="display: flex; justify-content: space-around; margin-bottom: 16px;">
      <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
      ${statBox("Healthy", metrics.agents.healthy, "#10b981")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Degraded", metrics.agents.degraded, "#f59e0b")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Failed", metrics.agents.failed, "#ef4444")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Cost", `$${metrics.agents.totalCost24h.toFixed(4)}`, "#94a3b8")}
      <!--[if mso]></td></tr></table><![endif]-->
    </div>
    ${agentDetailTable}
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">${analysis.agentReport}</p>`
  );

  // --- Cron Jobs ---
  const overdueWarning = metrics.crons.overdueJobs.length > 0
    ? `<p style="color: #fca5a5; font-size: 13px; margin: 0 0 8px 0;">Overdue: ${metrics.crons.overdueJobs.join(", ")}</p>`
    : "";

  // Build per-job detail table
  const jobDetailRows = (metrics.crons.jobDetails || [])
    .map((job) => {
      let statusIcon: string;
      let statusColor: string;
      if (!job.isLogging) {
        statusIcon = "&#9679;"; // gray circle
        statusColor = "#64748b";
      } else if (job.isOverdue || job.failureCount > 0) {
        statusIcon = "&#9679;"; // red circle
        statusColor = "#ef4444";
      } else {
        statusIcon = "&#9679;"; // green circle
        statusColor = "#10b981";
      }
      const lastRunStr = job.lastRun
        ? new Date(job.lastRun).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
        : "Never";
      return `<tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 4px 8px; color: ${statusColor}; font-size: 12px;">${statusIcon}</td>
        <td style="padding: 4px 8px; color: #e2e8f0; font-size: 12px;">${job.name}</td>
        <td style="padding: 4px 8px; color: #94a3b8; font-size: 12px;">${job.label}</td>
        <td style="padding: 4px 8px; color: #94a3b8; font-size: 12px;">${lastRunStr}</td>
        <td style="padding: 4px 8px; color: #10b981; font-size: 12px; text-align: center;">${job.successCount}</td>
        <td style="padding: 4px 8px; color: ${job.failureCount > 0 ? '#ef4444' : '#94a3b8'}; font-size: 12px; text-align: center;">${job.failureCount}</td>
      </tr>`;
    })
    .join("");

  const cronDetailTable = (metrics.crons.jobDetails || []).length > 0
    ? `<table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tr style="border-bottom: 1px solid #334155;">
          <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-size: 11px;"></th>
          <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Job</th>
          <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Schedule</th>
          <th style="text-align: left; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Last Run</th>
          <th style="text-align: center; padding: 4px 8px; color: #94a3b8; font-size: 11px;">OK</th>
          <th style="text-align: center; padding: 4px 8px; color: #94a3b8; font-size: 11px;">Fail</th>
        </tr>
        ${jobDetailRows}
      </table>`
    : "";

  const cronSection = card(
    "Cron Jobs",
    `<div style="display: flex; justify-content: space-around; margin-bottom: 12px;">
      <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
      ${statBox("Succeeded", metrics.crons.successCount24h, "#10b981")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Failed", metrics.crons.failureCount24h, metrics.crons.failureCount24h > 0 ? "#ef4444" : "#10b981")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Total Jobs", metrics.crons.totalJobs, "#94a3b8")}
      <!--[if mso]></td></tr></table><![endif]-->
    </div>
    ${overdueWarning}
    ${cronDetailTable}`
  );

  // --- Operations Dashboard ---
  const operationsSection = card(
    "Operations Dashboard",
    `<div style="margin-bottom: 12px;">
      <h3 style="color: #94a3b8; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0;">Removal Pipeline</h3>
      <div style="display: flex; justify-content: space-around;">
        <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
        ${statBox("Pending", metrics.removals.pending)}
        <!--[if mso]></td><td><![endif]-->
        ${statBox("Submitted", metrics.removals.submitted)}
        <!--[if mso]></td><td><![endif]-->
        ${statBox("Completed", metrics.removals.completed24h, "#10b981")}
        <!--[if mso]></td><td><![endif]-->
        ${statBox("Failed", metrics.removals.failed24h, metrics.removals.failed24h > 0 ? "#ef4444" : "#10b981")}
        <!--[if mso]></td></tr></table><![endif]-->
      </div>
      ${metrics.removals.avgCompletionHours ? `<p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">Avg completion time: ${metrics.removals.avgCompletionHours}h</p>` : ""}
    </div>
    <div>
      <h3 style="color: #94a3b8; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0;">Scan Activity</h3>
      <div style="display: flex; justify-content: space-around;">
        <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
        ${statBox("Completed", metrics.scans.completed24h, "#10b981")}
        <!--[if mso]></td><td><![endif]-->
        ${statBox("Failed", metrics.scans.failed24h, metrics.scans.failed24h > 0 ? "#ef4444" : "#10b981")}
        <!--[if mso]></td><td><![endif]-->
        ${statBox("Exposures", metrics.scans.exposuresFound24h, "#f59e0b")}
        <!--[if mso]></td></tr></table><![endif]-->
      </div>
    </div>
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 12px 0 0 0;">${analysis.operationsReport}</p>`
  );

  // --- Support Tickets ---
  const ticketSection = metrics.tickets ? card(
    "Support Tickets",
    `<div style="display: flex; justify-content: space-around; margin-bottom: 12px;">
      <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
      ${statBox("Open", metrics.tickets.openCount, metrics.tickets.openCount > 10 ? "#ef4444" : "#e2e8f0")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("In Progress", metrics.tickets.inProgressCount, "#3b82f6")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Waiting User", metrics.tickets.waitingUserCount, "#f59e0b")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Resolved 24h", metrics.tickets.resolvedClosed24h, "#10b981")}
      <!--[if mso]></td></tr></table><![endif]-->
    </div>
    ${metrics.tickets.aiCallsAvoided24h > 0 ? `
    <div style="background-color: #164e63; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-around;">
        <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
        ${statBox("Auto-Fixed", metrics.tickets.autoFixedCount24h, "#06b6d4")}
        <!--[if mso]></td><td><![endif]-->
        ${statBox("AI-Resolved", metrics.tickets.aiResolvedCount24h, "#8b5cf6")}
        <!--[if mso]></td><td><![endif]-->
        ${statBox("AI Calls Saved", metrics.tickets.aiCallsAvoided24h, "#10b981")}
        <!--[if mso]></td></tr></table><![endif]-->
      </div>
    </div>` : ""}
    ${metrics.tickets.staleCount > 0 ? `<p style="color: #fca5a5; font-size: 13px; margin: 0 0 8px 0;">Stale (4h+ idle): ${metrics.tickets.staleCount} tickets</p>` : ""}
    ${metrics.tickets.avgResolutionHours ? `<p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">Avg resolution time: ${metrics.tickets.avgResolutionHours}h</p>` : ""}
    ${analysis.ticketReport ? `<p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">${analysis.ticketReport}</p>` : ""}`
  ) : "";

  // --- Financial Snapshot ---
  const financialSection = card(
    "Financial Snapshot",
    `<div style="display: flex; justify-content: space-around; margin-bottom: 12px;">
      <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
      ${statBox("Free", metrics.users.planDistribution.FREE)}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Pro", metrics.users.planDistribution.PRO, "#3b82f6")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("Enterprise", metrics.users.planDistribution.ENTERPRISE, "#a855f7")}
      <!--[if mso]></td><td><![endif]-->
      ${statBox("New (24h)", metrics.users.newSignups24h, "#10b981")}
      <!--[if mso]></td></tr></table><![endif]-->
    </div>
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      ${metrics.users.totalUsers} total users | ${metrics.users.activeUsers7d} active in last 7 days
    </p>
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 8px 0 0 0;">${analysis.financialReport}</p>`
  );

  // --- Broker Intelligence ---
  const topBrokersHtml = metrics.brokers.topPerformers.length > 0
    ? metrics.brokers.topPerformers
        .map(
          (b) =>
            `<span style="color: #a7f3d0; font-size: 13px;">${b.sourceName || b.source}: ${b.successRate.toFixed(0)}% (${b.removalsCompleted} completed)</span>`
        )
        .join("<br>")
    : '<span style="color: #94a3b8; font-size: 13px;">No data yet</span>';

  const worstBrokersHtml = metrics.brokers.worstPerformers.length > 0
    ? metrics.brokers.worstPerformers
        .map(
          (b) =>
            `<span style="color: #fca5a5; font-size: 13px;">${b.sourceName || b.source}: ${b.successRate.toFixed(0)}% success, ${b.falsePositiveRate.toFixed(0)}% FP</span>`
        )
        .join("<br>")
    : '<span style="color: #94a3b8; font-size: 13px;">No data yet</span>';

  const brokerSection = card(
    "Broker Intelligence",
    `<div style="display: flex; gap: 16px;">
      <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0"><tr><td width="50%"><![endif]-->
      <div style="flex: 1;">
        <h3 style="color: #10b981; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0;">Top 3 Performers</h3>
        ${topBrokersHtml}
      </div>
      <!--[if mso]></td><td width="50%"><![endif]-->
      <div style="flex: 1;">
        <h3 style="color: #ef4444; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0;">Worst 3 Performers</h3>
        ${worstBrokersHtml}
      </div>
      <!--[if mso]></td></tr></table><![endif]-->
    </div>
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 12px 0 0 0;">${analysis.brokerReport}</p>`
  );

  // --- Footer ---
  const footer = `
    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155;">
      <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0;">
        Generated ${new Date(metrics.collectedAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" })} ET
      </p>
      <p style="color: #64748b; font-size: 11px; margin: 0;">
        <a href="https://ghostmydata.com/admin/executive" style="color: #10b981; text-decoration: none;">Open Admin Dashboard</a>
      </p>
    </div>`;

  // --- Assemble full email ---
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px; margin: 0;">
      <div style="max-width: 640px; margin: 0 auto;">
        ${header}
        ${executiveSummary}
        ${highlightsHtml}
        ${concernsHtml}
        ${actionItemsHtml}
        ${suggestionsHtml}
        ${mastermindHtml}
        ${agentSection}
        ${cronSection}
        ${operationsSection}
        ${ticketSection}
        ${financialSection}
        ${brokerSection}
        ${footer}
      </div>
    </body>
    </html>`;
}
