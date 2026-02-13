# AI Agents Documentation

This document provides comprehensive documentation for all AI-powered agents in the GhostMyData platform.

## Overview

The platform has **24 AI-powered agents** located in `/src/lib/agents/`. They provide intelligent automation across 8 domains using a hybrid AI + rule-based approach.

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR (Router)                      │
├─────────────────────────────────────────────────────────────┤
│ ├─ Routes requests to appropriate agents                     │
│ ├─ Manages circuit breakers for failed agents               │
│ ├─ Coordinates multi-agent workflows                        │
│ └─ Emits events for inter-agent communication               │
└──────────────┬────────────────────────────────────────────┘
               │
   ┌───────────┼───────────┬──────────────┬──────────────┐
   ▼           ▼           ▼              ▼              ▼
CORE (7)   INTEL (3)  SUCCESS (2)    COMPLIANCE (2)  GROWTH (3)
USER (3)   SPECIAL (3)  META (1)
```

---

## Agent Summary Table

| # | Agent | Domain | Mode | Purpose |
|---|-------|--------|------|---------|
| 1 | RemovalAgent | Core | HYBRID | Data removal requests, batch processing |
| 2 | ScanningAgent | Core | HYBRID | Privacy scans, deduplication, rescans |
| 3 | SupportAgent | Core | AI | Ticket classification, auto-responses |
| 4 | InsightsAgent | Core | HYBRID | Analytics, risk scoring, predictions |
| 5 | CommunicationsAgent | Core | HYBRID | Email personalization, digests |
| 6 | OperationsAgent | Core | HYBRID | Health checks, cleanup, monitoring |
| 7 | BillingAgent | Core | HYBRID | Subscription sync, churn prediction |
| 8 | BrokerIntelAgent | Intelligence | HYBRID | Broker monitoring, new broker detection |
| 9 | ThreatIntelAgent | Intelligence | HYBRID | Dark web, breach detection |
| 10 | CompetitiveIntelAgent | Intelligence | HYBRID | Competitor monitoring, pricing tracking |
| 11 | ComplianceAgent | Compliance | HYBRID | GDPR/CCPA tracking, legal templates |
| 12 | SecurityAgent | Security | HYBRID | Threat detection, fraud prevention |
| 13 | ContentAgent | User Experience | AI | Blog posts, help articles, SEO content |
| 14 | OnboardingAgent | User Experience | HYBRID | Personalized onboarding flows |
| 15 | SEOAgent | User Experience | HYBRID | Technical audits, content optimization |
| 16 | GrowthAgent | Growth | HYBRID | Referral optimization, viral loops |
| 17 | PricingAgent | Growth | HYBRID | Dynamic discounts, plan recommendations |
| 18 | PartnerAgent | Growth | HYBRID | Affiliate management, B2B outreach |
| 19 | SuccessAgent | Customer Success | HYBRID | Health scoring, at-risk detection |
| 20 | FeedbackAgent | Customer Success | AI | Sentiment analysis, NPS tracking |
| 21 | EscalationAgent | Specialized | HYBRID | Stubborn brokers, legal escalation |
| 22 | VerificationAgent | Specialized | HYBRID | Re-appearance monitoring, proof |
| 23 | RegulatoryAgent | Specialized | HYBRID | Privacy law tracking, jurisdiction |
| 24 | QAAgent | Meta | HYBRID | Validates all agents, regression testing |

---

## Core Operations Agents (7)

### 1. RemovalAgent

**Location:** `src/lib/agents/removal-agent/index.ts`
**Mode:** HYBRID (AI + Rule-based fallback)

**Capabilities:**
- Strategy selection for optimal removal method
- Batch processing of removal requests
- Individual removal handling
- Verification of completed removals

**Replaces cron jobs:** `process-removals`, `verify-removals`

---

### 2. ScanningAgent

**Location:** `src/lib/agents/scanning-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Scan orchestration across multiple sources
- Result analysis and deduplication
- Monthly rescan automation
- Exposure confidence scoring

**Replaces cron jobs:** `monthly-rescan`

---

### 3. SupportAgent

**Location:** `src/lib/agents/support-agent/index.ts`
**Mode:** AI (Claude Sonnet 4)

