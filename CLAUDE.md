# CLAUDE.md — Project Context for Claude Code

## Project Overview
- **App**: GhostMyData / DataScrub Pro v2 — data privacy platform
- **Stack**: Next.js, Prisma ORM, PostgreSQL, Vercel hosting
- **Repo**: https://github.com/Rank127/datascrub-pro.git (HTTPS, not SSH)
- **Deploy**: Push to `main` triggers Vercel build (~2min)

## Git Setup
- SSH keys not configured on this machine; always use HTTPS remote URL
- Remote origin: `https://github.com/Rank127/datascrub-pro.git`

## Safety Mechanisms (Feb 2026)
- **Issue Deduplication**: Remediation engine skips duplicate issues (same `type:affectedResource`) within 30-minute window
- **Circuit Breaker**: After 3 failed remediation attempts for same fingerprint within 6 hours, state flips to OPEN (skips remediation, emits escalation). Auto-resets after 6h inactivity.
- **Event Deduplication**: Event bus deduplicates publish calls via hash-based fingerprinting (10-minute TTL)
- **Retrigger Rate Limiting**: Max 3 auto-retriggers per cron per 24 hours. Tracked via CronLog `status='RETRIGGER'`. Applied in both health-check and operations-agent `detect-anomalies`.
- **Cascading Fix Cooldown**: 500ms delay after database-modifying health check tests (3, 9, 10) to prevent read-after-write races
- **Directive Bounds**: `DIRECTIVE_BOUNDS` map in `directives.ts` clamps all numeric directives to safe ranges before DB write. `removal_rate_per_broker` min=5 (NEVER zero). Logged as warnings when clamped.

## Removal Pipeline UX (Feb 2026)
- **3-Category Status Mapping**: 8 internal statuses mapped to 3 user-facing categories via `src/lib/removals/user-status.ts`:
  - `in_progress` = PENDING, SUBMITTED, IN_PROGRESS, REQUIRES_MANUAL, FAILED
  - `completed` = COMPLETED
  - `monitoring` = ACKNOWLEDGED, SKIPPED
- **ETA Display**: Calculated from `submittedAt` + broker's `estimatedDays`, shown on in-progress items
- **URL Corrections**: Shared registry at `src/lib/removals/url-corrections.ts`, applied at runtime in `getDataBrokerInfo()`
- **REQUIRES_MANUAL Handling**: `clear-pending-queue` creates internal support tickets via `createRemovalFailedTicket()` — users never see this status
- **Admin URL Corrections**: `POST /api/admin/url-corrections` validates new URLs and generates code snippets
- **Link Checker Enhanced**: Auto-applies corrections, tries pattern variations for unknown broken links, includes suggestions in reports

## Consolidated Daily Privacy Digest (Feb 2026)
All user-facing exposure + removal emails are queued to `EmailQueue` and sent as ONE consolidated email per user at 10AM UTC.

- **Queue functions** (in `src/lib/email/index.ts`): `queueExposureAlert()`, `queueBulkRemovalSummary()`, `queueMonthlyRecap()`, `queueRemovalDigest()` — each checks user preferences before queueing
- **Processor**: `processConsolidatedDigests()` — handles 5 queue types: `REMOVAL_STATUS_PENDING`, `EXPOSURE_ALERT_PENDING`, `BULK_REMOVAL_PENDING`, `MONTHLY_RECAP_PENDING`, `REMOVAL_DIGEST_PENDING`
- **Cron**: `consolidated-digest` at route `/api/cron/removal-digest`, schedule `0 10 * * *`
- **Timing**: Events queue throughout day → reports cron queues monthly at 8AM → digest cron sends at 10AM
- **NOT consolidated** (separate paths): drip campaigns, follow-up reminders, rescan reminders, milestone emails, free-user digest, weekly reports
- **Security**: `escapeHtml()` on all user-supplied data; failed sends marked FAILED to prevent duplicates
- **Important**: When adding new user-facing email sends, use `queueExposureAlert/queueBulkRemovalSummary/queueRemovalDigest/queueMonthlyRecap` instead of sending directly — this ensures consolidation into the daily digest

## Mastermind Pipeline Context (Feb 2026)
- **Formatted Metrics**: `formatMetricsWithContext()` replaces raw `JSON.stringify()` — includes status definitions, expected ranges, pipeline health
- **Directive Constraints**: System prompt includes hard bounds and "NEVER set removal_rate_per_broker below 5"
- **Competitive Intelligence**: `business-context.ts` includes detailed competitor analysis (Incogni, DeleteMe, Optery, Kanary)
- **`statusContext` in metrics**: `pipelineHealth`, `pendingExplanation`, `submittedExplanation`, `completionRate`

