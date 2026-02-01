# DataScrub Pro Agent Architecture

## Overview

DataScrub Pro uses 24 AI-powered agents organized into 8 categories to automate privacy protection workflows. Each agent extends a common `BaseAgent` class that provides graceful fallback from AI-powered to rule-based execution.

## Quick Start

```typescript
import { getOrchestrator, orchestrate } from "@/lib/agents";

// Simple orchestration
const result = await orchestrate({
  action: "removal.batch",
  input: { batchSize: 100 },
  context: { invocationType: "CRON" }
});

// Or get the orchestrator directly
const orchestrator = getOrchestrator();
const health = await orchestrator.getSystemHealth();
```

## Agents by Category

### Core Domain (7 Agents)

| Agent | Mode | Purpose |
|-------|------|---------|
| **RemovalAgent** | HYBRID | Handles data removal requests, strategy selection, batch processing |
| **ScanningAgent** | HYBRID | Orchestrates privacy scans, result analysis, deduplication |
| **SupportAgent** | AI | Ticket classification, response generation, escalation |
| **InsightsAgent** | HYBRID | Risk scoring, reports, predictions, recommendations |
| **CommunicationsAgent** | HYBRID | Email personalization, timing optimization, channel selection |
| **OperationsAgent** | HYBRID | System health, anomaly detection, cleanup |
| **BillingAgent** | HYBRID | Churn prediction, upsell detection, subscription sync |

### Meta (1 Agent)

| Agent | Mode | Purpose |
|-------|------|---------|
| **QAAgent** | HYBRID | Validate all agents, regression tests, anomaly detection, QA reports |

### Compliance & Security (2 Agents)

| Agent | Mode | Purpose |
|-------|------|---------|
| **ComplianceAgent** | HYBRID | GDPR/CCPA tracking, legal templates, regulatory monitoring |
| **SecurityAgent** | HYBRID | Threat detection, suspicious activity, breach notifications |

### User Experience (3 Agents)

| Agent | Mode | Purpose |
|-------|------|---------|
| **ContentAgent** | AI | Blog posts, help articles, marketing copy, SEO content |
| **OnboardingAgent** | HYBRID | Personalized onboarding, first-scan guidance, feature recommendations |
| **SEOAgent** | HYBRID | Technical SEO audits, content analysis, blog ideas, SEO reports |

### Intelligence (3 Agents)

| Agent | Mode | Purpose |
|-------|------|---------|
| **BrokerIntelAgent** | HYBRID | Monitor broker changes, detect new brokers, track opt-out updates |
| **ThreatIntelAgent** | HYBRID | Dark web monitoring, breach detection, emerging threats |
| **CompetitiveIntelAgent** | HYBRID | Monitor competitors, pricing changes, feature gap analysis |

### Customer Success (2 Agents)

| Agent | Mode | Purpose |
|-------|------|---------|
| **SuccessAgent** | HYBRID | Proactive outreach, user health scores, milestone celebrations |
| **FeedbackAgent** | AI | Collect/analyze feedback, sentiment tracking, feature prioritization |

### Growth & Revenue (3 Agents)

| Agent | Mode | Purpose |
|-------|------|---------|
| **GrowthAgent** | HYBRID | Referral optimization, viral loops, power user identification |
| **PricingAgent** | HYBRID | Dynamic discounts, plan recommendations, pricing A/B tests |
| **PartnerAgent** | HYBRID | Affiliate management, B2B relationships, enterprise outreach |

### Specialized Operations (3 Agents)

| Agent | Mode | Purpose |
|-------|------|---------|
| **EscalationAgent** | HYBRID | Handle stubborn brokers, legal escalation, complex cases |
| **VerificationAgent** | HYBRID | Monitor re-appearances, collect proof, long-term monitoring |
| **RegulatoryAgent** | HYBRID | Track new privacy laws, jurisdiction handling, international expansion |

## API Endpoints

### List All Agents
```
GET /api/agents
```
Returns all registered agents with their capabilities and status.

### System Health
```
GET /api/agents/health
```
Returns health status of all agents and system metrics.

### Invoke Agent Directly
```
POST /api/agents/[agentId]
Content-Type: application/json

{
  "capability": "analyze",
  "input": { ... },
  "context": { "userId": "..." }
}
```

### Run Orchestrated Workflow
```
POST /api/agents/orchestrate
Content-Type: application/json

{
  "action": "removal.batch",
  "input": { "batchSize": 100 },
  "context": { "invocationType": "CRON" }
}
```

### QA Endpoints
```
POST /api/agents/qa          # Trigger QA validation run
GET  /api/agents/qa/report   # Get latest QA report
```

## Architecture

### Base Agent Pattern

All agents extend `BaseAgent` which provides:

```typescript
abstract class BaseAgent implements Agent {
  // Core properties
  readonly id: string;
  readonly name: string;
  readonly domain: AgentDomain;
  readonly mode: "AI" | "RULE_BASED" | "HYBRID";
  readonly capabilities: AgentCapability[];

  // Main execution with automatic fallback
  async execute<T>(input: unknown, context: AgentContext): Promise<AgentResult<T>>;

  // Health monitoring
  async isAvailable(): Promise<boolean>;
  async getHealth(): Promise<AgentHealth>;
}
```

### Graceful Fallback

HYBRID agents attempt AI execution first, falling back to rule-based logic:

```typescript
protected async doExecute<T>(input, context): Promise<AgentResult<T>> {
  try {
    if (this.anthropic) {
      return await this.executeWithAI(input, context);
    }
  } catch (error) {
    console.warn(`[${this.name}] AI failed, using rule-based fallback`);
  }
  return this.executeRuleBased(input, context);
}
```

### Orchestrator

The orchestrator routes requests to appropriate agents:

```typescript
const orchestrator = getOrchestrator();

// Route by action
await orchestrator.execute({
  action: "scanning.analyze",
  input: { userId: "user_123" }
});

// Run multi-agent workflow
await orchestrator.executeWorkflow("full-scan", {
  userId: "user_123"
});
```

### Event Bus

Agents communicate via an event bus:

```typescript
import { eventBus } from "@/lib/agents/orchestrator/event-bus";

// Subscribe to events
eventBus.on("removal.completed", async (event) => {
  // Trigger verification
});

// Emit events
eventBus.emit({
  type: "scan.completed",
  payload: { userId, exposures }
});
```

## Auto-Remediation Engine

The system includes an intelligent auto-remediation engine that detects and fixes issues automatically:

```typescript
import { getRemediationEngine, reportIssue, emitIssue } from "@/lib/agents";

// Report an issue for automatic remediation
await reportIssue({
  type: "seo.missing_title",
  severity: "critical",
  description: "Missing title tag on /pricing page",
  sourceAgentId: "seo-agent",
  affectedResource: "/pricing",
  canAutoRemediate: true,
});

// Or emit from within an agent
await emitIssue("my-agent", {
  type: "seo.thin_content",
  severity: "medium",
  description: "Content too short",
  canAutoRemediate: true,
});
```

### Remediation Flow

1. **Detection**: Agents detect issues and emit them to the event bus
2. **Matching**: Remediation engine matches issues to remediation rules
3. **Planning**: Creates a remediation plan with ordered actions
4. **Execution**: Auto-executes actions if `canAutoRemediate` is true
5. **Verification**: Runs verification step to confirm fix worked
6. **Notification**: Notifies on completion or escalates for human review

### Remediation Rules

Built-in rules cover:
- **SEO Issues**: Missing meta tags, thin content, readability issues
- **Security Issues**: Always escalated to security agent
- **Compliance Issues**: Always escalated for human review
- **Performance Issues**: Alerts operations team

### API Endpoints

```
GET  /api/agents/remediation        # Get status, plans, and statistics
POST /api/agents/remediation        # Report issues, approve/reject plans
  - action: "report"                # Report new issue
  - action: "approve"               # Approve pending plan
  - action: "reject"                # Reject pending plan
  - action: "enable-rule"           # Enable a rule
  - action: "disable-rule"          # Disable a rule
```

## File Structure

```
src/lib/agents/
├── index.ts                 # Main exports
├── types.ts                 # Core interfaces
├── base-agent.ts            # Abstract base class
├── registry.ts              # Agent registry singleton
│
├── orchestrator/
│   ├── index.ts             # AgentOrchestrator
│   ├── routing-rules.ts     # Request routing
│   ├── workflows.ts         # Multi-agent workflows
│   └── event-bus.ts         # Inter-agent communication
│
├── [agent-name]-agent/      # Each agent folder contains:
│   ├── index.ts             # Agent class
│   └── [helpers].ts         # Agent-specific helpers
│
└── infrastructure/
    ├── observability/       # Metrics, tracing, cost tracking
    ├── testing/             # Mocks, fixtures, shadow mode
    └── ai/                  # Multi-model, prompt registry, A/B testing
```

## Database Models

### AgentExecution
Tracks every agent invocation:

```prisma
model AgentExecution {
  id                String   @id @default(cuid())
  agentId           String
  capability        String
  requestId         String   @unique
  invocationType    String   // CRON, ON_DEMAND, EVENT
  status            String   // PENDING, RUNNING, COMPLETED, FAILED
  input             String?  // JSON
  output            String?  // JSON
  error             String?
  confidence        Float?
  needsHumanReview  Boolean  @default(false)
  startedAt         DateTime
  completedAt       DateTime?
  duration          Int?
  tokensUsed        Int?
  createdAt         DateTime @default(now())
}
```

### AgentHealth
Monitors agent health:

