# Architecture Planning: Frontend/Backend Split

**Date:** February 6, 2026
**Status:** Planning
**Priority:** High

---

## Problem Statement

The project is experiencing repeated issues that may stem from the current monolithic Next.js architecture. This document explores whether splitting into separate frontend and backend services would improve maintainability, reliability, and development velocity.

---

## Current Architecture

```
datascrub-pro-v2/
├── src/
│   ├── app/
│   │   ├── (admin)/        # Admin dashboard pages
│   │   ├── (auth)/         # Auth pages (login, register, etc.)
│   │   ├── (dashboard)/    # User dashboard pages
│   │   ├── (marketing)/    # Marketing/public pages
│   │   └── api/            # 80+ API routes
│   ├── components/         # React components
│   ├── lib/
│   │   ├── agents/         # AI agents (20+ agents)
│   │   ├── removers/       # Data broker removal logic
│   │   ├── scanners/       # Data broker scanners
│   │   ├── email/          # Email services
│   │   ├── stripe/         # Payment processing
│   │   └── ...
│   └── hooks/              # React hooks
├── prisma/                 # Database schema
├── scripts/                # Utility scripts (50+)
└── public/                 # Static assets
```

**Tech Stack:**
- Next.js 16 (App Router + Turbopack)
- React 19
- Prisma + PostgreSQL (Supabase)
- NextAuth.js
- Stripe
- Resend (email)
- 20+ AI agents

---

## Reported Issues (To Investigate)

| Issue Category | Examples | Root Cause? |
|----------------|----------|-------------|
| Repeat issues | TBD - need specifics | ? |
| State sync | ? | ? |
| API reliability | ? | ? |
| Deployment | ? | ? |
| Testing | ? | ? |
| Performance | ? | ? |

**ACTION NEEDED:** Document specific repeat issues before deciding on architecture.

---

## Architecture Options

### Option 1: Full Split (Separate Repositories)

```
ghostmydata-api/          # Backend API
├── src/
│   ├── routes/           # Express/Fastify routes
│   ├── services/         # Business logic
│   ├── agents/           # AI agents
│   ├── jobs/             # Background jobs
│   └── db/               # Prisma
└── Dockerfile

ghostmydata-web/          # Frontend
├── src/
│   ├── app/              # Next.js pages
│   ├── components/
│   └── hooks/
└── Dockerfile
```

**Pros:**
- Complete separation of concerns
- Independent deployment cycles
- Can scale API and frontend independently
- API reusable for mobile app
- Different teams can own each repo
- Can use best-in-class tools for each (e.g., NestJS for API)

**Cons:**
- Two repos to maintain
- Need API versioning strategy
- CORS configuration
- More complex local development
- Duplicate type definitions (or shared package)
- Authentication token management

**Best For:** Large teams, complex APIs, mobile app planned

---

### Option 2: Monorepo Split (Turborepo/Nx)

```
ghostmydata/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Express/Fastify backend
├── packages/
│   ├── shared/           # Shared types, utils
│   ├── database/         # Prisma client
│   └── ui/               # Shared components
└── turbo.json
```

**Pros:**
- Single repo, easier to manage
- Shared code between apps
- Atomic commits across frontend/backend
- Unified CI/CD
- Type safety across apps
- Easier refactoring

**Cons:**
- More complex build setup
- Still need to deploy separately
- Learning curve for Turborepo/Nx
- Can become unwieldy if not structured well

**Best For:** Medium teams, want separation but single repo

---

### Option 3: Keep Next.js, Restructure Internally

```
datascrub-pro-v2/
├── src/
│   ├── app/
│   │   ├── (pages)/      # All pages
│   │   └── api/          # Thin API layer
│   ├── server/           # Backend logic (NEW)
│   │   ├── services/     # Business logic
│   │   ├── agents/       # AI agents
│   │   ├── jobs/         # Background processors
│   │   └── repositories/ # Data access
│   ├── client/           # Frontend logic (NEW)
│   │   ├── components/
│   │   ├── hooks/
│   │   └── stores/
│   └── shared/           # Shared types/utils
└── prisma/
```