**Capabilities:**
- Ticket classification and prioritization
- AI response generation
- Escalation detection
- Auto-resolution for simple issues

**Trigger:** Event-driven (on ticket creation and user comments)

**Response Guidelines:**

| DO | DON'T |
|----|-------|
| Be professional and courteous | Speak negatively about GhostMyData |
| Thank users for patience | Promise specific timeframes |
| Frame issues positively | Share technical implementation details |

---

### 4. InsightsAgent

**Location:** `src/lib/agents/insights-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Risk scoring (0-100)
- Report generation
- Trend predictions
- Personalized recommendations

**Replaces cron jobs:** `reports`

---

### 5. CommunicationsAgent

**Location:** `src/lib/agents/communications-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Email personalization
- Send timing optimization
- Digest generation
- Follow-up reminders

**Replaces cron jobs:** `follow-up-reminders`, `removal-digest`, `free-user-digest`

---

### 6. OperationsAgent

**Location:** `src/lib/agents/operations-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- System health checks (24 tests with auto-fix)
- Link validation
- Database cleanup
- Anomaly detection (`detect-anomalies`)

**`detect-anomalies` Capability (added Feb 2026):**
Catches silent infrastructure failures and auto-remediates:
- **Silent cron deaths** - Monitors critical crons for missing logs:
  - `process-removals`: alerts after 3h silence
  - `clear-pending-queue`: alerts after 2h silence
  - `verify-removals`: alerts after 25h silence
  - `health-check`: alerts after 25h silence
- **Auto-remediation** - Retriggers dead crons via HTTP request
- **Retrigger rate limiting** - Max 3 retriggers per cron per 24 hours (via `getRetriggerCount()` from cron-logger). Rate-limited retriggers are logged as `[RETRIGGER RATE-LIMITED]` alerts.
- **High failure rates** - Alerts if >30% removal failures in 24h
- **Unusual signups** - Alerts if >50 signups in 1 hour
- **Export:** `runDetectAnomalies()` for programmatic use

**Replaces cron jobs:** `health-check`, `link-checker`

---

### 7. BillingAgent

**Location:** `src/lib/agents/billing-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Subscription synchronization with Stripe
- Churn prediction
- Upsell opportunity detection

**Replaces cron jobs:** `sync-subscriptions`

---

## Intelligence Agents (3)

### 8. BrokerIntelAgent

**Location:** `src/lib/agents/broker-intel-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Monitor data brokers for changes
- Detect new brokers entering the market
- Track opt-out URL and process changes
- Alert on broker policy updates

---

### 9. ThreatIntelAgent

**Location:** `src/lib/agents/threat-intel-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Dark web surveillance
- Breach detection and correlation
- Emerging threat tracking
- User exposure correlation

---

### 10. CompetitiveIntelAgent

**Location:** `src/lib/agents/competitive-intel-agent/index.ts`
**Mode:** HYBRID

**Monitored Competitors:**
- DeleteMe, Privacy Duck, Kanary, Incogni, Optery

**Capabilities:**
- Pricing change detection
- Feature gap analysis
- Market trend analysis
- Competitor monitoring

---

## Compliance & Security Agents (2)

### 11. ComplianceAgent

**Location:** `src/lib/agents/compliance-agent/index.ts`
**Mode:** HYBRID

**Covered Jurisdictions:**
- GDPR (EU/UK)
- CCPA/CPRA (California)
- VCDPA (Virginia)
- CPA (Colorado)
- CTDPA (Connecticut)
- LGPD (Brazil)

**Capabilities:**
- Compliance checking
- Legal template generation
- Regulatory monitoring
- Policy enforcement

---

### 12. SecurityAgent

**Location:** `src/lib/agents/security-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Threat detection
- Suspicious activity monitoring
- Breach notifications
- Fraud prevention

---

## User Experience Agents (3)

### 13. ContentAgent

**Location:** `src/lib/agents/content-agent/index.ts`
**Mode:** AI

**Capabilities:**
- Blog post generation
- Help article creation
- Marketing copy
- SEO content optimization

---

### 14. OnboardingAgent

**Location:** `src/lib/agents/onboarding-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Personalized onboarding flows
- First-scan guidance
- Feature recommendations
- Milestone tracking

