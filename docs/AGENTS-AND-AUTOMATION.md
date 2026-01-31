# Agents & Automation Systems - DataScrub Pro

> Last Updated: January 31, 2026

## Summary

| Category | Count |
|----------|-------|
| AI Agents | 2 |
| Cron Jobs | 13 |
| MCP (Model Context Protocol) | 0 (Not Used) |
| AI Provider | Anthropic Claude |

---

## AI AGENTS

### 1. Ticketing Agent (Customer Support AI)

| Property | Value |
|----------|-------|
| **Location** | `src/lib/agents/ticketing-agent.ts` |
| **Lines of Code** | ~1,050 |
| **AI Model** | `claude-sonnet-4-20250514` |
| **Max Tokens** | 1,024 per request |

#### What It Does
- Analyzes incoming support tickets using AI
- Auto-generates professional responses
- Performs sentiment analysis (frustration, urgency detection)
- Maintains user history for personalized responses
- Finds similar resolved tickets for consistency
- Flags issues for manager review
- Can auto-resolve simple tickets without human intervention

#### When It's Invoked
| Trigger | Schedule | Route |
|---------|----------|-------|
| Cron Job | Every day @ 9am UTC | `POST /api/cron/ticketing-agent` |
| Manual | On-demand via API | `POST /api/cron/ticketing-agent` |

#### Processing Logic
- Processes up to **20 tickets per batch**
- Priority order: URGENT > HIGH > NORMAL > LOW (then oldest first)
- Skips tickets updated in last 5 minutes (prevents duplicates)
- 1-second delay between tickets (rate limiting)

#### AI Response Structure
```json
{
  "canAutoResolve": true/false,
  "response": "Professional message to user",
  "suggestedActions": ["retry_scan", "escalate"],
  "priority": "LOW|NORMAL|HIGH|URGENT",
  "needsHumanReview": true/false,
  "internalNote": "For support staff",
  "managerReviewItems": ["Bug: scan timeout"]
}
```

#### Dependencies
- `@anthropic-ai/sdk` - Claude API
- Prisma - Database
- Resend - Email notifications

---

### 2. SEO Agent (Content & Technical SEO)

| Property | Value |
|----------|-------|
| **Location** | `src/lib/seo-agent/` (4 modules) |
| **AI Model** | None (rule-based analysis) |

#### Modules

| Module | File | Purpose |
|--------|------|---------|
| Blog Generator | `blog-generator.ts` | Generate SEO blog topic ideas |
| Technical Audit | `technical-audit.ts` | Audit pages for SEO compliance |
| Content Optimizer | `content-optimizer.ts` | Analyze content quality |
| Report Generator | `report-generator.ts` | Compile comprehensive reports |

#### What It Does
- Audits 20+ website pages for SEO compliance
- Checks title tags, meta tags, headers, images, schema markup
- Calculates keyword density and readability scores
- Generates blog topic ideas (avoids duplicates)
- Creates comprehensive SEO reports with scoring

#### When It's Invoked
| Trigger | Schedule | Route |
|---------|----------|-------|
| Cron Job | Weekly (Sundays @ 9am UTC) | `GET/POST /api/cron/seo-agent` |
| Manual | On-demand via API | `POST /api/cron/seo-agent` |

#### Pages Audited
- Homepage, Pricing, Blog
- Comparison pages (DeleteMe, Incogni, etc.)
- Broker removal guides (Spokeo, WhitePages, etc.)
- Location-based pages (California, Texas, etc.)

#### Alert Conditions
- Email sent to admin if SEO score < 70
- Email sent if critical issues found

---

## CRON JOBS

All cron jobs are in `/src/app/api/cron/` and configured in `vercel.json`.

### Complete Schedule