## Ops Visibility (Admin Dashboard)
The Operations tab (`/dashboard/executive?tab=operations`) includes:
- **Agent Performance Widget** — execution count, cost, active/degraded/failed agents from `AgentHealth` table
- **Broker Intelligence Widget** — top 5 / worst 5 brokers by success rate from `BrokerIntelligence` table
- **Auto-Remediation Savings** — autoFixed, aiCallsAvoided counts from ticketing-agent CronLog metadata
- **Queue Velocity** — items processed per hour, 24h/7d totals from removal requests + cron runs

## Architecture: Admin Dashboard
The admin dashboard has 6+ independent sections, each with its own user table and API calls:
- `src/components/dashboard/executive/user-management-section.tsx` — User Management tab (uses `/api/admin/users`)
- `src/components/dashboard/executive/user-activities-section.tsx` — Activities tab (uses `/api/admin/executive-stats`)
- `src/components/dashboard/executive/operations-section.tsx` — Operations tab (uses `/api/admin/users`)
- `src/components/dashboard/executive/finance-section.tsx` — Finance tab (uses `/api/admin/users`)
- `src/components/dashboard/integrations/database-section.tsx` — Database tab (uses `/api/admin/integrations/database/users`)

**Important**: When modifying user plan display or any user-level field, check ALL sections — a fix to one component does not apply to the others.

## Family Plan System
- `FamilyGroup` has one owner (Enterprise subscriber), up to 5 members
- `FamilyMember` record links user to group (created on invite acceptance)
- `FamilyInvitation` has 7-day expiry, status: PENDING/ACCEPTED/EXPIRED/CANCELLED
- Users inherit ENTERPRISE plan through family membership. Raw `user.plan` in DB may be FREE while effective plan is ENTERPRISE.
- Always use `effectivePlan` when displaying plan info (never raw `user.plan` alone)

### API Endpoints Returning Plan Data
- `/api/admin/users` — returns both `plan` and `effectivePlan` (with `planSource`, `familyOwner`, `familyGroupInfo`)
- `/api/admin/executive-stats` — overwrites `plan` field directly with effective value via `calculateEffectivePlan()`
- `/api/admin/integrations/database/users` — returns both `plan` and `effectivePlan`

### Known Issue (Fixed Feb 2026)
Invite acceptance can silently fail, leaving invitation PENDING with no FamilyMember record. When debugging family plan issues, always check both the invitation status AND the familyMembership record in the database.

## Key Users (Production)
- **Family Owner**: sandeepgupta@bellsouth.net (Sandeep Gupta) — ENTERPRISE
- **Family Members**: sgmgsg@hotmail.com (Manisha Gupta), suhanigupta97@gmail.com (Suhani Gupta)

---

## Mastermind Advisory System

### 19 Categories | 240+ Minds | 10 Layers | 11-Step Protocol | 45+ Invocations

### Corporate Org Structure (Board + C-Suite + 14 Divisions)
Defined in `src/lib/mastermind/org-structure.ts`:

| Tier | Name | Key Roles |
|------|------|-----------|
| **Board** | Board of Directors (5) | Buffett (Chairman), Dalio (Vice Chairman), Cialdini (Behavioral Science), Fishkin (Sustainable Growth), Marcus Aurelius (Decision Discipline — framework) |
| **C-Suite** | Executive Team (16) | Huang (CEO), Nadella (President/COO), Altman (CPO), Hassabis (CTO), Amodei (CSO), Cook (COO), Hormozi (CRO), Clooney (GC), Hypponen (CISO), Ive (CDO), King (Relevance), Miessler (AI-Security), Hightower (Performance) |
| **Divisions** | 14 Divisions (160+ minds) | AI R&D, Science, Capital & Trading, Product & Design, Commerce & Sales, SEO & Organic Growth, Security & AI Defense, Infrastructure, Academy, Behavior Lab, Legal, Economics, Brand & Attention, Global Strategy |

### 11-Step Decision Protocol
`MAP → ANALYZE → DESIGN OFFER → DESIGN EXPERIENCE → SAFETY CHECK → BUILD & SHIP → GROW ORGANICALLY → SELL → OPTIMIZE → PROTECT → GOVERN`

Each step has assigned advisors (see `src/lib/mastermind/decision-protocol.ts`).

### 10 Thinking Layers
Strategic, Execution, Technology, Commercial, Human, Wisdom, SEO & Growth, Design, Infrastructure, Security (see `src/lib/mastermind/layers.ts`).

