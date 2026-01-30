# Cron Jobs Registry

This document provides a comprehensive overview of all scheduled cron jobs in the GhostMyData platform.

## Overview

All cron jobs are:
- Located in `/src/app/api/cron/`
- Scheduled via `vercel.json`
- Protected by `CRON_SECRET` authorization
- Running in Vercel's serverless environment (region: `iad1`)

## Schedule Summary

| Time (UTC) | Job | Frequency |
|------------|-----|-----------|
| 02:00 | process-removals (batch 1) | Daily |
| 05:00 | link-checker | Daily |
| 06:00 | monitoring | Daily |
| 06:00 | process-removals (batch 2) | Daily |
| 07:00 | health-check | Daily |
| 08:00 | verify-removals | Daily |
| 08:00 | reports | Monday |
| 09:00 | follow-up-reminders | Daily |
| 09:00 | seo-agent | Sunday |
| 10:00 | process-removals (batch 3) | Daily |
| 10:00 | monthly-rescan | 1st of month |
| 10:00 | free-user-digest | Wednesday |
| 11:00 | close-resolved-tickets | Daily |
| 08:00, 14:00, 20:00 | ticketing-agent | 3x daily |
| 14:00 | process-removals (batch 4) | Daily |
| 18:00 | process-removals (batch 5) | Daily |
| 22:00 | process-removals (batch 6) | Daily |

---

## Job Details

### 1. process-removals

**Endpoint:** `/api/cron/process-removals`
**Schedule:** 6x daily (02:00, 06:00, 10:00, 14:00, 18:00, 22:00 UTC)
**Method:** POST, GET

**Purpose:**
Automatically processes pending removal requests and retries failed ones.

**What it does:**
- Processes up to 100 pending removal requests per batch
- Retries up to 25 failed removals with alternative email patterns
- Sends opt-out emails to data brokers
- Updates request status (SENT, FAILED)

**Rate Limiting:**
- Max 25 requests per broker per day
- 15 minutes minimum between same broker requests
- ~800-900 emails/day total (under Resend Pro 50k limit)

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `RESEND_API_KEY` - Email sending
- `DATABASE_URL` - Database access

**Failure Recovery:**
- Failed requests are automatically retried in next batch
- Alternative email patterns tried on retry
- Max 3 retry attempts before marking as permanently failed

---

### 2. verify-removals

**Endpoint:** `/api/cron/verify-removals`
**Schedule:** Daily @ 08:00 UTC
**Method:** GET

**Purpose:**
Verifies if removal requests have been completed by re-scanning sources.

**What it does:**
- Re-scans data broker sources for removed profiles
- Marks successful removals as COMPLETED
- Schedules next verification for pending removals
- Marks as FAILED after multiple verification attempts

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access

---

### 3. health-check

**Endpoint:** `/api/cron/health-check`
**Schedule:** Daily @ 07:00 UTC
**Method:** GET

**Purpose:**
System health monitoring with auto-remediation capabilities.

**Health Tests Performed:**
1. Database connection test
2. Encryption key validation
3. Auth configuration check
4. Email service (Resend) test
5. Stripe configuration validation
6. HIBP API connectivity
7. Orphaned profiles detection & cleanup
8. Stuck scans detection & reset
9. Stuck removal requests detection & reset
10. Past due subscriptions check
11. Users without passwords audit
12. Profile-user relationship integrity
13. Scan-profile relationship integrity
14. Exposure statistics validation
15. Removal request statistics

**Auto-Fix Capabilities:**
- Resets stuck scans (>1 hour in SCANNING status)
- Resets stuck removals (>24 hours in PENDING status)
- Links orphaned profiles to users
- Sends alert email with detailed report

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `ADMIN_EMAIL` - Alert recipient
- `DATABASE_URL` - Database access

---

### 4. monthly-rescan

**Endpoint:** `/api/cron/monthly-rescan`
**Schedule:** 1st of month @ 10:00 UTC
**Method:** GET

**Purpose:**
Triggers periodic scanning based on user subscription tier.

**Behavior by Plan:**
- **FREE:** Sends reminder email to manually scan
- **PRO:** Auto-queues weekly scans
- **ENTERPRISE:** Auto-queues daily scans

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access
- `RESEND_API_KEY` - Email sending