| # | Job | Route | Schedule | Purpose |
|---|-----|-------|----------|---------|
| 1 | Ticketing Agent | `/api/cron/ticketing-agent` | Daily 9am UTC | AI ticket analysis |
| 2 | SEO Agent | `/api/cron/seo-agent` | Weekly Sun 9am UTC | SEO audits |
| 3 | Process Removals | `/api/cron/process-removals` | 6x daily (2,6,10,14,18,22 UTC) | Send CCPA emails |
| 4 | Health Check | `/api/cron/health-check` | Daily 7am UTC | System monitoring |
| 5 | Monthly Rescan | `/api/cron/monthly-rescan` | 1st of month 10am UTC | Queue user scans |
| 6 | Follow-up Reminders | `/api/cron/follow-up-reminders` | Daily 9am UTC | Removal reminders |
| 7 | Removal Digest | `/api/cron/removal-digest` | Daily 10am UTC | Status update emails |
| 8 | Free User Digest | `/api/cron/free-user-digest` | Weekly Wed 10am UTC | Exposure alerts |
| 9 | Close Resolved Tickets | `/api/cron/close-resolved-tickets` | Daily 11am UTC | Auto-close tickets |
| 10 | Reports | `/api/cron/reports` | Weekly Mon 8am UTC | Generate reports |
| 11 | Link Checker | `/api/cron/link-checker` | Daily 5am UTC | Find broken links |
| 12 | Verify Removals | `/api/cron/verify-removals` | Daily 8am UTC | Verify removal success |
| 13 | Sync Subscriptions | `/api/cron/sync-subscriptions` | Daily | Sync Stripe status |

---

### Cron Job Details

#### 1. Process Removals
**File:** `src/app/api/cron/process-removals/route.ts`

**What It Does:**
- Processes 100 pending removal requests per batch
- Retries 25 failed removals with alternative email patterns
- Applies per-broker rate limiting (max 25/day per broker)
- Minimum 15 minutes between requests to same broker

**Rate Limits:**
- ~125 emails per batch x 6 batches = 750/day
- ~22,500/month (within Resend 50k quota)

---

#### 2. Health Check
**File:** `src/app/api/cron/health-check/route.ts`

**What It Does:**
- Database connectivity test
- API keys validation (Anthropic, Resend, Stripe, HIBP)
- Encryption system verification
- Data integrity checks (orphaned records)
- Email quota status
- Cron job health (checks if jobs are overdue)

**Alerts:** Email to admin if critical issues found

---

#### 3. Monthly Rescan
**File:** `src/app/api/cron/monthly-rescan/route.ts`

**What It Does:**
| Plan | Action |
|------|--------|
| FREE | Send reminder email to manually rescan |
| PRO | Auto-queue weekly monitoring scans |
| ENTERPRISE | Auto-queue daily monitoring scans |

**Target:** Users who haven't scanned in 30+ days

---

#### 4. Follow-up Reminders
**File:** `src/app/api/cron/follow-up-reminders/route.ts`

**What It Does:**
- Sends follow-up emails for pending removals (30-45 days old)
- Individual email if < 5 pending removals
- Batch email if >= 5 pending removals

---

#### 5. Removal Digest
**File:** `src/app/api/cron/removal-digest/route.ts`

**What It Does:**
- Sends batched removal status updates
- Respects user email preferences
- Groups updates by user for single daily email

---

#### 6. Free User Digest
**File:** `src/app/api/cron/free-user-digest/route.ts`

**What It Does:**
- Weekly exposure alerts to FREE users
- Shows exposure counts by severity
- Lists top 10 exposure sources
- Calculates estimated manual removal time

**Limits:** 50 users per run, once per 7 days per user

---

#### 7. Close Resolved Tickets
**File:** `src/app/api/cron/close-resolved-tickets/route.ts`

**What It Does:**
- Finds RESOLVED tickets older than 24 hours
- Auto-closes them to CLOSED status
- Adds system comment about auto-closure

---

#### 8. Verify Removals
**File:** `src/app/api/cron/verify-removals/route.ts`

**What It Does:**
- Re-scans data brokers to verify removal success
- Updates removal status based on verification
- Marks confirmed removals as COMPLETED

---

#### 9. Sync Subscriptions
**File:** `src/app/api/cron/sync-subscriptions/route.ts`

**What It Does:**
- Syncs Stripe subscription status with database
- Updates user plan levels
- Handles subscription changes/cancellations

---

## EXTERNAL INTEGRATIONS

### AI Provider

| Service | Package | Model | Usage |
|---------|---------|-------|-------|
| Anthropic Claude | `@anthropic-ai/sdk` v0.52.0 | claude-sonnet-4-20250514 | Ticketing Agent |

### Email

| Service | Package | Quota | Usage |
|---------|---------|-------|-------|
| Resend | `resend` | 50k/month | All transactional emails |

