# AI Agents Documentation

This document provides comprehensive documentation for all AI-powered agents in the GhostMyData platform.

## Overview

AI agents are located in `/src/lib/agents/` and provide intelligent automation for various platform operations.

## Available Agents

| Agent | Purpose | Trigger |
|-------|---------|---------|
| Ticketing Agent | Auto-respond to support tickets | Event-driven |
| SEO Agent | SEO optimization and reporting | Weekly cron |

---

## 1. Ticketing Agent

**Location:** `/src/lib/agents/ticketing-agent.ts`
**Trigger:** Event-driven (on ticket creation and user comments)

### Purpose

AI-powered ticket analysis and response system using Claude that:
- Automatically reviews new support tickets
- Analyzes user comments on existing tickets
- Generates professional, brand-aligned responses
- Auto-resolves simple issues
- Flags complex issues for human review
- Creates manager review queue for important items

### Trigger Points

| Event | Endpoint | Action |
|-------|----------|--------|
| New ticket created | `POST /api/support/tickets` | `processNewTicket()` |
| User adds comment | `POST /api/support/tickets/[id]/comments` | `processNewComment()` |

### Response Flow

```
User creates ticket / adds comment
              ↓
     AI Agent analyzes content
              ↓
    ┌─────────┴─────────┐
    │                   │
 Simple              Complex
    │                   │
Auto-resolve      Draft response
Email user        Flag for review
    │                   │
    └─────────┬─────────┘
              ↓
   Log manager review items
   (if applicable)
```

### AI Model

- **Model:** Claude Sonnet 4
- **Max tokens:** 1024
- **API:** Anthropic SDK

### Response Guidelines

The agent follows strict professional guidelines:

**DO:**
- Maintain professional, positive, courteous tone
- Thank users for patience and choosing GhostMyData
- Frame issues positively
- End responses with confidence in resolution

**DON'T:**
- Speak negatively about GhostMyData
- Acknowledge shortcomings directly
- Promise specific timeframes
- Share technical implementation details

### Response Framing Examples

| Issue Type | Framing |
|------------|---------|
| Missing feature | "This capability is on our product roadmap" |
| Bug/Error | "Our technical team is prioritizing this" |
| Delay | "We appreciate your patience as we work diligently" |
| Scan failure | "We're experiencing high demand. Please try again shortly" |
| Removal taking long | "Data brokers have varying response times. We're persistently working on your behalf" |

### Manager Review Queue

The agent flags items for manager attention:

**Items Flagged:**
- Feature requests/gaps
- Customer complaints
- Recurring bugs or issues
- Negative sentiment
- Escalation-worthy issues

**Notification:**
- Internal comment with `[MANAGER REVIEW QUEUE]` tag
- Email sent to `ADMIN_EMAILS` recipients
- Retrievable via `getManagerReviewItems()` function

### Exported Functions

```typescript
// Analyze a ticket and generate response
analyzeTicket(context: TicketContext): Promise<AgentResponse>

// Process a new ticket
processNewTicket(ticketId: string): Promise<{
  success: boolean;
  autoResolved: boolean;
  message: string;
}>

// Process a new user comment
processNewComment(ticketId: string, commentContent: string): Promise<{
  success: boolean;
  responded: boolean;
  message: string;
}>

// Get agent statistics
getAgentStats(): Promise<{
  totalProcessed: number;
  autoResolved: number;
  pendingReview: number;
  averageResponseTime: number;
}>

// Get manager review items for dashboard
getManagerReviewItems(): Promise<Array<{
  ticketId: string;
  ticketNumber: string;
  items: string[];
  createdAt: Date;
}>>
```

### AgentResponse Interface

