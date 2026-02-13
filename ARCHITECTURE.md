# GhostMyData - System Architecture

## Overview

GhostMyData is a personal data removal service built as a modern web application using Next.js with a serverless architecture deployed on Vercel.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GHOSTMYDATA                                     │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Browser   │───▶│   Vercel    │───▶│  Supabase   │    │  External   │  │
│  │   Client    │◀───│   (Next.js) │◀───│ (PostgreSQL)│    │    APIs     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                            │                                     ▲          │
│                            │         ┌───────────────────────────┤          │
│                            ▼         ▼                           │          │
│                     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│                     │   Stripe    │  │   Resend    │  │    HIBP     │       │
│                     │  (Payments) │  │   (Email)   │  │  (Breaches) │       │
│                     └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with App Router | 16.1.4 |
| React | UI library | 19.x |
| TypeScript | Type safety | 5.x |
| Tailwind CSS | Styling | 3.4.x |
| shadcn/ui | Component library | Latest |
| Lucide React | Icons | Latest |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js API Routes | Serverless functions | 16.1.4 |
| Prisma | ORM | 5.22.0 |
| NextAuth.js | Authentication | 5.x (Beta) |
| bcryptjs | Password hashing | 2.4.3 |

### Infrastructure
| Service | Purpose | Provider |
|---------|---------|----------|
| Hosting | Serverless deployment | Vercel |
| Database | PostgreSQL | Supabase |
| DNS | Domain management | Cloudflare |
| Email (Transactional) | Notifications | Resend |
| Email (Inbox) | Support emails | SiteGround |
| Payments | Subscriptions | Stripe |

### External APIs
| API | Purpose |
|-----|---------|
| HaveIBeenPwned | Breach database lookup |
| Stripe | Payment processing |
| Resend | Email delivery |

---

## Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing pages
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/              # Pricing page
│   │   ├── how-it-works/         # How it works
│   │   ├── blog/                 # Blog system
│   │   │   ├── page.tsx          # Blog index
│   │   │   └── [slug]/           # Individual posts
│   │   ├── compare/              # Competitor comparisons
│   │   ├── terms/                # Terms of Service
│   │   ├── privacy/              # Privacy Policy
│   │   └── security/             # Security page
│   │
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── (dashboard)/              # Protected dashboard
│   │   └── dashboard/
│   │       ├── page.tsx          # Main dashboard
│   │       ├── profile/          # Profile management
│   │       ├── scan/             # Scan initiation
│   │       ├── exposures/        # Exposure list
│   │       ├── whitelist/        # Whitelist management
│   │       ├── removals/         # Removal tracking
│   │       ├── alerts/           # User alerts
│   │       ├── reports/          # Privacy reports
│   │       ├── settings/         # User settings
│   │       ├── executive/        # Executive dashboard (Admin)
│   │       └── admin/            # User management (Admin)
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── profile/              # Profile CRUD
│   │   ├── scan/                 # Scan operations
│   │   ├── exposures/            # Exposure queries
│   │   ├── whitelist/            # Whitelist operations
│   │   ├── removals/             # Removal requests
│   │   ├── admin/                # Admin APIs (role-protected)
│   │   │   ├── executive-stats/  # Executive dashboard data
│   │   │   ├── users/            # User management
│   │   │   └── audit-logs/       # Audit log viewer
│   │   ├── stripe/               # Payment webhooks
│   │   └── cron/                 # Scheduled jobs
│   │
│   ├── feed.xml/                 # RSS feed
│   ├── og/                       # Dynamic OG images
│   ├── sitemap.ts                # Dynamic sitemap
│   ├── robots.ts                 # Robots.txt
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard components
│   │   └── executive/            # Executive dashboard components
│   │       ├── finance-section   # MRR, subscriptions, churn
│   │       ├── analytics-section # User/exposure metrics
│   │       ├── operations-section# Queue and health metrics
│   │       ├── user-activities   # Activity tables
│   │       ├── metric-card       # Reusable KPI card
│   │       └── trend-chart       # Recharts wrapper
│   ├── marketing/                # Conversion optimization
│   │   ├── exit-intent-popup     # 50% off exit popup
│   │   ├── social-proof-notifications # "X just signed up" toasts
│   │   ├── live-chat-widget      # Crisp chat integration
│   │   ├── countdown-timer       # Limited time offer timer
│   │   ├── privacy-score-quiz    # Interactive lead capture quiz
│   │   ├── marketing-widgets     # Client wrapper for widgets
│   │   └── pricing-countdown     # Client wrapper for timer
│   ├── analytics/                # Tracking components
│   │   ├── google-analytics      # GA4 integration
│   │   └── retargeting-pixels    # Facebook Pixel + Google Ads
│   ├── forms/                    # Form components
│   └── seo/                      # SEO components
│
├── lib/
│   ├── db/                       # Prisma client
│   ├── auth/                     # NextAuth config
│   ├── email/                    # Email templates
│   ├── encryption/               # PII encryption
│   ├── stripe/                   # Stripe utilities
│   ├── executive/                # Executive dashboard types
│   ├── rbac/                     # Role-based access control
│   ├── agents/                   # 24 AI agents (see docs/AGENTS.md)
│   │   ├── orchestrator/         # Agent router + remediation engine
│   │   ├── operations-agent/     # Health checks, anomaly detection
│   │   ├── support-agent/        # Ticket classification, AI responses
│   │   ├── removal-agent/        # Data removal automation
│   │   └── ...                   # 20+ more agent directories
│   ├── mastermind/               # Advisory system (75+ advisors)
│   ├── standup/                  # Daily standup metrics + email
│   ├── support/                  # Ticket service (58KB)
│   ├── scanners/                 # Data source scanners
│   │   ├── data-brokers/         # Broker integrations
│   │   ├── breaches/             # Breach checkers
│   │   ├── dark-web/             # Dark web monitors
│   │   └── social/               # Social media
│   └── blog/                     # Blog post data
│
└── content/                      # Static content
    └── outreach-templates.md     # Email templates
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     User     │───────│ PersonalProfile  │       │    Scan      │
├──────────────┤  1:1  ├──────────────────┤       ├──────────────┤
│ id           │       │ id               │       │ id           │
│ email        │       │ userId           │◀──────│ userId       │
│ passwordHash │       │ fullName (enc)   │  1:N  │ status       │
│ name         │       │ emails (enc)     │       │ type         │
│ plan         │       │ phones (enc)     │       │ exposuresFound│
│ createdAt    │       │ addresses (enc)  │       │ completedAt  │
└──────┬───────┘       │ ssnHash          │       └──────┬───────┘
       │               │ usernames (enc)  │              │
       │               └──────────────────┘              │
       │                                                 │
       │  1:N    ┌──────────────────────┐                 │
       ├────────▶│      Exposure        │◀────────────────┘
       │         ├──────────────────────┤       1:N
       │         │ id                   │
       │         │ userId               │     ┌──────────────────┐
       │         │ scanId               │     │ RemovalRequest   │
       │         │ source               │────▶├──────────────────┤
       │         │ dataType             │ 1:1 │ id               │
       │         │ severity             │     │ exposureId       │
       │         │ status               │     │ status           │
       │         │ isWhitelisted        │     │ method           │
       │         │ requiresManualAction │     │ attempts         │
       │         │ manualActionTaken    │     └──────────────────┘
       │         │ manualActionTakenAt  │
       │         └──────────────────────┘
       │
       │  1:N    ┌──────────────┐
       ├────────▶│  Whitelist   │
       │         ├──────────────┤
       │         │ id           │
       │         │ userId       │
       │         │ source       │
       │         │ sourceName   │
       │         └──────────────┘
       │
       │  1:1    ┌──────────────┐
       ├────────▶│ Subscription │
       │         ├──────────────┤
       │         │ id           │
       │         │ userId       │
       │         │ stripeCustomerId    │
       │         │ stripeSubscriptionId│
       │         │ plan         │
       │         │ status       │
       │         └──────────────┘
       │
       │  1:N    ┌──────────────┐
       ├────────▶│    Alert     │
       │         ├──────────────┤
       │         │ id           │
       │         │ userId       │
       │         │ type         │
       │         │ title        │
       │         │ message      │
       │         │ read         │
       │         └──────────────┘
       │
       │  1:N    ┌───────────────────┐       ┌──────────────────┐
       ├────────▶│  SupportTicket    │──────▶│  TicketComment   │
       │         ├───────────────────┤  1:N  ├──────────────────┤
       │         │ id                │       │ id               │
       │         │ userId            │       │ ticketId         │
       │         │ subject           │       │ authorId         │
       │         │ status            │       │ content          │
       │         │ priority          │       │ isStaff          │
       │         │ category          │       └──────────────────┘
       │         └───────────────────┘
       │
       │  owner  ┌──────────────────┐       ┌──────────────────┐
       ├────────▶│   FamilyGroup    │──────▶│  FamilyMember    │
       │         ├──────────────────┤  1:N  ├──────────────────┤
       │         │ id               │       │ id               │
       │         │ ownerId          │       │ userId           │
       │         │ name             │       │ groupId          │
       │         │ maxMembers       │       │ role             │
       │         └──────────────────┘       └──────────────────┘
       │
       │         ┌──────────────────┐       ┌──────────────────┐
       │         │    CronLog       │       │ AgentExecution   │
       │         ├──────────────────┤       ├──────────────────┤
       │         │ id               │       │ id               │
       │         │ jobName          │       │ agentId          │
       │         │ status           │       │ capability       │
       │         │ startedAt        │       │ status           │
       │         │ completedAt      │       │ tokensUsed       │
       │         │ details          │       │ duration         │
       │         └──────────────────┘       └──────────────────┘