---

### 5. reports

**Endpoint:** `/api/cron/reports`
**Schedule:** Monday @ 08:00 UTC
**Method:** GET

**Purpose:**
Sends periodic privacy reports to users based on their preferences.

**Report Frequencies:**
- Daily reports
- Weekly reports (default)
- Monthly reports

**Report Contents:**
- Exposure statistics
- New exposures since last report
- Completed removals
- Risk score and changes
- Recommended actions

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access
- `RESEND_API_KEY` - Email sending

---

### 6. follow-up-reminders

**Endpoint:** `/api/cron/follow-up-reminders`
**Schedule:** Daily @ 09:00 UTC
**Method:** GET

**Purpose:**
Sends follow-up reminders for long-pending removal requests.

**Reminder Thresholds:**
- 30 days: First reminder
- 45 days: Second reminder
- 5+ pending: Batch summary email

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access
- `RESEND_API_KEY` - Email sending

---

### 7. link-checker

**Endpoint:** `/api/cron/link-checker`
**Schedule:** Daily @ 05:00 UTC
**Method:** GET, POST

**Purpose:**
Verifies data broker opt-out URLs are still functional.

**What it does:**
- Tests all broker opt-out URLs in directory
- Uses HEAD requests with proper user-agent
- Has URL correction mappings for known broken links
- Sends alert email with broken link list

**Status Codes:**
- 200, 301, 302, 403: Considered working
- 404, 500, timeout: Marked as broken

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `ADMIN_EMAILS` - Alert recipients
- `DATABASE_URL` - Database access

---

### 8. free-user-digest

**Endpoint:** `/api/cron/free-user-digest`
**Schedule:** Wednesday @ 10:00 UTC
**Method:** GET

**Purpose:**
Sends weekly exposure summary to FREE tier users.

**What it does:**
- Targets FREE users with active exposures
- Groups exposures by severity and data type
- Calculates estimated manual removal time (45 min/removal)
- Limits to 50 users per batch
- Tracks last digest sent timestamp

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access
- `RESEND_API_KEY` - Email sending

---

### 9. close-resolved-tickets

**Endpoint:** `/api/cron/close-resolved-tickets`
**Schedule:** Daily @ 11:00 UTC
**Method:** GET, POST

**Purpose:**
Auto-closes support tickets after resolution.

**Behavior:**
- Finds RESOLVED tickets older than 24 hours
- Updates status to CLOSED
- Adds system comment about auto-closure

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access

---

### 10. seo-agent

**Endpoint:** `/api/cron/seo-agent`
**Schedule:** Sunday @ 09:00 UTC
**Method:** GET, POST

**Purpose:**
Automated SEO optimization and reporting.

**What it does:**
1. Runs technical SEO audit on all pages
2. Analyzes content on 27 priority pages
3. Generates blog topic ideas
4. Creates comprehensive SEO report
5. Stores report to database
6. Sends alert if score < 70 or critical issues

**Manual Trigger Options (POST):**
```json
{
  "runTechnicalAudit": true,
  "runContentAnalysis": true,
  "generateBlogIdeas": true,
  "sendEmailReport": true
}
```

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `ADMIN_EMAILS` - Report recipients
- `RESEND_API_KEY` - Email sending

---

### 11. monitoring

**Endpoint:** `/api/cron/monitoring`
**Schedule:** Daily @ 06:00 UTC
**Method:** GET

**Purpose:**
General system monitoring and metrics collection.

**Environment Variables:**
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access

---

## Manual Triggering

All cron jobs can be triggered manually for testing:

```bash
# Using curl
curl -X GET "https://ghostmydata.com/api/cron/health-check" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Using POST with options
curl -X POST "https://ghostmydata.com/api/cron/seo-agent" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"runTechnicalAudit": true}'
```

## Monitoring & Alerts

**Success Indicators:**
- HTTP 200 response
- JSON response with `success: true`
- Metrics in response body

**Failure Indicators:**
- HTTP 500 response
- `success: false` in response
- Error details in response body

**Alert Recipients:**
- Configured via `ADMIN_EMAILS` environment variable
- Health check sends daily summary
- Critical issues trigger immediate alerts

## Troubleshooting