### Other Services

| Service | Purpose |
|---------|---------|
| Stripe | Payment processing |
| Supabase | PostgreSQL database |
| Twilio | SMS notifications |
| HIBP | Breach data lookups |
| LeakCheck | Additional breach data |
| ScrapingBee | Web scraping for broker scans |

---

## MCP (Model Context Protocol)

**Status: NOT USED**

The codebase does not use MCP. All AI interactions go through the standard Anthropic SDK.

---

## REMOVAL AUTOMATION

**File:** `src/lib/removers/removal-service.ts`

### Removal Methods

| Method | Description |
|--------|-------------|
| AUTOMATIC | Direct website automation (browser) |
| CCPA_EMAIL | Automated privacy request emails |
| MANUAL_GUIDE | User instructions for manual removal |
| NOT_REMOVABLE | Breach/dark web (informational only) |

### Rate Limiting Strategy
- Max 25 requests per broker per day
- Min 15 minutes between requests to same broker
- Severity-weighted round-robin distribution

### Browser Automation
**File:** `src/lib/removers/browser-automation.ts`
- Automated opt-out on select data brokers
- Captcha solving support
- Retry logic with exponential backoff

---

## LOGGING & MONITORING

### Cron Logger
**File:** `src/lib/cron-logger.ts`

Tracks all cron job executions:
- Job name, status, duration
- Success/failure counts
- Historical execution data
- Overdue job detection

### Email Queue
**File:** `src/lib/email/index.ts`

- Quota tracking for Resend
- Queue emails when quota exceeded
- Batch process queued emails
- Priority system

---

## ENVIRONMENT VARIABLES

```env
# AI
ANTHROPIC_API_KEY=           # Claude API access

# Cron Authorization
CRON_SECRET=                 # Header for cron jobs

# Email
RESEND_API_KEY=              # Email service
RESEND_FROM_EMAIL=           # Sender address
ADMIN_EMAILS=                # Alert recipients

# Database
DATABASE_URL=                # Supabase PostgreSQL

# Security
ENCRYPTION_KEY=              # Data encryption

# Payments
STRIPE_API_KEY=              # Stripe API
STRIPE_WEBHOOK_SECRET=       # Webhook verification

# Scanning
HIBP_API_KEY=                # Have I Been Pwned
LEAKCHECK_API_KEY=           # LeakCheck
SCRAPINGBEE_API_KEY=         # Web scraping

# SMS
TWILIO_ACCOUNT_SID=          # Twilio account
TWILIO_AUTH_TOKEN=           # Twilio auth
TWILIO_PHONE_NUMBER=         # Sender number
```

---

## FILE STRUCTURE

```
src/
├── lib/
│   ├── agents/
│   │   ├── index.ts                 # Agent exports
│   │   └── ticketing-agent.ts       # AI support agent
│   │
│   ├── seo-agent/
│   │   ├── index.ts                 # SEO exports
│   │   ├── blog-generator.ts        # Blog ideas
│   │   ├── content-optimizer.ts     # Content analysis
│   │   ├── technical-audit.ts       # SEO audit
│   │   └── report-generator.ts      # Report generation
│   │
│   ├── removers/
│   │   ├── removal-service.ts       # Core removal logic
│   │   ├── browser-automation.ts    # Browser control
│   │   └── verification-service.ts  # Removal verification
│   │
│   ├── email/
│   │   └── index.ts                 # Email queue & sending
│   │
│   └── cron-logger.ts               # Execution tracking
│
└── app/api/cron/
    ├── ticketing-agent/route.ts
    ├── seo-agent/route.ts
    ├── process-removals/route.ts
    ├── health-check/route.ts
    ├── monthly-rescan/route.ts
    ├── follow-up-reminders/route.ts
    ├── removal-digest/route.ts
    ├── free-user-digest/route.ts
    ├── close-resolved-tickets/route.ts
    ├── reports/route.ts
    ├── link-checker/route.ts
    ├── verify-removals/route.ts
    └── sync-subscriptions/route.ts
```

---

## Quick Reference

### To manually trigger a cron job:
```bash
curl -X POST https://your-domain.com/api/cron/ticketing-agent \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### To check cron health:
```bash
curl https://your-domain.com/api/cron/health-check \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