```

### Key Enums

```typescript
enum Plan {
  FREE        // Basic features
  PRO         // Automated removals
  ENTERPRISE  // Dark web + family
}

enum ScanStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum DataSource {
  // Data Brokers
  SPOKEO, WHITEPAGES, BEENVERIFIED, INTELIUS,
  PEOPLEFINDER, TRUEPEOPLESEARCH, RADARIS
  // Breaches
  HAVEIBEENPWNED, DEHASHED, BREACH_DB
  // Dark Web
  DARK_WEB_MARKET, PASTE_SITE, DARK_WEB_FORUM
  // Social
  LINKEDIN, FACEBOOK, TWITTER, INSTAGRAM, etc.
}

enum Severity {
  LOW       // Username exposed
  MEDIUM    // Email/phone exposed
  HIGH      // Address/DOB exposed
  CRITICAL  // SSN/financial exposed
}

enum RemovalStatus {
  PENDING
  SUBMITTED
  IN_PROGRESS
  COMPLETED
  FAILED
  REQUIRES_MANUAL
}
```

---

## Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │ Next.js │     │NextAuth │     │Database │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ POST /login   │               │               │
     │──────────────▶│               │               │
     │               │ signIn()      │               │
     │               │──────────────▶│               │
     │               │               │ Query user    │
     │               │               │──────────────▶│
     │               │               │◀──────────────│
     │               │               │               │
     │               │               │ Verify bcrypt │
     │               │               │───────┐       │
     │               │               │◀──────┘       │
     │               │               │               │
     │               │ JWT token     │               │
     │               │◀──────────────│               │
     │ Set cookie    │               │               │
     │◀──────────────│               │               │
     │               │               │               │
     │ GET /dashboard│               │               │
     │──────────────▶│               │               │
     │               │ Verify JWT    │               │
     │               │──────────────▶│               │
     │               │◀──────────────│               │
     │ Dashboard HTML│               │               │
     │◀──────────────│               │               │
```

### Session Strategy
- **Type**: JWT (stateless)
- **Storage**: HTTP-only secure cookie
- **Expiry**: 30 days
- **Refresh**: Automatic on activity

---

## Data Flow: Scanning

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │   API   │     │ Scanner │     │   HIBP  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Start Scan    │               │               │
     │──────────────▶│               │               │
     │               │ Create Scan   │               │
     │               │ record        │               │
     │               │───────┐       │               │
     │               │◀──────┘       │               │
     │               │               │               │
     │               │ Run scanners  │               │
     │               │──────────────▶│               │
     │               │               │ Check breaches│
     │               │               │──────────────▶│
     │               │               │◀──────────────│
     │               │               │               │
     │               │               │ Check brokers │
     │               │               │───────┐       │
     │               │               │◀──────┘       │
     │               │               │               │
     │               │ Save exposures│               │
     │               │◀──────────────│               │
     │               │               │               │
     │               │ Update scan   │               │
     │               │ status        │               │
     │               │───────┐       │               │
     │               │◀──────┘       │               │
     │               │               │               │
     │ Scan complete │               │               │
     │◀──────────────│               │               │
     │               │               │               │
     │               │ Send email    │               │
     │               │ notification  │               │
     │               │─────────────────────────────▶ Resend