### Agent-to-Mission Mapping
| Agent | Mission Domain | Key Minds |
|-------|---------------|-----------|
| removal-agent | legal-compliance | Clooney, Katyal, Voss |
| support-agent | behavior-lab | Kahneman, Fogg, Duckworth |
| billing-agent | commerce-sales | Voss, Hormozi, Brunson |
| competitive-intel-agent | global-strategy | Carlsen, Sun Tzu, Nadella |
| growth-agent | commerce-sales | Hormozi, Brunson, Patel |
| content-agent | brand-attention | MrBeast, Gary Vee, Rogan |
| seo-agent | seo-organic-growth | Fishkin, King, Patel |

### 45+ Invocation Commands
Quick-access commands for specific advisor perspectives:
- `Jensen lens` — Infrastructure/platform thinking
- `Hormozi offer` — Irresistible offer design
- `Voss mode` — Tactical empathy negotiation
- `Fishkin growth` — Bootstrapped organic growth
- `King relevance` — AI search optimization
- `Miessler augment` — AI-security integration
- `Hightower simplify` — Infrastructure audit
- `Board Meeting` — Full Board deliberation (14+ minds)
- `Modern Board Meeting` — Full analysis from 12+ living minds
- `Growth War Room` — Revenue + SEO sprint (Hormozi, Fishkin, King, Patel, MrBeast)
- `Security War Room` — Full security assessment (Hypponen, Miessler, Schneier, Mitnick, Tabriz)
- `Design Sprint` — Product design review (Ive, Rams, Jobs, Ingels, Maeda)
- See `src/lib/mastermind/invocations.ts` for all 45+ commands

### 12 Playbooks
Pre-built scenario combos: pricing_review, content_strategy, seo_growth, legal_response, security_audit, churn_prevention, growth_stalling, competitive_threat, design_sprint, pre_mortem, weekly_strategic, infrastructure_review.

### 6 Decision Frameworks
Pure computational functions used by agents: `hormoziValueScore`, `carlsenPositionalScore`, `vossEmpathyScore`, `dalioRiskAssessment`, `mrbeastRemarkabilityScore`, `buffettCompetenceCheck` (see `src/lib/mastermind/frameworks.ts`).

### 8-Section Response Format
1. LANDSCAPE (Sun Tzu + Huang + Nadella)
2. ANALYSIS (Dalio + Acemoglu + Cowen + Einstein)
3. OFFER/SOLUTION (Hormozi + Altman + Brunson + Ive)
4. SEO & GROWTH (Fishkin + King + Patel)
5. ACTION PLAN
6. SECURITY & INFRASTRUCTURE (Miessler + Schneier + Hightower)
7. RISKS & BLIND SPOTS (Munger + Amodei + Feynman + Mitnick)
8. GOVERNANCE CHECK (Buffett + Marcus Aurelius + Socrates + Clooney)

### Key Files
```
src/lib/mastermind/
  advisors.ts          — ~84 modern + ~82 historical advisors (19 categories)
  org-structure.ts     — Board + C-Suite + 14 Divisions
  layers.ts            — 10 thinking layers with frameworks
  decision-protocol.ts — 11-step protocol
  invocations.ts       — 45+ invocation commands
  prompt-builder.ts    — Central prompt engine (buildMastermindPrompt)
  playbooks.ts         — 12 pre-built scenario combos
  frameworks.ts        — 6 computational decision frameworks
  directives.ts        — Strategic directive read/write/cache
  business-context.ts  — Static business data
  index.ts             — Barrel exports
```

### Usage Pattern
```typescript
import { buildMastermindPrompt, buildAgentMastermindPrompt } from "@/lib/mastermind";

// Full prompt for strategic queries
const prompt = buildMastermindPrompt({
  mission: "commerce-sales",
  protocol: ["MAP", "DESIGN_OFFER", "SELL"],
  includeBusinessContext: true,
  scenario: "How to increase free-to-pro conversion?",
});

// Lightweight prompt for agent injection
const agentPrompt = buildAgentMastermindPrompt("legal-compliance", 3);
```

### Weekly Cron
- `mastermind-weekly` runs Mondays 9am ET (`0 14 * * 1` UTC)
- Sends "Weekly Board Meeting Minutes" email to rocky@ghostmydata.com
- Uses full 11-step protocol via Claude Haiku
- Generates strategic directives that adjust agent thresholds

### Admin Dashboard
- `/dashboard/mastermind` — Org chart + interactive advisor panel
- `POST /api/admin/mastermind` — AI-powered strategic advice (10/day limit)