### Job Not Running
1. Check Vercel deployment logs
2. Verify `CRON_SECRET` is set correctly
3. Check vercel.json schedule syntax
4. Verify region availability

### Job Failing
1. Check Vercel function logs
2. Verify all environment variables are set
3. Check database connectivity
4. Review rate limits (Resend, external APIs)

### Stuck Removals/Scans
1. Health check auto-fixes most issues
2. Manual reset via database if needed
3. Check for external service outages

---

## 12. AI Ticketing Agent

**Endpoint:** `/api/cron/ticketing-agent`
**Schedule:** 3x daily at 8 AM, 2 PM, 8 PM UTC (`0 8,14,20 * * *`)
**Method:** GET, POST
**Agent Location:** `/src/lib/agents/ticketing-agent.ts`

**Purpose:**
AI-powered ticket analysis and auto-resolution system using Claude.

**What it does:**
1. Finds all OPEN and IN_PROGRESS tickets
2. Analyzes each ticket using AI (sentiment, user history, similar tickets)
3. Auto-resolves simple issues with professional responses
4. Flags complex issues for human review
5. Adjusts ticket priority based on urgency/sentiment
6. Sends email notifications to users on resolution

**Processing Limits:**
- Max 20 tickets per run (to prevent timeout)
- 5-minute cooldown between processing same ticket
- 1-second delay between tickets (rate limiting)
- Prioritizes by: URGENT > HIGH > NORMAL > LOW, then oldest first

**Response Types:**
- **Auto-resolve:** Simple issues resolved automatically with AI response
- **Draft response:** Complex issues get AI draft for human review
- **Escalate:** Critical issues flagged for immediate human attention
- **Manager review:** Important items logged for manager attention

**Additional Trigger Points (Event-driven):**
- `POST /api/support/tickets` - New ticket creation
- `POST /api/support/tickets/[id]/comments` - User comment added

**Environment Variables:**
- `ANTHROPIC_API_KEY` - Claude API access (required)
- `CRON_SECRET` - Authorization
- `DATABASE_URL` - Database access
- `RESEND_API_KEY` - Email notifications

**AI Model:** Claude Sonnet 4

**Behavior:**
```
Every 30 minutes
    ↓
Find OPEN/IN_PROGRESS tickets
    ↓
For each ticket:
    Enrich context (history, sentiment, similar tickets)
    ↓
    AI analyzes ticket content
    ↓
    ┌─── Can auto-resolve? ───┐
    │                         │
   Yes                       No
    │                         │
    Send response            Save draft
    Mark RESOLVED            Flag for review
    Email user               Adjust priority
```

**Manual Trigger:**
```bash
curl "https://ghostmydata.com/api/cron/ticketing-agent" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Configuration (vercel.json)

```json
{
  "crons": [
    { "path": "/api/cron/process-removals", "schedule": "0 2 * * *" },
    { "path": "/api/cron/link-checker", "schedule": "0 5 * * *" },
    { "path": "/api/cron/monitoring", "schedule": "0 6 * * *" },
    { "path": "/api/cron/process-removals", "schedule": "0 6 * * *" },
    { "path": "/api/cron/health-check", "schedule": "0 7 * * *" },
    { "path": "/api/cron/verify-removals", "schedule": "0 8 * * *" },
    { "path": "/api/cron/reports", "schedule": "0 8 * * 1" },
    { "path": "/api/cron/follow-up-reminders", "schedule": "0 9 * * *" },
    { "path": "/api/cron/process-removals", "schedule": "0 10 * * *" },
    { "path": "/api/cron/monthly-rescan", "schedule": "0 10 1 * *" },
    { "path": "/api/cron/free-user-digest", "schedule": "0 10 * * 3" },
    { "path": "/api/cron/close-resolved-tickets", "schedule": "0 11 * * *" },
    { "path": "/api/cron/ticketing-agent", "schedule": "0 8,14,20 * * *" },
    { "path": "/api/cron/process-removals", "schedule": "0 14 * * *" },
    { "path": "/api/cron/process-removals", "schedule": "0 18 * * *" },
    { "path": "/api/cron/process-removals", "schedule": "0 22 * * *" },
    { "path": "/api/cron/seo-agent", "schedule": "0 9 * * 0" }
  ]
}
```
