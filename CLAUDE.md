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

### 5-Layer Organism Model
The organization is modeled as a living organism with 5 layers (defined in `src/lib/mastermind/org-structure.ts`):

| Layer | Name | Description |
|-------|------|-------------|
| 1 | **Nucleus** | 5 Architects: Huang (Vision), Hassabis (Systems), Buffett (Capital), Nadella (Culture), Amodei (Safety) |
| 2 | **Mission Teams** | 10 domain squads: Growth, Product, Commerce, Legal, Customer, Competitive Intel, Brand, Science, Global Strategy, Economics |
| 3 | **AI Agent Layer** | 24 AI agents mapped to mission domains, inspired by Wenfeng, Karpathy, LeCun, Ng |
| 4 | **Network Layer** | Expert network, creator partners, advisory circles (Cialdini, Adams, Weiss) |
| 5 | **Governance Mesh** | Ethics (Singer), AI Safety (Hinton, Amodei), Transparency (Dalio), Wisdom (Han, Bostrom, Cowen), Ombudsman (Zelenskyy) |

### 7-Step Decision Protocol
`MAP → ANALYZE → DESIGN → SAFETY CHECK → BUILD & SHIP → SELL → GOVERN`

Each step has assigned modern minds (see `src/lib/mastermind/decision-protocol.ts`).

### Agent-to-Mission Mapping
| Agent | Mission Domain | Key Minds |
|-------|---------------|-----------|
| removal-agent | legal-compliance | Clooney, Katyal, Voss |
| support-agent | customer-culture | Peterson, Van Edwards, Nadella |
| billing-agent | commerce-sales | Voss, Hormozi, Buffett |
| competitive-intel-agent | competitive-intel | Carlsen, Caruana, Dalio |
| growth-agent | growth-revenue | Hormozi, Brunson, Patel |
| content-agent | brand-media | MrBeast, Gary Vee, Patel |
| seo-agent | product-platform | Altman, Patel, Brunson |

### Invocation Commands
Quick-access commands for specific advisor perspectives:
- `Jensen lens` — Infrastructure/platform thinking
- `Hormozi offer` — Irresistible offer design
- `Voss mode` — Tactical empathy negotiation
- `Altman deploy` — Ship fast, iterate responsibly
- `Buffett test` — Circle of competence + front-page test
- `Carlsen intuition` — Pattern recognition beyond data
- `MrBeast scale` — Biggest possible version
- `Amodei safety` — What could go catastrophically wrong?
- `Board Meeting` — Full Nucleus deliberation (5 architects)
- `Modern Board Meeting` — Full analysis from 10+ minds
- See `src/lib/mastermind/invocations.ts` for all ~25 commands

### Key Files
```
src/lib/mastermind/
  advisors.ts        — ~75 modern + ~70 historical advisors
  org-structure.ts   — 5-layer organism model + mission mappings
  layers.ts          — 5 operating principle layers
  decision-protocol.ts — 7-step protocol
  invocations.ts     — ~25 invocation commands
  prompt-builder.ts  — Central prompt engine (buildMastermindPrompt)
  playbooks.ts       — Pre-built scenario combos
  business-context.ts — Static business data
  index.ts           — Barrel exports
```

### Usage Pattern
```typescript
import { buildMastermindPrompt, buildAgentMastermindPrompt } from "@/lib/mastermind";

// Full prompt for strategic queries
const prompt = buildMastermindPrompt({
  mission: "growth-revenue",
  protocol: ["MAP", "DESIGN", "SELL"],
  includeBusinessContext: true,
  scenario: "How to increase free-to-pro conversion?",
});

// Lightweight prompt for agent injection
const agentPrompt = buildAgentMastermindPrompt("legal-compliance", 3);
```

### Weekly Cron
- `mastermind-weekly` runs Mondays 9am ET (`0 14 * * 1` UTC)
- Sends "Weekly Board Meeting Minutes" email to rocky@ghostmydata.com
- Uses full 7-step protocol via Claude Haiku

### Admin Dashboard
- `/dashboard/mastermind` — Org chart + interactive advisor panel
- `POST /api/admin/mastermind` — AI-powered strategic advice (10/day limit)
