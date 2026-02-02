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
       └────────▶│    Alert     │
                 ├──────────────┤
                 │ id           │
                 │ userId       │
                 │ type         │
                 │ title        │
                 │ message      │
                 │ read         │
                 └──────────────┘
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

## Cron Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| Health Check | Daily 7 AM UTC | System validation |
| Monitoring | Daily 6 AM UTC | Check for new exposures |
| Reports | Monday 8 AM UTC | Send weekly reports |
| SEO Agent | Every 4 hours | Keyword research, site audits |
| Process Removals | 6x daily (2,6,10,14,18,22 UTC) | Submit removal requests |
| Verify Removals | Daily 8 AM UTC | Verify completed removals |
| Drip Campaigns | Daily 10 AM UTC | Send nurture emails |
| Content Optimizer | Daily 3 AM UTC | Optimize page content |
| Link Checker | Daily 5 AM UTC | Find broken links |
| Ticketing Agent | Daily 9 AM UTC | AI ticket resolution |
| Free User Digest | Wednesday 10 AM UTC | Weekly digest for free users |
| Close Resolved Tickets | Daily 11 AM UTC | Auto-close stale tickets |
| Monthly Rescan | 1st of month 10 AM UTC | Trigger monthly scans |
| Clear Pending Queue | Hourly | Clean stale queue items |

### Health Check Tests
- Database connectivity
- Encryption system
- Auth configuration
- Email service (Resend)
- Stripe configuration
- HIBP API access
- Stuck scans detection
- Admin configuration

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