---

### 15. SEOAgent

**Location:** `src/lib/agents/seo-agent/index.ts`
**Mode:** HYBRID
**Schedule:** Weekly (Sunday @ 09:00 UTC)

**Components:**
| File | Purpose |
|------|---------|
| `technical-audit.ts` | Technical SEO analysis |
| `content-optimizer.ts` | Content quality analysis |
| `blog-generator.ts` | Blog topic generation |
| `report-generator.ts` | Report compilation |

**Manual Trigger:**
```bash
curl -X POST "https://ghostmydata.com/api/cron/seo-agent" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Growth & Revenue Agents (3)

### 16. GrowthAgent

**Location:** `src/lib/agents/growth-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Referral program optimization
- Viral loop analysis
- Power user identification
- Testimonial collection

---

### 17. PricingAgent

**Location:** `src/lib/agents/pricing-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
| Capability | Description |
|------------|-------------|
| `optimize-discounts` | Calculate optimal discounts for conversion |
| `recommend-plan` | Recommend best plan for user |
| `manage-ab-tests` | Manage pricing experiments |

**Usage:**
```typescript
import { recommendPlan } from "@/lib/agents/pricing-agent";

const recommendation = await recommendPlan("user_123");
// Returns: { recommendedPlan: "PRO", reasons: [...], valueProps: [...] }
```

---

### 18. PartnerAgent

**Location:** `src/lib/agents/partner-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Affiliate management
- B2B relationship tracking
- Enterprise prospect identification
- Partnership outreach

---

## Customer Success Agents (2)

### 19. SuccessAgent

**Location:** `src/lib/agents/success-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- User health score calculation (0-100)
- Proactive outreach triggers
- Milestone detection
- At-risk user identification

---

### 20. FeedbackAgent

**Location:** `src/lib/agents/feedback-agent/index.ts`
**Mode:** AI

**Capabilities:**
- Feedback analysis
- Sentiment tracking
- Feature prioritization suggestions
- NPS tracking and analysis

---

## Specialized Operations Agents (3)

### 21. EscalationAgent

**Location:** `src/lib/agents/escalation-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Stubborn broker handling
- Legal escalation path determination
- Complex case management
- Attorney general complaint preparation

---

### 22. VerificationAgent

**Location:** `src/lib/agents/verification-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Re-appearance monitoring
- Screenshot proof collection
- Long-term removal tracking
- Verification scheduling

---

### 23. RegulatoryAgent

**Location:** `src/lib/agents/regulatory-agent/index.ts`
**Mode:** HYBRID

**Capabilities:**
- Privacy law tracking by state/country
- Jurisdiction-specific handling
- International expansion support
- Regulatory update monitoring

---

## Meta Agent (1)

### 24. QAAgent

**Location:** `src/lib/agents/qa-agent/index.ts`
**Mode:** HYBRID

**Scope:** Monitors and validates all 24 agents

**Capabilities:**
- Agent validation and testing
- Regression testing
- Anomaly detection across agents
- QA report generation
- Performance monitoring

---

## Supporting Infrastructure

### Intelligence Coordinator

**Location:** `src/lib/agents/intelligence-coordinator/index.ts`

Coordinates agent-to-agent communication:
- Job locking to prevent race conditions
- Dependency management between agents
- Broker intelligence aggregation
- Predictive insights generation

### Agent Orchestrator

**Location:** `src/lib/agents/orchestrator/index.ts`

Central router for all agent requests:
- Request routing to appropriate agents
- Workflow management
- Circuit breaker for failed agents
- Event emission for logging

### Remediation Engine Safety (Feb 2026)

**Location:** `src/lib/agents/orchestrator/remediation-engine.ts`

The remediation engine includes three safety mechanisms:
- **Issue Deduplication** — `recentIssues` Map with 30-minute TTL. Fingerprint: `type:affectedResource`. Duplicate issues logged as `DEDUP_SKIP`.
- **Circuit Breaker** — `circuitBreaker` Map tracks failures per fingerprint. After 3 failures within 6 hours, state flips to OPEN (skips remediation, emits `remediation.circuit_breaker_open` escalation event). Auto-resets to CLOSED after 6h inactivity. Successful remediation resets the counter.

### Event Bus Deduplication (Feb 2026)

**Location:** `src/lib/agents/orchestrator/event-bus.ts`

- **Event Deduplication** — `recentEventHashes` Map with 10-minute TTL. Hash computed from `type|sourceAgentId|alertType|eventName|capability|cronName|correlationId`. Duplicate events are silently dropped.

---

## Agent Distribution

### By Mode

| Mode | Count | Description |
|------|-------|-------------|
| HYBRID | 21 | AI with rule-based fallback |
| AI | 3 | Pure AI (Support, Content, Feedback) |

### By Automation

| Type | Count | Mechanism |
|------|-------|-----------|
| Automated (CRON) | 20+ | Scheduled background jobs |
| Event-Driven | 24 | All support event triggers |
| On-Demand | 24 | All support manual invocation |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Claude API for AI agents |
| `ADMIN_EMAILS` | No | Alert recipients |
| `RESEND_API_KEY` | No | Email notifications |
| `CRON_SECRET` | Yes | Cron job authentication |

---

## Adding New Agents

### Template

```typescript
// src/lib/agents/my-agent/index.ts

