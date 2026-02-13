# GhostMyData - Production Deployment Guide

## Required Environment Variables

Set these in your Vercel dashboard (Settings → Environment Variables):

### Database (Supabase)
```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### Authentication
```
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=https://your-domain.com
```

### Encryption
```
ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
```

### External APIs
```
HIBP_API_KEY=<your Have I Been Pwned API key - $3.50/month at https://haveibeenpwned.com/API/Key>
```

### Stripe Billing
```
STRIPE_SECRET_KEY=sk_live_xxx (or sk_test_xxx for testing)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx (or pk_test_xxx for testing)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs from your Stripe Dashboard → Products
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxx
```

### Email (Resend)
```
RESEND_API_KEY=re_xxx (get at https://resend.com)
RESEND_FROM_EMAIL=GhostMyData <noreply@send.ghostmydata.com>
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=GhostMyData
```

### Analytics & Retargeting (Optional)
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxx (Google Analytics 4)
NEXT_PUBLIC_FB_PIXEL_ID=xxx (Facebook Pixel)
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-xxx (Google Ads)
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=xxx (Conversion tracking)
```

### Live Chat (Optional)
```
NEXT_PUBLIC_CRISP_WEBSITE_ID=xxx (Crisp chat widget)
```

### Cron Jobs
```
CRON_SECRET=xxx (Vercel cron authentication - required for all 27 cron endpoints)
```

### AI Services
```
ANTHROPIC_API_KEY=sk-ant-xxx (Claude API - powers 24 AI agents, daily standup, Mastermind)
OPENAI_API_KEY=sk-xxx (OpenAI fallback for agents)
```

### Breach Monitoring
```
LEAKCHECK_API_KEY=xxx (LeakCheck API for breach database integration)
```

### Phone Verification (Optional)
```
TWILIO_ACCOUNT_SID=ACxxx (Twilio account - Enterprise phone verification)
TWILIO_AUTH_TOKEN=xxx (Twilio auth token)
TWILIO_VERIFY_SERVICE_SID=VAxxx (Twilio Verify service for phone OTP)
```

### Rate Limiting
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io (Upstash Redis for distributed rate limiting)
UPSTASH_REDIS_REST_TOKEN=xxx (Upstash Redis token)
```

### Admin Security (Optional)
```
ADMIN_IP_ALLOWLIST=x.x.x.x,y.y.y.y (Comma-separated IPs for admin access restriction)
ADMIN_EMAILS=admin@ghostmydata.com (Bootstrap admin access)
```

---

## Stripe Setup

1. **Create Products in Stripe Dashboard:**
   - Go to Products → Add product
   - Create "PRO" product with monthly price ($11.99)
   - Create "ENTERPRISE" product with monthly price ($29.00)
   - Copy the Price IDs to environment variables

2. **Set up Webhook:**
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `charge.refunded`
   - Copy the Signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Configure Customer Portal:**
   - Go to Settings → Billing → Customer portal
   - Enable features: Update payment method, Cancel subscription, View invoices

---

## Resend Email Setup

1. Sign up at https://resend.com
2. Verify your domain (or use their test domain for development)
3. Copy API key to `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to your verified domain email

---

## Have I Been Pwned API

1. Go to https://haveibeenpwned.com/API/Key
2. Subscribe ($3.50/month)
3. Copy API key to `HIBP_API_KEY`

---

## Database Migrations

Run migrations on first deploy:

```bash
npx prisma migrate deploy
```

Or through Vercel:
```bash
npx prisma db push
```

---

## Feature Checklist

### Core Features (Complete)
- [x] User registration and login
- [x] Password reset with email
- [x] Profile management with encrypted PII
- [x] Data exposure scanning (HIBP integration)
- [x] Exposure viewing and filtering
- [x] Whitelist management
- [x] Bulk selection and actions
- [x] Removal request system
- [x] CCPA/GDPR removal emails

### Billing (Complete)
- [x] Stripe checkout integration
- [x] Subscription management
- [x] Customer portal
- [x] Webhook handling
- [x] Plan-based feature gating

### Notifications (Complete)
- [x] Welcome emails
- [x] Password reset emails
- [x] Exposure alert emails
- [x] Removal status updates
- [x] Subscription confirmation
- [x] Subscription cancellation
- [x] Refund confirmation

### Security (Complete)
- [x] PII encryption at rest
- [x] Password hashing (bcrypt)
- [x] Rate limiting on critical endpoints
- [x] Plan restrictions for paid features

### Marketing & Conversion (Complete)
- [x] Exit-intent popup (50% off offer)
- [x] Social proof notifications
- [x] Live chat widget (Crisp)
- [x] Countdown timer for urgency
- [x] Retargeting pixels (Facebook + Google)
- [x] Email drip campaigns (5-email sequence)
- [x] Referral program (Give $10, Get $10)
- [x] Privacy score quiz lead capture

### SEO & Analytics (Complete)
- [x] Google Analytics 4 integration
- [x] Facebook Pixel tracking
- [x] Google Ads conversion tracking
- [x] SEO agent (runs 6x daily, 579+ keywords)
- [x] Content optimizer
- [x] Link checker
- [x] Dynamic sitemap
- [x] RSS feed

### AI & Automation (Complete)
- [x] 24 AI agents across 8 domains
- [x] 27 automated cron jobs with maxDuration protection
- [x] Auto-remediation (health check auto-fix, anomaly detection)
- [x] Ticketing agent with self-healing (tryAutoResolve, stale detection)
- [x] Daily standup with AI analysis
- [x] Mastermind Advisory System (75+ advisors)

### Family Plans (Complete)
- [x] Family group creation and management
- [x] Member invitation with 7-day expiry
- [x] Enterprise plan inheritance via family membership
- [x] Family dashboard with member overview

### Data Sources (Complete)
- [x] 2,100+ data broker sources across 92 categories
- [x] 60 AI Shield sources (facial recognition, voice cloning, deepfakes)
- [x] 365 dark web monitoring sources
- [x] HIBP + LeakCheck breach database integration
- [x] 10 social media platform scanning

---

## Testing Checklist

Before going live, test these flows:

1. **Registration Flow**
   - [ ] Register new account
   - [ ] Verify welcome email received
   - [ ] Verify profile created

2. **Login Flow**
   - [ ] Login with correct credentials
   - [ ] Test forgot password
   - [ ] Verify reset email received
   - [ ] Reset password successfully

3. **Profile & Scanning**
   - [ ] Complete profile with test data
   - [ ] Run a scan
   - [ ] Verify exposures displayed
   - [ ] Verify exposure alert email

4. **Whitelist**
   - [ ] Whitelist an exposure
   - [ ] Un-whitelist an exposure
   - [ ] Verify whitelisted items excluded from removal

5. **Removal (Paid Plan Required)**
   - [ ] Upgrade to paid plan
   - [ ] Request removal
   - [ ] Verify removal email sent/instructions provided

6. **Billing**
   - [ ] Complete Stripe checkout
   - [ ] Verify plan updated
   - [ ] Access customer portal
   - [ ] Cancel subscription
   - [ ] Verify downgrade to FREE

---

## Monitoring

### Built-In
- [x] Health check cron (24 tests, daily 7 AM UTC, auto-remediation)
- [x] Operations Agent anomaly detection (detects silent cron deaths)
- [x] Daily standup email with system health metrics
- [x] CronLog tracking for all 27 cron jobs
- [x] AgentExecution tracking for all 24 AI agents

### Recommended Additions
- [ ] Sentry for error tracking
- [ ] Vercel Analytics for usage metrics
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (LogTail/Papertrail)

---

## Support

- Email: support@ghostmydata.com
- Security: security@ghostmydata.com
- GitHub: https://github.com/Rank127/datascrub-pro
