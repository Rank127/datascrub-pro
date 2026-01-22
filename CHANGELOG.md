# Changelog

All notable changes to GhostMyData are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Two-factor authentication (2FA)
- Real dark web scanner integrations
- Mobile app (React Native)
- API access for Enterprise users
- Additional data broker integrations

---

## [1.2.0] - 2026-01-21

### Added
- **SEO Optimizations**
  - RSS feed at `/feed.xml` for blog syndication
  - Dynamic Open Graph images at `/og/[slug].png`
  - Enhanced BlogPosting schema for blog posts
  - Product/Pricing schema on pricing page
  - FAQ schema on comparison pages (DeleteMe, Incogni)
  - RSS feed link in site metadata

### Changed
- Updated blog post schema from Article to BlogPosting with additional fields
- Enhanced structured data with word count, read time, copyright info

### Documentation
- Complete rewrite of README.md
- Updated DEPLOYMENT.md with charge.refunded webhook
- Updated UAT-TESTING-PLAN.md with implemented features
- Created CHANGELOG.md
- Created ARCHITECTURE.md

---

## [1.1.0] - 2026-01-21

### Added
- **Refund System**
  - 30-day money-back guarantee policy
  - Refund request link in Settings page
  - Automated refund confirmation emails
  - Stripe webhook handler for `charge.refunded` event
  - Admin refund guide (`docs/REFUND_GUIDE.md`)

- **Upgrade Flow**
  - Upgrade banner component for FREE users
  - Banner displayed in sidebar and dashboard
  - Direct Stripe checkout integration
  - Error handling and loading states

- **Email Notifications**
  - Refund confirmation email template
  - Subscription cancellation email
  - Enhanced email error handling

### Changed
- Updated Terms of Service with refund policy (Section 7.3)
- Improved Stripe checkout error messages
- Updated webhook to handle refunds and downgrade users

### Fixed
- Stripe checkout "Not a valid URL" error
- Missing NEXT_PUBLIC_APP_URL configuration

---

## [1.0.0] - 2026-01-21

### Added
- **Search Engine Verification**
  - Bing Webmaster Tools verification (CNAME method)
  - Google Search Console integration
  - Sitemap submission to search engines

- **SEO Infrastructure**
  - Dynamic sitemap generation (`/sitemap.xml`)
  - Robots.txt configuration
  - Comprehensive metadata for all pages
  - Organization and WebSite structured data
  - FAQ schema on homepage and pricing

- **Blog System**
  - 13 SEO-optimized blog posts
  - Data broker removal guides (Spokeo, WhitePages, BeenVerified, etc.)
  - Privacy education articles
  - Security and dark web monitoring content
  - Competitor comparison pages

- **Health Check System**
  - Automated daily health checks via cron
  - Database connectivity tests
  - Encryption system validation
  - Stripe configuration checks
  - Email service validation
  - Stuck scan/removal detection
  - Email alerts for issues

- **Admin Features**
  - Admin bypass system for testing
  - ADMIN_EMAILS environment variable
  - Automatic ENTERPRISE access for admins

### Changed
- Rebranded from DataScrub Pro to GhostMyData
- Updated all UI with GhostMyData branding
- Applied 40% introductory sale pricing

---

## [0.9.0] - 2026-01-20

### Added
- **Legal Pages**
  - Terms of Service page
  - Privacy Policy page
  - Security practices page
  - Cookie policy information

- **Stripe Integration**
  - Checkout session creation
  - Customer portal integration
  - Subscription webhook handlers
  - Plan-based feature gating

- **Email System**
  - Resend integration
  - Welcome emails
  - Password reset emails
  - Exposure alert emails
  - Removal status notifications

- **Profile Persistence**
  - Encrypted PII storage (AES-256)
  - Profile data saves to database
  - Session-based authentication

### Fixed
- Footer links to legal pages
- Navigation menu items
- Mobile responsive layout issues

---

## [0.8.0] - 2026-01-20

### Added
- **Core Application**
  - Next.js 16 with App Router
  - TypeScript configuration
  - Tailwind CSS + shadcn/ui components
  - Prisma ORM with PostgreSQL

- **Authentication**
  - NextAuth.js v5 integration
  - Email/password registration
  - Login/logout flows
  - Password reset functionality
  - Protected routes middleware

- **Dashboard**
  - Main dashboard with risk score
  - Profile management (5 tabs)
  - Scan initiation and progress
  - Exposure list with filtering
  - Whitelist management
  - Removal request tracking
  - Alerts system
  - Reports page
  - Settings page

- **Scanning System**
  - Quick and Full scan types
  - HaveIBeenPwned integration
  - Mock data broker scanners
  - Exposure severity classification
  - Source categorization

- **Data Models**
  - User model with plans
  - PersonalProfile with encrypted PII
  - Scan tracking
  - Exposure records
  - Whitelist entries
  - RemovalRequest tracking
  - Subscription management
  - Alert system

- **Marketing Pages**
  - Landing page with features
  - Pricing page with 3 tiers
  - How It Works page
  - Compare pages (vs DeleteMe, Incogni)

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.2.0 | 2026-01-21 | SEO optimizations, RSS feed, OG images |
| 1.1.0 | 2026-01-21 | Refund system, upgrade flow, email notifications |
| 1.0.0 | 2026-01-21 | Production launch, SEO, health checks, blog |
| 0.9.0 | 2026-01-20 | Legal pages, Stripe, email system |
| 0.8.0 | 2026-01-20 | Initial release, core features |

---

## Deployment History

| Date | Commit | Description |
|------|--------|-------------|
| 2026-01-21 | a6a1ea1 | Documentation updates |
| 2026-01-21 | 3de5b99 | SEO optimizations |
| 2026-01-21 | c1db5fe | Refund emails |
| 2026-01-21 | 3391e1e | Upgrade banner |
| 2026-01-21 | 2f2e2c1 | SEO content |
| 2026-01-21 | c0aa225 | Health check system |
| 2026-01-21 | 255662e | Profile persistence, admin bypass |
| 2026-01-20 | 13875cc | 40% sale pricing |
| 2026-01-20 | f8e81ef | GhostMyData rebrand |
| 2026-01-20 | 60976ca | Initial commit |

---

## Contributing

When making changes, please update this changelog following these guidelines:

1. Add entries under `[Unreleased]` section
2. Use these categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Keep descriptions concise but informative
4. Reference issue/PR numbers when applicable
5. Move unreleased items to a new version section on release

## Links

- **Production**: https://ghostmydata.com
- **Repository**: https://github.com/Rank127/datascrub-pro
- **Vercel Dashboard**: https://vercel.com/ghostmydata
