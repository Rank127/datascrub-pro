# GhostMyData TODO

---

## Planning Documents

| Document | Description | Status |
|----------|-------------|--------|
| [corporate-plans.md](corporate-plans.md) | Corporate tier pricing, features, revenue projections | Ready to implement |
| [competitive-research-2026.md](competitive-research-2026.md) | Competitor analysis (Optery, DeleteMe, Incogni, etc.) | Complete |
| [executive-white-glove-analysis.md](executive-white-glove-analysis.md) | Human-assisted service pricing, staffing model | Awaiting decision |
| [mobile-app-planning.md](mobile-app-planning.md) | iOS/Android app (Expo), costs, feature roadmap | Awaiting decision |

---

## Priority Order

1. **Corporate Plans** - New revenue stream (4-6 weeks)
2. **Mobile App** - After corporate launch (8-12 weeks)
3. **Executive White-Glove** - When executive customers exist
4. **SMS Alerts** - When 10DLC approved

---

## Corporate Plans Implementation (Next Priority)

**Status:** Planning
**Reference:** [docs/corporate-plans.md](corporate-plans.md)

### Phase 1: Database Schema (Week 1)
- [ ] Create `Organization` model in Prisma schema
- [ ] Create `OrganizationMember` model with roles (ADMIN, MEMBER)
- [ ] Add `organizationId` to User model
- [ ] Create migration and deploy

### Phase 2: Stripe Products (Week 1)
- [ ] Create TEAM plan products in Stripe ($12/user/month, $144/user/year)
- [ ] Create BUSINESS plan products ($20/user/month, $240/user/year)
- [ ] Create ENTERPRISE plan products ($35/user/month, $420/user/year)
- [ ] Create EXECUTIVE add-on products ($149/person/month, $1,788/year)
- [ ] Add price IDs to environment variables

### Phase 3: Organization Management API (Week 2)
- [ ] `POST /api/organizations` - Create organization
- [ ] `GET /api/organizations/[id]` - Get organization details
- [ ] `PATCH /api/organizations/[id]` - Update organization
- [ ] `POST /api/organizations/[id]/members` - Invite member
- [ ] `DELETE /api/organizations/[id]/members/[userId]` - Remove member
- [ ] `PATCH /api/organizations/[id]/members/[userId]` - Update member role

### Phase 4: Corporate Dashboard (Week 2-3)
- [ ] `/dashboard/organization` - Organization overview
- [ ] Member management UI (invite, remove, role change)
- [ ] Seat usage tracking widget
- [ ] Billing management section
- [ ] Team exposure summary view

### Phase 5: Corporate Billing (Week 3)
- [ ] Per-seat billing logic in Stripe webhooks
- [ ] Seat quantity update handling
- [ ] Volume discount calculation
- [ ] Invoice generation for annual plans

### Phase 6: Corporate Features (Week 4)
- [ ] SSO/SAML integration (BUSINESS+)
- [ ] SCIM provisioning (ENTERPRISE)
- [ ] API key management (BUSINESS+)
- [ ] Compliance report generation (BUSINESS+)
- [ ] Bulk scan operations

### Phase 7: Corporate Onboarding (Week 4)
- [ ] `/corporate` landing page
- [ ] Self-service signup for TEAM tier
- [ ] Demo booking for BUSINESS/ENTERPRISE
- [ ] Domain verification for organization

---

## Mobile App (iOS + Android)

**Status:** Planning Complete
**Reference:** [docs/mobile-app-planning.md](mobile-app-planning.md)
**Start:** After Corporate Plans launch (Month 3-4)
**Technology:** Expo (React Native)
**Cost:** ~$1,400/year (Apple + Expo EAS)

### Pre-Development
- [ ] Register Apple Developer Account ($99/year)
- [ ] Register Google Play Developer Account ($25 one-time)
- [ ] Apply for D-U-N-S Number (if needed)
- [ ] Set up Expo account and EAS Build

### Phase 1: MVP (8-10 weeks)
- [ ] Authentication (email/password + biometric)
- [ ] Dashboard with protection score
- [ ] Exposures list and detail views
- [ ] Removals list and status tracking
- [ ] Push notifications (new exposures, removal complete)
- [ ] Settings and account info

### Phase 2: Enhanced Features (4-6 weeks)
- [ ] Initiate scan from mobile
- [ ] Dark web alert details
- [ ] Family member quick view
- [ ] iOS/Android widgets

### Phase 3: Corporate Mobile (4-6 weeks)
- [ ] Organization switcher
- [ ] Team dashboard (admin view)
- [ ] Member protection status
- [ ] Approve removal requests

---

## Executive White-Glove Service

**Status:** Awaiting Decision
**Reference:** [docs/executive-white-glove-analysis.md](executive-white-glove-analysis.md)

### Proposed Pricing (Option C - Recommended)
- EXECUTIVE INDIVIDUAL: $199/mo (~50% margin)
- EXECUTIVE FAMILY: $349/mo (~43% margin)
- EXECUTIVE COMPLETE: $499/mo (~34% margin)

### Implementation (When Ready)
- [ ] Decide on pricing tier structure
- [ ] Define family coverage policies
- [ ] Create SOP documentation for manual removals
- [ ] Hire first privacy specialist (offshore)
- [ ] Build internal dashboard for specialist workflow
- [ ] Create executive onboarding flow

---

## SMS Alerts - Full Implementation (Future)

**Status:** Deferred until more paid users

**Current State:**
- ✅ Phone verification works via Twilio Verify
- ✅ Enterprise users can add/verify phone numbers
- ✅ SMS preferences UI complete
- ⏸️ Transactional alerts disabled (needs A2P 10DLC)

**To Enable Full SMS Alerts:**
1. Upgrade Twilio account from trial to paid (~$20 initial funds)
2. Register brand for A2P 10DLC ($4/month)
3. Register campaign ($1.50/month)
4. Wait for approval (1-5 business days)
5. Alerts will auto-enable once approved

**Estimated Cost:** ~$6/month + ~$0.0079/SMS

**Trigger:** Enable when Enterprise user count reaches 10+

## Calendly Enterprise Demo Integration (Future)

**Status:** Deferred until Corporate Plan is built

**Features:**
- Embed "Book a Demo" for Enterprise leads
- Sales call scheduling
- Customer onboarding calls

**Trigger:** After Corporate Plan launch

---

## AI Support Chatbot & Smart Ticketing (Future)

**Status:** Deferred

**Features:**
- Claude/OpenAI powered support chatbot
- Auto-categorize tickets
- Smart response suggestions for agents
- Knowledge base integration

**Trigger:** When support volume increases

