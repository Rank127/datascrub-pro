# GhostMyData TODO

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
- [ ] Create TEAM plan products in Stripe ($15/user/month, $180/user/year)
- [ ] Create BUSINESS plan products ($25/user/month, $300/user/year)
- [ ] Create ENTERPRISE plan products ($40/user/month, $480/user/year)
- [ ] Create EXECUTIVE add-on products ($199/person/month)
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

