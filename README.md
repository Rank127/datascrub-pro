# GhostMyData

Personal data removal service that helps users find and remove their personal information from data brokers, breach databases, dark web, and social media.

**Live Site:** https://ghostmydata.com

## Features

### Core Functionality
- **Data Discovery**: Scan 70+ data sources for personal information exposure
  - 58 data brokers (Spokeo, WhitePages, BeenVerified, etc.)
  - 2 breach databases (HaveIBeenPwned, LeakCheck)
  - 10 social media platforms
- **Automated Removal**: Submit opt-out requests to data brokers automatically
- **Manual Action Tracking**: Track and manage exposures requiring user intervention
  - Filter by action status (pending, done)
  - Mark actions as complete with one click
  - Direct links to opt-out forms
- **Breach Monitoring**: HaveIBeenPwned + LeakCheck API integration for breach detection
- **Dark Web Monitoring**: Monitor dark web marketplaces and forums (Enterprise)
- **Whitelist Management**: Keep accounts you want, remove the rest
- **Continuous Monitoring**: Daily/weekly scans with email alerts

### User Features
- Secure profile with encrypted PII storage (AES-256)
- Risk score and exposure dashboard
- Removal request tracking
- Monthly privacy reports
- Email notifications for new exposures

### Business Features
- Stripe subscription billing
- 30-day money-back guarantee
- Automated refund processing
- Customer portal for subscription management

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Payments**: Stripe
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui
- **Hosting**: Vercel

## Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 1 scan/month, manual removal guides |
| Pro | $11.99/mo | 10 scans/month, automated removals, weekly monitoring |
| Enterprise | $29.00/mo | Unlimited scans, dark web monitoring, family plan (5 profiles) |

## Project Structure

```
src/
├── app/
│   ├── (marketing)/      # Public pages (landing, pricing, blog)
│   ├── (auth)/           # Login, register, password reset
│   ├── (dashboard)/      # User dashboard
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn components
│   ├── dashboard/        # Dashboard components
│   └── seo/              # Structured data components
├── lib/
│   ├── db/               # Prisma client
│   ├── auth/             # NextAuth config
│   ├── email/            # Email templates
│   ├── encryption/       # PII encryption
│   ├── scanners/         # Data source integrations
│   └── stripe/           # Stripe utilities
└── content/              # Blog posts, templates
```

## SEO Features

- Dynamic sitemap generation (`/sitemap.xml`)
- RSS feed for blog (`/feed.xml`)
- Dynamic Open Graph images (`/og/[slug].png`)
- Structured data schemas:
  - Organization
  - WebSite with search
  - FAQ schema
  - BlogPosting schema
  - Product/Pricing schema
- Optimized metadata for all pages

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Stripe account
- Resend account

### Installation

```bash
# Clone the repository
git clone https://github.com/Rank127/datascrub-pro.git
cd datascrub-pro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

See `DEPLOYMENT.md` for full list of required environment variables.

## Documentation

- `DEPLOYMENT.md` - Production deployment guide
- `DEPLOY.md` - Quick start deployment
- `OPERATIONS_GUIDE.md` - Full operations manual
- `docs/REFUND_GUIDE.md` - Refund processing procedures
- `docs/UAT-TESTING-PLAN.md` - Testing checklist

## Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or push to master/main branch for auto-deploy
git push origin master
```

## API Endpoints

### Public
- `GET /api/auth/[...nextauth]` - Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset

### Protected (requires auth)
- `GET/PUT /api/profile` - User profile
- `POST /api/scan/start` - Start scan
- `GET /api/scan/status` - Scan status
- `GET /api/exposures` - List exposures (with filters)
- `PATCH /api/exposures` - Update exposure (whitelist, mark done)
- `POST /api/whitelist` - Manage whitelist
- `POST /api/removals/request` - Request removal
- `GET /api/removals/status` - Removal request status
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/subscription` - Subscription info

### Webhooks
- `POST /api/stripe/webhook` - Stripe events

### Cron Jobs
- `GET /api/cron/monitoring` - Daily exposure checks
- `GET /api/cron/reports` - Weekly email reports
- `GET /api/cron/health-check` - System health check

## License

Proprietary - All rights reserved

## Support

- Email: support@ghostmydata.com
- Security: security@ghostmydata.com