import { BaseAgent } from "../base-agent";
import { AgentCapability, AgentDomains, AgentModes } from "../types";
import { registerAgent } from "../registry";

class MyAgent extends BaseAgent {
  readonly id = "my-agent";
  readonly name = "My Agent";
  readonly domain = AgentDomains.CORE;
  readonly mode = AgentModes.HYBRID;
  readonly version = "1.0.0";
  readonly description = "Does something useful";

  readonly capabilities: AgentCapability[] = [
    { id: "do-thing", name: "Do Thing", description: "...", requiresAI: true },
  ];

  protected getSystemPrompt(): string {
    return `You are My Agent. Your job is to...`;
  }

  protected registerHandlers(): void {
    this.handlers.set("do-thing", this.handleDoThing.bind(this));
  }

  private async handleDoThing(input: unknown, context: AgentContext) {
    // Implementation
  }
}

export function getMyAgent(): MyAgent {
  const agent = new MyAgent();
  registerAgent(agent);
  return agent;
}
```

### Best Practices

1. **Error Handling** - Always provide fallback responses
2. **Non-Blocking** - Call agents asynchronously
3. **Logging** - Log actions for debugging
4. **Rate Limiting** - Respect API limits
5. **Testing** - Test prompts thoroughly
6. **Monitoring** - Track success/failure rates

---

## Monitoring

### Agent Statistics

Access via agent's `getStats()` method:
- Total requests processed
- Success/failure rates
- Average response time
- Circuit breaker status

### Logs

All agents log:
- Console logs for debugging
- Database records for audit trail
- Error tracking via Sentry (if configured)

### Alerts

- Manager review emails for escalations
- SEO alerts for low scores (<70)
- Security alerts for threats

---

## Mastermind Advisory Integration

Agents are mapped to Mastermind mission domains for strategic context injection. When agents process complex decisions, they can receive guidance from domain-specific advisors.

| Agent | Mission Domain | Key Advisors |
|-------|---------------|--------------|
| RemovalAgent | legal-compliance | Clooney, Katyal, Voss |
| SupportAgent | customer-culture | Peterson, Van Edwards, Nadella |
| BillingAgent | commerce-sales | Voss, Hormozi, Buffett |
| CompetitiveIntelAgent | competitive-intel | Carlsen, Caruana, Dalio |
| GrowthAgent | growth-revenue | Hormozi, Brunson, Patel |
| ContentAgent | brand-media | MrBeast, Gary Vee, Patel |
| SEOAgent | product-platform | Altman, Patel, Brunson |

**Usage:**
```typescript
import { buildAgentMastermindPrompt } from "@/lib/mastermind";

// Inject strategic context into agent processing
const agentPrompt = buildAgentMastermindPrompt("legal-compliance", 3);
```

See `CLAUDE.md` for full Mastermind documentation including invocation commands and the 5-layer organism model.

---

*Last Updated: February 2026*
*Agents Count: 24*
