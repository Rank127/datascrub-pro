# GhostMyData — TODO & Roadmap

*Last Updated: February 13, 2026 | v1.31.0*

---

## Recently Completed (v1.30.0–v1.31.0, February 2026)

| Feature | Description | Version |
|---------|-------------|---------|
| 24 AI Agents | Full agent fleet across 8 domains | 1.30.0 |
| 27 Cron Jobs | All with `maxDuration`, time-boxing, auto-retrigger | 1.30.0 |
| Auto-Remediation | Health check auto-fixes, Remediation Engine v2 | 1.30.0 |
| Operations Agent `detect-anomalies` | Silent cron death detection + auto-retrigger | 1.30.0 |
| Ticketing Agent Self-Healing | `tryAutoResolve()`, stale detection, escalation cooldown | 1.30.0 |
| Daily Standup | Metrics collection + AI analysis + email report | 1.30.0 |
| Mastermind Advisory | 75+ advisors, 5-layer model, 7-step protocol, weekly cron | 1.30.0 |
| Dashboard Cron/SLA Widgets | Real-time cron health + ticket SLA in Operations tab | 1.31.0 |
| Remediation Engine v2 | Event-driven rules for `cron.*`, `ticket.*` patterns | 1.31.0 |

### Previously Completed (v1.25.0–v1.29.3)

| Feature | Status |
|---------|--------|
| Exit-Intent Popup (50% off) | ✅ Live |
| Social Proof Notifications | ✅ Live |
| Live Chat Widget (Crisp) | ✅ Live |
| Countdown Timer | ✅ Live |
| Retargeting Pixels (FB + Google) | ✅ Live |
| Email Drip Campaigns (5-email, 14 days) | ✅ Live |
| Referral Program (Give $10, Get $10) | ✅ Live |
| Privacy Score Quiz (/privacy-score) | ✅ Live |
| SEO Agent (6x daily, 579+ keywords) | ✅ Live |
| Content Optimizer | ✅ Live |
| Link Checker | ✅ Live |
| AI Shield (60 sources, 5 categories) | ✅ Live |
| Custom Removals (Enterprise, 10/mo) | ✅ Live |
| Family Plans (up to 5 members) | ✅ Live |
| Dark Web Monitoring (365 sources) | ✅ Live |
| 2,100+ Data Sources (92 categories) | ✅ Live |
| Data Broker Removal Guides (11 pages) | ✅ Live |
| Admin Executive Dashboard (6 tabs) | ✅ Live |
| Support Ticketing System | ✅ Live |
| Standalone Admin Portal (/admin) | ✅ Live |

---

## Planning Documents

| Document | Description | Status |
|----------|-------------|--------|
| [corporate-plans.md](corporate-plans.md) | Corporate tier pricing, features, revenue projections | Ready to implement |
| [competitive-research-2026.md](competitive-research-2026.md) | Competitor analysis (Optery, DeleteMe, Incogni, etc.) | Complete |
| [executive-white-glove-analysis.md](executive-white-glove-analysis.md) | Human-assisted service pricing, staffing model | Awaiting decision |
| [mobile-app-planning.md](mobile-app-planning.md) | iOS/Android app (Expo), costs, feature roadmap | Ready to start |
| [mobile-app-technical-spec.md](mobile-app-technical-spec.md) | Full technical spec, legal, compliance, infrastructure | Ready to start |

---

## Active Priorities

### Corporate Plans Implementation

**Status:** Planning
**Reference:** [docs/corporate-plans.md](corporate-plans.md)

#### Phase 1: Database Schema
- [ ] Create `Organization` model in Prisma schema
- [ ] Create `OrganizationMember` model with roles (ADMIN, MEMBER)
- [ ] Add `organizationId` to User model
- [ ] Create migration and deploy

#### Phase 2: Stripe Products
- [ ] Create TEAM plan products ($12/user/month, $144/user/year)
- [ ] Create BUSINESS plan products ($20/user/month, $240/user/year)
- [ ] Create ENTERPRISE plan products ($35/user/month, $420/user/year)
- [ ] Create EXECUTIVE add-on products ($149/person/month, $1,788/year)
- [ ] Add price IDs to environment variables

#### Phase 3: Organization Management API
- [ ] `POST /api/organizations` — Create organization
- [ ] `GET /api/organizations/[id]` — Get details
- [ ] `PATCH /api/organizations/[id]` — Update
- [ ] `POST /api/organizations/[id]/members` — Invite member
- [ ] `DELETE /api/organizations/[id]/members/[userId]` — Remove member
- [ ] `PATCH /api/organizations/[id]/members/[userId]` — Update role

#### Phase 4: Corporate Dashboard
- [ ] `/dashboard/organization` — Organization overview
- [ ] Member management UI (invite, remove, role change)
- [ ] Seat usage tracking widget
- [ ] Billing management section
- [ ] Team exposure summary view

#### Phase 5: Corporate Billing
- [ ] Per-seat billing logic in Stripe webhooks
- [ ] Seat quantity update handling
- [ ] Volume discount calculation
- [ ] Invoice generation for annual plans

#### Phase 6: Corporate Features
- [ ] SSO/SAML integration (BUSINESS+)
- [ ] SCIM provisioning (ENTERPRISE)
- [ ] API key management (BUSINESS+)
- [ ] Compliance report generation (BUSINESS+)
- [ ] Bulk scan operations