**Pros:**
- Minimal disruption
- No new infrastructure
- Keep Next.js benefits (SSR, API routes, etc.)
- Single deployment
- Faster iteration

**Cons:**
- Still coupled at deployment level
- Can't scale independently
- May not solve fundamental issues
- Discipline required to maintain boundaries

**Best For:** Small teams, want quick improvement, not ready for full split

---

### Option 4: Backend-for-Frontend (BFF) Pattern

```
                    ┌─────────────┐
                    │  Next.js    │
                    │  (Frontend) │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Core API │ │ Agent    │ │ Scanner  │
        │ Service  │ │ Service  │ │ Service  │
        └──────────┘ └──────────┘ └──────────┘
```

**Pros:**
- Microservices for heavy workloads
- Can scale agents/scanners independently
- Core API remains simple
- Gradual migration path

**Cons:**
- Most complex architecture
- Service discovery needed
- Distributed tracing required
- Overkill for current scale?

**Best For:** High scale, specific bottlenecks identified

---

## Decision Criteria

| Criteria | Weight | Option 1 | Option 2 | Option 3 | Option 4 |
|----------|--------|----------|----------|----------|----------|
| Development speed | High | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| Maintainability | High | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Scalability | Medium | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Team size fit | High | Large | Medium | Small | Large |
| Mobile app ready | High | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Migration effort | Medium | High | Medium | Low | Very High |
| Infrastructure cost | Low | Higher | Same | Same | Higher |

---

## Questions to Answer Before Deciding

### 1. What are the specific repeat issues?
- [ ] List top 5 recurring bugs/problems
- [ ] Identify patterns (all API? all frontend? specific features?)
- [ ] Determine if issues are architectural or code quality

### 2. What's the team situation?
- [ ] Current team size
- [ ] Plans to grow team
- [ ] Skill distribution (frontend vs backend)

### 3. What are the scaling requirements?
- [ ] Current user count
- [ ] Projected growth
- [ ] Which components are bottlenecks (scanners? agents? API?)

### 4. Mobile app timeline?
- [ ] When is mobile app needed?
- [ ] Will it share authentication?
- [ ] Which API endpoints does it need?

### 5. Deployment concerns?
- [ ] Current deployment pain points
- [ ] Downtime during deploys?
- [ ] Rollback issues?

---

## Recommended Approach

### Phase 1: Investigate (1-2 days)
1. Document all repeat issues with root causes
2. Identify if issues are truly architectural
3. Review current pain points with deployment/testing

### Phase 2: Quick Wins (1 week)
1. Implement Option 3 (restructure internally)
2. Create clear `server/` and `client/` boundaries
3. Add service layer between API routes and business logic
4. Improve error handling and logging

### Phase 3: Evaluate (2 weeks)
1. See if restructure solves issues
2. If not, plan full split (Option 2: Monorepo)
3. Start with API extraction for mobile app

### Phase 4: Split if Needed (4-6 weeks)
1. Set up Turborepo monorepo
2. Extract API to separate app
3. Share types/database via packages
4. Update deployment pipeline

---

## Mobile App Considerations

The mobile app (React Native/Expo) is already planned. This affects the architecture decision:

| Approach | Mobile App Impact |
|----------|-------------------|
| Keep Next.js API routes | Works but not ideal - mixed with SSR logic |
| Separate API | Clean REST/GraphQL API for mobile |
| Monorepo | Can share types with mobile app too |

**Recommendation:** If mobile app is priority, lean toward Option 2 (Monorepo) with:
```
ghostmydata/
├── apps/
│   ├── web/          # Next.js
│   ├── api/          # Backend API
│   └── mobile/       # React Native
├── packages/
│   ├── api-client/   # Shared API client
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
```

---

## Next Steps

1. **Document repeat issues** - What specifically keeps breaking?
2. **Review this document** when back online
3. **Choose approach** based on answers to questions above
4. **Create implementation plan** with timeline

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Project Structure](https://nextjs.org/docs/app/building-your-application)
- [Nx Monorepo](https://nx.dev/)
- [Backend-for-Frontend Pattern](https://samnewman.io/patterns/architectural/bff/)

---

*Created: February 6, 2026*
*Last Updated: February 6, 2026*