```

---

## Payment Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │   API   │     │ Stripe  │     │Database │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Upgrade to PRO│               │               │
     │──────────────▶│               │               │
     │               │ Create session│               │
     │               │──────────────▶│               │
     │               │◀──────────────│               │
     │ Redirect      │               │               │
     │◀──────────────│               │               │
     │               │               │               │
     │ Stripe Checkout               │               │
     │──────────────────────────────▶│               │
     │◀──────────────────────────────│               │
     │               │               │               │
     │               │  Webhook:     │               │
     │               │  checkout.    │               │
     │               │  completed    │               │
     │               │◀──────────────│               │
     │               │               │               │
     │               │ Update plan   │               │
     │               │──────────────────────────────▶│
     │               │               │               │
     │               │ Send email    │               │
     │               │─────────────────────────────▶ Resend
     │               │               │               │
     │ Return to app │               │               │
     │◀──────────────│               │               │
```

### Webhook Events Handled
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription |
| `customer.subscription.updated` | Update plan |
| `customer.subscription.deleted` | Downgrade to FREE |
| `invoice.payment_succeeded` | Log payment |
| `invoice.payment_failed` | Mark past_due |
| `charge.refunded` | Process refund, downgrade |

---

## Security Architecture

### Encryption

```
┌─────────────────────────────────────────────────────────┐
│                    PII ENCRYPTION                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   User Input ──▶ AES-256-GCM ──▶ Encrypted Data        │
│                       │                                 │
│                       ▼                                 │
│              ENCRYPTION_KEY (env)                       │
│                                                         │
│   Encrypted fields:                                     │
│   - fullName, aliases                                   │
│   - emails, phones                                      │
│   - addresses                                           │
│   - usernames                                           │
│                                                         │
│   Hashed (one-way):                                     │
│   - SSN (SHA-256 + salt)                               │
│   - passwords (bcrypt, cost 12)                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Security Measures

| Layer | Protection |
|-------|------------|
| Transport | TLS 1.3, HSTS |
| Authentication | JWT, HTTP-only cookies, bcrypt |
| Data at Rest | AES-256-GCM encryption |
| API | Rate limiting, CORS |
| Headers | CSP, X-Frame-Options, X-XSS-Protection |
| Payments | Stripe PCI-DSS Level 1 |

---

## AI Agent Fleet

The platform includes **24 AI-powered agents** across 8 domains, using a hybrid AI + rule-based approach. See `docs/AGENTS.md` for complete documentation.

| Domain | Agents | Examples |
|--------|--------|----------|
| Core Operations | 7 | RemovalAgent, ScanningAgent, SupportAgent, OperationsAgent |
| Intelligence | 3 | BrokerIntelAgent, ThreatIntelAgent, CompetitiveIntelAgent |
| Compliance & Security | 2 | ComplianceAgent, SecurityAgent |
| User Experience | 3 | ContentAgent, OnboardingAgent, SEOAgent |
| Growth & Revenue | 3 | GrowthAgent, PricingAgent, PartnerAgent |
| Customer Success | 2 | SuccessAgent, FeedbackAgent |
| Specialized | 3 | EscalationAgent, VerificationAgent, RegulatoryAgent |
| Meta | 1 | QAAgent (validates all other agents) |

**Architecture:** All agents extend `BaseAgent` and are coordinated by the Agent Orchestrator (`src/lib/agents/orchestrator/`). The orchestrator routes requests, manages circuit breakers, and emits events for inter-agent communication.

---

## Auto-Remediation System

The platform has a multi-layered self-healing system:

### 1. Health Check Auto-Fixes
- Resets stuck scans (>1h in SCANNING status)
- Resets stuck removals (>24h in PENDING status)
- Deletes orphaned profiles
- Auto-retriggers dead critical crons via HTTP

### 2. Operations Agent `detect-anomalies`
- Monitors critical crons for silent deaths (`process-removals`, `clear-pending-queue`, `verify-removals`, `health-check`)
- Alerts on high removal failure rates (>30% in 24h)
- Detects unusual signup patterns (>50/hour)
- Auto-retriggers dead crons via HTTP request
- Exported as `runDetectAnomalies()` for programmatic use

### 3. Remediation Engine v2
**Location:** `src/lib/agents/orchestrator/remediation-engine.ts`

Event-driven rules engine that handles:
- `seo.*` - SEO issues (broken links, low scores)
- `cron.*` - Cron failures and timeouts
- `ticket.*` - Stale tickets, escalation storms
- `security.*` - Security incidents
- `compliance.*` - Compliance violations
- `performance.*` - Performance degradation

### 4. Ticketing Agent Self-Healing
- `tryAutoResolve()` runs before AI call to save API cost
- Stale ticket detection: OPEN 4h+ escalates priority, WAITING_USER 48h+ reopens
- 24h escalation cooldown prevents priority storms
- Time-boxed execution with 4-minute deadline

---

## Mastermind Advisory System

Strategic advisory AI powered by 75+ modern advisors and 70+ historical minds, organized in a 5-layer organism model.

### 5-Layer Model
| Layer | Name | Description |
|-------|------|-------------|
| 1 | Nucleus | 5 Architects: Huang, Hassabis, Buffett, Nadella, Amodei |
| 2 | Mission Teams | 10 domain squads (Growth, Product, Legal, etc.) |
| 3 | AI Agent Layer | 24 AI agents mapped to mission domains |
| 4 | Network Layer | Expert network, advisory circles |
| 5 | Governance Mesh | Ethics, AI Safety, Transparency, Wisdom |

### 7-Step Decision Protocol
`MAP → ANALYZE → DESIGN → SAFETY CHECK → BUILD & SHIP → SELL → GOVERN`

### Key Files
Located in `src/lib/mastermind/` (11 files). Central engine: `prompt-builder.ts` (`buildMastermindPrompt`).

### Weekly Cron
`mastermind-weekly` runs Mondays 2 PM UTC - sends "Weekly Board Meeting Minutes" email using full 7-step protocol via Claude Haiku.

---

## Daily Standup System

Automated daily system health report sent at 12 PM UTC.

**Pipeline:**
```
collect-metrics.ts → analyze.ts (AI/fallback) → format-email.ts → send
```

**Metrics Collected:**
- User growth and churn
- Scan/removal pipeline status
- Cron job health and failures
- Ticket health (open, stale, resolution time)
- Auto-resolve savings (autoFixed, aiResolved, aiCallsAvoided)
- Revenue and subscription metrics

**Location:** `src/lib/standup/`

---

## Cron Jobs

The platform runs **27 cron endpoints** with **39 schedule entries** in `vercel.json`. All crons have `maxDuration` set to prevent silent Vercel timeout deaths.

| Job | Schedule | maxDuration | Purpose |
|-----|----------|-------------|---------|
| Process Removals | Every 2h (12x daily) | 300s | Submit removal requests |
| Clear Pending Queue | Hourly | 60s | Clean stale queue items |
| Content Optimizer | Daily 3 AM UTC | 60s | Optimize page content |
| Link Checker | Daily 5 AM UTC | 60s | Find broken links |
| Email Monitor | Daily 5 AM UTC | 60s | Monitor email deliverability |
| Monitoring | Daily 6 AM UTC | 60s | Check for new exposures |
| Health Check | Daily 7 AM UTC | 300s | 24 system tests + auto-fix |
| Verify Removals | Daily 8 AM UTC | 300s | Verify completed removals |
| Reports | Monday 8 AM UTC | 60s | Send weekly reports |
| Follow-Up Reminders | Daily 9 AM UTC | 60s | 30/45 day follow-ups |
| Ticketing Agent | Daily 9 AM UTC | 300s | AI ticket resolution + auto-resolve |
| SEO Agent | 6x daily (every 4h) | 300s | Keyword research, site audits |
| Monthly Rescan | 1st of month 10 AM UTC | 60s | Trigger monthly scans |
| Free User Digest | Wednesday 10 AM UTC | 60s | Weekly digest for free users |
| Drip Campaigns | Daily 10 AM UTC | 60s | Send nurture emails |
| Removal Digest | Daily 10 AM UTC | 60s | Removal status digest |
| Close Resolved Tickets | Daily 11 AM UTC | 60s | Auto-close stale tickets |
| Daily Standup | Daily 12 PM UTC | 300s | Collect metrics + AI analysis + email |
| Mastermind Weekly | Monday 2 PM UTC | 300s | Board meeting minutes via AI |
| Sync Subscriptions | Daily | 60s | Stripe subscription sync |
| Security Scan | Daily | 60s | Security threat scanning |
| Dashboard Validation | Daily | 60s | Validate dashboard data integrity |
| Auto-Process Manual Queue | Daily | 60s | Process manual removal queue |
| Auto-Verify Fast Brokers | Daily | 60s | Quick verification for fast brokers |
| Cleanup Data Processors | Daily | 60s | Clean up stale data processors |
| Monthly Board | Monthly | 300s | Monthly strategic board report |
| Weekly Strategy | Weekly | 300s | Weekly strategy analysis |

### Health Check Tests (24)

| # | Test | Auto-Fix |
|---|------|----------|
| 1 | Database connection | No |
| 2 | User table schema | No |
| 3 | Orphaned profiles | Yes - deletes |
| 4 | Encryption system | No |
| 5 | Auth configuration | No |
| 6 | Email service (Resend) | No |
| 7 | Stripe configuration | No |
| 8 | HIBP API access | No |
| 9 | Stuck scans (>1h) | Yes - marks failed |
| 10 | Stuck removals (>24h) | Yes - resets to pending |
| 11 | Past due subscriptions | No |
| 12 | Admin configuration | No |
| 13 | Users without password | No |
| 14 | Expired subscriptions | No |
| 15 | Profile-user integrity | No |
| 16 | Scan-profile integrity | No |
| 17 | Exposure statistics | No |
| 18 | Removal request stats | No |
| 19 | Daily activity metrics | No |
| 20 | Ticket health (open/stale) | Yes - emits `ticket.stale` event |
| 21 | Critical cron monitoring | Yes - auto-retriggers dead crons |
| 22 | Stagnation detection | No |
| 23 | Data processor health | No |
| 24 | Agent execution health | No |

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────┐    ┌─────────────┐                   │
│   │   Edge      │    │  Serverless │                   │
│   │  Functions  │    │  Functions  │                   │
│   │             │    │             │                   │
│   │ - Middleware│    │ - API Routes│                   │
│   │ - OG Images │    │ - Auth      │                   │
│   │ - RSS Feed  │    │ - Webhooks  │                   │
│   └─────────────┘    └─────────────┘                   │
│                                                         │
│   ┌─────────────────────────────────┐                   │
│   │        Static Assets            │                   │
│   │  - HTML, CSS, JS                │                   │
│   │  - Images                       │                   │
│   │  - Blog posts (SSG)             │                   │
│   └─────────────────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     CLOUDFLARE                           │
├─────────────────────────────────────────────────────────┤
│   - DNS Management                                       │
│   - DDoS Protection                                      │
│   - SSL/TLS                                             │
│   - Caching                                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                            │
├─────────────────────────────────────────────────────────┤
│   - PostgreSQL Database                                  │
│   - Connection Pooling (PgBouncer)                      │
│   - Automatic Backups                                    │
│   - Row Level Security (available)                       │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Required
```
DATABASE_URL          # Supabase pooled connection
DIRECT_URL            # Supabase direct connection
AUTH_SECRET           # NextAuth JWT secret
AUTH_URL              # Production URL
ENCRYPTION_KEY        # PII encryption key
NEXT_PUBLIC_APP_URL   # Public app URL
```

### External Services
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID
RESEND_API_KEY
RESEND_FROM_EMAIL
HIBP_API_KEY
```

### Optional
```
ADMIN_EMAILS          # Admin bypass list
ADMIN_SECRET          # Admin authentication
```

---

## Performance Considerations

### Optimizations
- **Static Generation**: Marketing pages, blog posts
- **ISR**: Sitemap regeneration
- **Edge Runtime**: OG images, RSS feed
- **Connection Pooling**: PgBouncer for database
- **Caching**: Vercel edge cache, browser caching

### Monitoring
- Vercel Analytics (recommended)
- Sentry error tracking (recommended)
- Uptime monitoring (recommended)

---

## Future Architecture Plans

### Planned Improvements
1. **Queue System**: BullMQ + Redis for background jobs
2. **Real-time Updates**: WebSocket for scan progress
3. **API Gateway**: Rate limiting, API keys for Enterprise
4. **Multi-region**: Database replicas for latency
5. **Mobile App**: React Native with shared API

### Scalability Path
```
Current:  Vercel Serverless + Supabase
     ↓
Phase 2:  + Redis for queues/caching
     ↓
Phase 3:  + Dedicated workers for scanning
     ↓
Phase 4:  + Multi-region deployment
```

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