#### Phase 7: Corporate Onboarding
- [ ] `/corporate` landing page
- [ ] Self-service signup for TEAM tier
- [ ] Demo booking for BUSINESS/ENTERPRISE
- [ ] Domain verification for organization

---

### Mobile App (iOS + Android)

**Status:** Project Created — Ready to Start
**Repository:** https://github.com/Rank127/ghostmydata-mobile
**Reference:** [mobile-app-planning.md](mobile-app-planning.md) | [mobile-app-technical-spec.md](mobile-app-technical-spec.md)
**Technology:** Expo SDK 54 (React Native + TypeScript)
**Cost:** ~$1,400/year (Apple + Expo EAS)

#### Pre-Development
- [ ] Register Apple Developer Account ($99/year)
- [ ] Register Google Play Developer Account ($25 one-time)
- [ ] Apply for D-U-N-S Number (if needed)
- [ ] Set up Expo account and EAS Build

#### Phase 1: MVP (8-10 weeks)
- [ ] Authentication (email/password + biometric)
- [ ] Dashboard with protection score
- [ ] Exposures list and detail views
- [ ] Removals list and status tracking
- [ ] Push notifications (new exposures, removal complete)
- [ ] Settings and account info

#### Phase 2: Enhanced Features (4-6 weeks)
- [ ] Initiate scan from mobile
- [ ] Dark web alert details
- [ ] Family member quick view
- [ ] iOS/Android widgets

#### Phase 3: Corporate Mobile (4-6 weeks)
- [ ] Organization switcher
- [ ] Team dashboard (admin view)
- [ ] Member protection status
- [ ] Approve removal requests

---

### Executive White-Glove Service

**Status:** Awaiting Decision
**Reference:** [executive-white-glove-analysis.md](executive-white-glove-analysis.md)

**Proposed Pricing (Option C):**
- EXECUTIVE INDIVIDUAL: $199/mo (~50% margin)
- EXECUTIVE FAMILY: $349/mo (~43% margin)
- EXECUTIVE COMPLETE: $499/mo (~34% margin)

#### Implementation (When Ready)
- [ ] Decide on pricing tier structure
- [ ] Define family coverage policies
- [ ] Create SOP documentation for manual removals
- [ ] Hire first privacy specialist (offshore)
- [ ] Build internal dashboard for specialist workflow
- [ ] Create executive onboarding flow

---

## Deferred Features

### SMS Alerts
**Status:** Deferred until more paid users

- ✅ Phone verification works via Twilio Verify
- ✅ Enterprise users can add/verify phone numbers
- ✅ SMS preferences UI complete
- ⏸️ Transactional alerts disabled (needs A2P 10DLC)

**To Enable:** Upgrade Twilio ($20), register 10DLC brand ($4/mo) + campaign ($1.50/mo), wait 1-5 days.
**Trigger:** Enable when Enterprise user count reaches 10+

### Browser Automation for Form Opt-Outs
**Status:** Code ready, requires BROWSERLESS_API_KEY
**Cost:** ~$50/month for 10,000 sessions
**File:** `src/lib/removers/browser-automation.ts`

### Calendly Enterprise Demo Integration
**Status:** Deferred until Corporate Plan is built

### Browser Extension (Chrome/Firefox)
**Status:** Deferred
- Warn when visiting data collection sites
- One-click opt-out
- Auto-fill opt-out forms

---

## Future Roadmap (Q2-Q4 2026)

### Q2 2026 — Revenue Infrastructure
| Feature | Priority | Effort |
|---------|----------|--------|
| Corporate Plans launch | HIGH | 6 weeks |
| Mobile App MVP | HIGH | 8-10 weeks |
| Image/Photo reverse search | MEDIUM | 2-3 weeks |
| Credit monitoring integration | MEDIUM | 6-8 weeks |

### Q3-Q4 2026 — Scale
| Feature | Priority | Effort |
|---------|----------|--------|
| Public API for B2B | MEDIUM | 3-4 weeks |
| International coverage (UK, EU) | MEDIUM | 6-8 weeks/region |
| Legal document generation (C&D, CCPA demands) | LOW | 4-5 weeks |
| SSO/Enterprise auth (SAML/OIDC, SCIM) | LOW | 4-6 weeks |

### Technical Debt & Infrastructure
- [ ] Redis caching layer for frequent queries
- [ ] SOC 2 Type II certification
- [ ] Penetration testing
- [ ] Sentry error tracking
- [ ] Log aggregation (LogTail/Papertrail)
- [ ] Comprehensive E2E test suite
- [ ] Load testing infrastructure

### Integration Wishlist

| Service | Purpose | Priority | Status |
|---------|---------|----------|--------|
| Browserless.io | Form automation | MEDIUM | Code ready, needs key |
| TinEye | Image search | MEDIUM | Researching |
| Stripe Connect | Affiliate payouts | LOW | Future |
| Plaid | Identity verification | LOW | Future |

---

## Competitive Differentiators (Current)

- **2,100+ data sources** (most in industry, vs Optery ~615, DeleteMe ~750)
- **24 AI agents** across 8 domains with auto-remediation
- **60 AI Shield sources** (facial recognition, voice cloning, deepfake defense)
- **365 dark web monitoring sources**
- **Self-healing infrastructure** (27 crons with maxDuration, anomaly detection, auto-retrigger)
- **Family plans** (up to 5 members, Enterprise)
- **Breach database integration** (HIBP + LeakCheck)
- **Automated verification** via re-scanning
- **Mastermind Advisory System** (75+ strategic advisors)