```prisma
model AgentHealth {
  id                  String   @id @default(cuid())
  agentId             String   @unique
  status              String   // HEALTHY, DEGRADED, UNHEALTHY
  lastRun             DateTime?
  lastSuccess         DateTime?
  consecutiveFailures Int      @default(0)
  updatedAt           DateTime @updatedAt
}
```

## Configuration

### Environment Variables

```bash
# Required for AI-powered agents
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Multi-model support
OPENAI_API_KEY=sk-...
```

### Agent Registry

Agents auto-register on import. To manually register:

```typescript
import { registry } from "@/lib/agents/registry";
import { MyCustomAgent } from "./my-custom-agent";

registry.register(new MyCustomAgent());
```

## Testing

### Unit Tests
```bash
npm run test -- --grep "agents"
```

### Shadow Mode
Run agents without side effects:

```typescript
const result = await agent.execute(input, {
  ...context,
  shadowMode: true
});
```

### QA Validation
```typescript
import { QAAgent } from "@/lib/agents/qa-agent";

const qa = new QAAgent();
const report = await qa.execute({
  capability: "validate-all"
}, context);
```

## Monitoring

### Health Check
```typescript
const orchestrator = getOrchestrator();
const health = await orchestrator.getSystemHealth();

// Returns:
{
  status: "HEALTHY",
  agents: {
    "removal-agent": { status: "HEALTHY", lastRun: "..." },
    // ...
  },
  metrics: {
    totalExecutions: 1234,
    successRate: 0.98,
    avgLatency: 450
  }
}
```

### Metrics Dashboard
Access via `/api/agents/metrics` for:
- Execution counts by agent
- Success/failure rates
- AI token usage and costs
- Latency percentiles

## Migration from Cron Jobs

The agent system replaces these cron jobs:

| Old Cron | New Agent |
|----------|-----------|
| `process-removals` | RemovalAgent |
| `verify-removals` | RemovalAgent + VerificationAgent |
| `monthly-rescan` | ScanningAgent |
| `follow-up-reminders` | CommunicationsAgent |
| `digests` | CommunicationsAgent |
| `health-check` | OperationsAgent |
| `link-checker` | OperationsAgent |
| `sync-subscriptions` | BillingAgent |
| `ticketing-agent` | SupportAgent |

## Contributing

When adding a new agent:

1. Create folder: `src/lib/agents/[name]-agent/`
2. Extend `BaseAgent` in `index.ts`
3. Implement `executeWithAI()` and `executeRuleBased()`
4. Add to registry in `src/lib/agents/index.ts`
5. Add QA tests in `qa-agent/test-suites/`
6. Update this README

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE STACK                               │
│  Observability        │  Testing Framework      │  Advanced AI Features      │
│  - Metrics            │  - Unit/Integration     │  - Multi-model (Claude+GPT)│
│  - Distributed trace  │  - Mocks & Fixtures     │  - Prompt versioning       │
│  - AI cost tracking   │  - Shadow mode          │  - A/B testing             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ORCHESTRATOR                                    │
│   - Routes requests to appropriate agents    - Multi-agent workflows         │
│   - Handles fallbacks and circuit breaking   - Event-driven coordination     │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│   CORE DOMAIN     │       │   INTELLIGENCE    │       │  CUSTOMER SUCCESS │
│   (7 Agents)      │       │   (3 Agents)      │       │   (2 Agents)      │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ • Removal         │       │ • Broker Intel    │       │ • Success         │
│ • Scanning        │       │ • Threat Intel    │       │ • Feedback        │
│ • Support         │       │ • Competitive     │       └───────────────────┘
│ • Insights        │       └───────────────────┘
│ • Communications  │       ┌───────────────────┐       ┌───────────────────┐
│ • Operations      │       │  GROWTH/REVENUE   │       │    SPECIALIZED    │
│ • Billing         │       │   (3 Agents)      │       │   (3 Agents)      │
└───────────────────┘       ├───────────────────┤       ├───────────────────┤
                            │ • Growth          │       │ • Escalation      │
┌───────────────────┐       │ • Pricing         │       │ • Verification    │
│ COMPLIANCE/SECURITY│       │ • Partner         │       │ • Regulatory      │
│   (2 Agents)      │       └───────────────────┘       └───────────────────┘
├───────────────────┤
│ • Compliance      │       ┌───────────────────┐       ┌───────────────────┐
│ • Security        │       │  USER EXPERIENCE  │       │    META AGENT     │
└───────────────────┘       │   (2 Agents)      │       │   (1 Agent)       │
                            ├───────────────────┤       ├───────────────────┤
                            │ • Content         │       │ • QA Agent        │
                            │ • Onboarding      │       │   (validates all) │
                            └───────────────────┘       └───────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SHARED SERVICES                                   │
│  Database (Prisma)  │  Event Bus  │  Context Store  │  Email Queue          │
│  Anthropic Claude   │  Cron Logger │  Rate Limiter  │  Cache (Redis)        │
└─────────────────────────────────────────────────────────────────────────────┘
```