```typescript
interface AgentResponse {
  canAutoResolve: boolean;      // Can resolve without human
  response: string;             // Message to send to user
  suggestedActions: string[];   // Internal actions to take
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  needsHumanReview: boolean;    // Needs human review before sending
  internalNote: string;         // Note for support staff
  managerReviewItems: string[]; // Items for manager attention
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API access key |
| `ADMIN_EMAILS` | No | Comma-separated admin emails for alerts |
| `RESEND_API_KEY` | No | For sending manager alert emails |
| `RESEND_FROM_EMAIL` | No | Sender email for alerts |

### Internal Comments

The agent creates internal comments (not visible to users):

| Tag | Purpose |
|-----|---------|
| `[AI AGENT ANALYSIS]` | Analysis of ticket/comment |
| `[AI DRAFT RESPONSE]` | Draft response needing human review |
| `[MANAGER REVIEW QUEUE]` | Items flagged for manager |

---

## 2. SEO Agent

**Location:** `/src/lib/seo-agent/`
**Trigger:** Weekly cron (`/api/cron/seo-agent`)
**Schedule:** Sunday @ 09:00 UTC

### Components

| File | Purpose | Lines |
|------|---------|-------|
| `technical-audit.ts` | Technical SEO analysis | ~516 |
| `content-optimizer.ts` | Content quality analysis | ~396 |
| `blog-generator.ts` | Blog topic generation | ~291 |
| `report-generator.ts` | Report compilation | ~318 |
| `index.ts` | Module exports | ~7 |

### What It Does

1. **Technical Audit**
   - Checks metadata, structured data
   - Analyzes performance metrics
   - Evaluates mobile responsiveness

2. **Content Analysis**
   - Analyzes 27 priority pages
   - Checks keyword optimization
   - Evaluates content quality

3. **Blog Generation**
   - Generates topic ideas
   - Analyzes keyword gaps
   - Creates content calendar

4. **Reporting**
   - Calculates overall SEO score (0-100)
   - Identifies critical issues
   - Stores reports to database
   - Sends alerts if score < 70

### Manual Trigger

```bash
curl -X POST "https://ghostmydata.com/api/cron/seo-agent" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "runTechnicalAudit": true,
    "runContentAnalysis": true,
    "generateBlogIdeas": true,
    "sendEmailReport": true
  }'
```

---

## Adding New Agents

### Template

```typescript
// src/lib/agents/my-agent.ts

import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const SYSTEM_PROMPT = `Your agent instructions here...`;

export async function processTask(input: TaskInput): Promise<TaskOutput> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(input) }],
    });

    // Parse and return response
    return parseResponse(message);
  } catch (error) {
    console.error("Agent error:", error);
    return fallbackResponse(error);
  }
}
```

### Best Practices

1. **Error Handling** - Always provide fallback responses
2. **Non-Blocking** - Call agents asynchronously where possible
3. **Logging** - Log agent actions for debugging
4. **Rate Limiting** - Consider API rate limits
5. **Testing** - Test prompts thoroughly before deployment
6. **Monitoring** - Track success/failure rates

---

## Monitoring

### Agent Statistics

Access via `getAgentStats()`:
- Total tickets processed
- Auto-resolved count
- Pending human review count
- Average response time

### Logs

Agent actions are logged:
- Console logs for debugging
- Internal ticket comments for audit trail
- Manager review queue for escalations

### Alerts

- Manager review emails for flagged items
- SEO agent alerts for low scores (<70)

---

## Real-Time Dashboard Updates

The platform uses React Query for polling-based real-time updates.

### Setup

**Provider:** `/src/lib/query-provider.tsx`
- Wraps app in `QueryClientProvider`
- Default stale time: 10 seconds
- Refetch on window focus enabled

### Available Hooks

**Location:** `/src/hooks/`

| Hook | Purpose | Polling Interval |
|------|---------|------------------|
| `useAlerts()` | User alerts | 30 seconds |
| `useAdminTickets()` | Admin ticket list | 20 seconds |
| `useTicketStats()` | Ticket statistics | 30 seconds |
| `useUserTickets()` | User's own tickets | 30 seconds |

### Toast Notifications

Hooks automatically show toast notifications for:
- New tickets (admin)
- Ticket status changes
- New responses on tickets
- New alerts

### Usage Example

```typescript
import { useAlerts, useAdminTickets } from "@/hooks";

function Dashboard() {
  const { alerts, unreadCount } = useAlerts();
  const { tickets, total } = useAdminTickets({ status: "OPEN" });

  return (
    <div>
      <span>Unread: {unreadCount}</span>
      <span>Open tickets: {total}</span>
    </div>
  );
}
```
