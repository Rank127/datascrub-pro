# GhostMyData Security Documentation

## Table of Contents
1. [Security Overview](#security-overview)
2. [Security Audit Findings](#security-audit-findings)
3. [Implementation Status](#implementation-status)
4. [Security Architecture](#security-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Protection](#data-protection)
7. [API Security](#api-security)
8. [Cron Job Security](#cron-job-security)
9. [Security Monitoring](#security-monitoring)
10. [Environment Configuration](#environment-configuration)
11. [Security Best Practices](#security-best-practices)

---

## Security Overview

GhostMyData is a data privacy service that handles sensitive personal information (PII) including names, addresses, phone numbers, and email addresses. Security is paramount to protect user data and maintain compliance with privacy regulations (CCPA, GDPR).

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Fail Closed**: Deny access when uncertain (not fail open)
- **Least Privilege**: Minimal permissions for each role
- **Audit Everything**: Comprehensive logging for forensics
- **Encrypt at Rest & Transit**: AES-256-GCM encryption for PII

---

## Security Audit Findings

### Audit Date: February 2025

| Severity | Issue | Status |
|----------|-------|--------|
| CRITICAL | SQL Injection in `/api/exposures` | ✅ FIXED |
| CRITICAL | CRON_SECRET bypass vulnerability | ✅ FIXED |
| CRITICAL | In-memory rate limiting (not production-ready) | ✅ FIXED (Upstash Redis) |
| HIGH | Missing Content Security Policy (CSP) | ✅ FIXED |
| HIGH | Admin login doesn't require 2FA | ✅ FIXED |
| HIGH | No IP allowlist for admin access | ✅ FIXED |
| MEDIUM | No security monitoring/scanning | ✅ FIXED |
| MEDIUM | No webhook idempotency | 📋 PLANNED |
| MEDIUM | Session timeout not enforced | 📋 PLANNED |

---

## Implementation Status

### Phase 1: Critical Fixes ✅ COMPLETED

#### 1.1 SQL Injection Fix
**File**: `src/app/api/exposures/route.ts`

**Before (Vulnerable)**:
```typescript
// VULNERABLE: Direct string interpolation
conditions.push(`"source" = '${source}'`);
conditions.push(`"sourceName" ILIKE '%${search}%'`);
```

**After (Secure)**:
```typescript
// SECURE: Parameterized queries with Prisma.sql
import { Prisma } from "@prisma/client";

// Validate against allowed values
const VALID_STATUSES = ["ACTIVE", "REMOVAL_PENDING", ...];
const safeStatus = status && VALID_STATUSES.includes(status) ? status : null;

// Use parameterized queries
conditions.push(Prisma.sql`"status" = ${safeStatus}`);
conditions.push(Prisma.sql`"sourceName" ILIKE ${'%' + safeSearch + '%'}`);
```

#### 1.2 Cron Authentication Fix
**File**: `src/lib/cron-auth.ts` (NEW)

All cron endpoints now use centralized secure authentication:

```typescript
export function verifyCronAuth(request: Request): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET;

  // SECURITY: Fail closed - if secret not configured, deny access
  if (!cronSecret) {
    return { authorized: false, reason: "CRON_SECRET not configured" };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return { authorized: false, reason: "Invalid authorization token" };
  }

  return { authorized: true, reason: "Authenticated" };
}
```

**Updated Files** (12 cron routes):
- `src/app/api/cron/health-check/route.ts`
- `src/app/api/cron/email-monitor/route.ts`
- `src/app/api/cron/process-removals/route.ts`
- `src/app/api/cron/verify-removals/route.ts`
- `src/app/api/cron/free-user-digest/route.ts`
- `src/app/api/cron/link-checker/route.ts`
- `src/app/api/cron/removal-digest/route.ts`
- `src/app/api/cron/reports/route.ts`
- `src/app/api/cron/sync-subscriptions/route.ts`
- `src/app/api/cron/monthly-rescan/route.ts`
- `src/app/api/cron/follow-up-reminders/route.ts`
- `src/app/api/cron/ticketing-agent/route.ts`

### Phase 2: Security Headers & Admin Hardening ✅ COMPLETED

#### 2.1 Content Security Policy (CSP)
**File**: `src/middleware.ts`

Added comprehensive CSP headers:
```typescript
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://api.stripe.com https://*.upstash.io",
  "frame-src https://js.stripe.com https://checkout.stripe.com",
  "frame-ancestors 'none'",
  // ...more directives
];
```

#### 2.2 IP Allowlist for Admin
**File**: `src/middleware.ts`

Optional IP allowlist for admin routes:
```typescript
const ADMIN_IP_ALLOWLIST = process.env.ADMIN_IP_ALLOWLIST?.split(",") || [];

if ((isAdminPage || isAdminApiRoute) && !isIPAllowed(clientIP)) {
  console.warn(`[Security] Blocked admin access from IP: ${clientIP}`);
  return new NextResponse(JSON.stringify({ error: "Access denied" }), { status: 403 });
}
```

Supports:
- Exact IP matching
- CIDR notation (e.g., `192.168.1.0/24`)
- Empty allowlist = allow all (for development)

#### 2.3 Additional Security Headers
All responses now include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000` (production only)

### Phase 3: Rate Limiting ✅ COMPLETED

#### 3.1 Upstash Redis Rate Limiting
**File**: `src/lib/rate-limit.ts`

Migrated from in-memory to Upstash Redis for distributed rate limiting:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const limiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSeconds} s`),
  prefix: `ratelimit:${endpoint}`,
  analytics: true,
});
```

**Benefits**:
- Persists across serverless function restarts
- Distributed across all instances
- Built-in analytics
- Automatic fallback to in-memory if Redis unavailable

### Phase 4: Security Agent ✅ COMPLETED

**File**: `src/lib/agents/security-agent/index.ts`

The Security Agent provides:
- **Threat Detection**: Identifies API abuse, data scraping, brute force attacks
- **Suspicious Activity Monitoring**: Tracks anomalous user behavior
- **Breach Notifications**: Sends alerts to affected users
- **Fraud Prevention**: Detects trial abuse, disposable emails, rapid activity

### Phase 5: Security Monitoring ✅ COMPLETED

#### 5.1 Security Scan Cron
**File**: `src/app/api/cron/security-scan/route.ts`
**Schedule**: Daily at 2 AM UTC

The security scan cron performs:
1. Configuration validation (CRON_SECRET, encryption keys, etc.)
2. Threat detection scan
3. Fraud prevention analysis
4. Security event monitoring
5. Domain abuse detection

```typescript
async function checkSecurityConfiguration(): Promise<SecurityConfigCheck[]> {
  // Checks CRON_SECRET, UPSTASH_REDIS, ADMIN_IP_ALLOWLIST,
  // ENCRYPTION_KEY, NEXTAUTH_SECRET, STRIPE_WEBHOOK_SECRET,
  // and admin 2FA status
}
```

### Phase 6: Future Improvements 📋 PLANNED

- Webhook idempotency for Stripe
- Session timeout for admin (30 min inactivity)
- Device tracking for sessions

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   HTTPS     │  │   DDoS      │  │   Geographic            │  │
│  │   TLS 1.3   │  │   Protection│  │   Distribution          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   CORS      │  │   Security  │  │   Rate Limiting         │  │
│  │   Headers   │  │   Headers   │  │   (Vercel KV)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  NextAuth   │  │   RBAC      │  │   Input Validation      │  │
│  │  JWT Auth   │  │   System    │  │   (Zod Schemas)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  2FA/TOTP   │  │   Audit     │  │   PII Masking           │  │
│  │             │  │   Logging   │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │   PostgreSQL (Supabase)                                      ││
│  │   - Row-Level Security                                       ││
│  │   - Encrypted connections (SSL)                              ││
│  │   - Connection pooling (pgBouncer)                           ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │   AES-256-GCM Encryption                                     ││
│  │   - PII encrypted at rest                                    ││
│  │   - IV + Auth Tag for integrity                              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Authentication Stack
- **Framework**: NextAuth.js v5
- **Strategy**: JWT (JSON Web Tokens)
- **Session Duration**: 30 days
- **Password Hashing**: bcryptjs (12 salt rounds)

### Two-Factor Authentication (2FA)
- **Method**: TOTP (Time-based One-Time Password)
- **Library**: OTPAuth
- **Backup Codes**: 10 codes, SHA-256 hashed
- **QR Code**: Generated for authenticator app enrollment

### Role-Based Access Control (RBAC)

| Role | Level | Permissions |
|------|-------|-------------|
| USER | 0 | Own data only |
| SEO_MANAGER | 1 | Marketing/SEO content |
| SUPPORT | 2 | View masked PII, handle tickets |
| ADMIN | 3 | User management (not other admins) |
| LEGAL | 4 | Full PII access for compliance |
| SUPER_ADMIN | 5 | Full system access |

**File**: `src/lib/rbac/roles.ts`

```typescript
export const ROLE_HIERARCHY = {
  USER: 0,
  SEO_MANAGER: 1,
  SUPPORT: 2,
  ADMIN: 3,
  LEGAL: 4,
  SUPER_ADMIN: 5,
};
```

---

## Data Protection

### Encryption at Rest

**Algorithm**: AES-256-GCM (Authenticated Encryption)
**File**: `src/lib/encryption/crypto.ts`

```typescript
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  // ... encryption with authentication tag
}
```

### PII Masking

**File**: `src/lib/rbac/pii-masking.ts`

| Function | Input | Output |
|----------|-------|--------|
| `maskEmail` | john.doe@example.com | j***e@e***.com |
| `maskPhone` | +1 (555) 123-4567 | +1 (***) ***-4567 |
| `maskSSN` | 123-45-6789 | ***-**-6789 |
| `maskName` | John Doe | J*** D** |
| `maskAddress` | 123 Main St | 1** M*** St |

### Data Access Based on Role

```typescript
function shouldMaskPII(viewerRole: string, isOwnData: boolean): boolean {
  if (isOwnData) return false;  // Users see own unmasked data
  if (["LEGAL", "SUPER_ADMIN"].includes(viewerRole)) return false;
  return true;  // Others see masked
}
```

---

## API Security

### Input Validation

All API endpoints use Zod schemas for validation:

```typescript
const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  name: z.string().min(1, "Required"),
});

// Usage
const result = registerSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: "Invalid" }, { status: 400 });
}
```

### Rate Limiting Configuration

| Endpoint | Limit | Window | Storage |
|----------|-------|--------|---------|
| Auth register | 5 | 1 hour | Upstash Redis |
| Auth login | 10 | 15 minutes | Upstash Redis |
| Forgot password | 3 | 1 hour | Upstash Redis |
| 2FA verification | 5 | 15 minutes | Upstash Redis |
| Scan | 10 | 1 hour | Upstash Redis |
| General API | 100 | 1 minute | Upstash Redis |
| Stripe | 10 | 1 minute | Upstash Redis |
| Admin | 50 | 1 minute | Upstash Redis |

**File**: `src/lib/rate-limit.ts`

**Configuration**:
- Uses Upstash Redis for distributed rate limiting
- Sliding window algorithm for smooth rate limiting
- Automatic fallback to in-memory if Redis unavailable
- Analytics enabled for monitoring

### Security Headers

**File**: `next.config.ts`

```typescript
headers: [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]
```

---

## Cron Job Security

### Authentication

All cron endpoints require Bearer token authentication:

```bash
# Vercel cron (automatic)
Authorization: Bearer ${CRON_SECRET}

# Manual invocation
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  https://ghostmydata.com/api/cron/health-check
```

### Implementation

**File**: `src/lib/cron-auth.ts`

```typescript
export function verifyCronAuth(request: Request): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET;

  // FAIL CLOSED: Deny if secret not configured
  if (!cronSecret) {
    return { authorized: false, reason: "CRON_SECRET not configured" };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return { authorized: false, reason: "Invalid token" };
  }

  return { authorized: true, reason: "Authenticated" };
}
```

### Cron Job Schedule

| Job | Schedule | Purpose |
|-----|----------|---------|
| health-check | Daily 7 AM | System health validation |
| process-removals | Every 2 hours | Send removal requests |
| verify-removals | Daily 8 AM | Check removal status |
| email-monitor | 8 AM, 8 PM | Monitor email delivery |
| security-scan | Daily 2 AM | Security vulnerability scan |

---

## Security Monitoring

### Audit Logging

**File**: `src/lib/rbac/audit-log.ts`

All sensitive actions are logged:

```typescript
await logAudit({
  actorId: session.user.id,
  actorEmail: user.email,
  actorRole: role,
  action: "VIEW_USER_DATA",
  resource: "user_profile",
  targetUserId: targetUser.id,
  ipAddress: getClientIP(request),
  userAgent: request.headers.get("user-agent"),
  details: { fields: ["email", "phone"] },
});
```

### Audit Log Retention
- Default: 365 days
- Automated cleanup via cron

### Logged Actions
- Authentication (login, logout, failed attempts)
- Data access (view, export, unmask PII)
- Modifications (user changes, role changes)
- Admin actions (all)
- Security events (rate limit violations, suspicious activity)

---

## Environment Configuration

### Required Environment Variables

```env
# Authentication
AUTH_SECRET=                    # NextAuth secret (base64)
NEXTAUTH_URL=                   # Application URL

# Database
DATABASE_URL=                   # Supabase PostgreSQL URL
DIRECT_URL=                     # Direct connection for migrations

# Encryption
ENCRYPTION_KEY=                 # AES-256 key (64 hex chars)

# Cron Security
CRON_SECRET=                    # Bearer token for cron jobs

# Third-Party APIs
STRIPE_SECRET_KEY=              # Stripe API key
STRIPE_WEBHOOK_SECRET=          # Stripe webhook signature
RESEND_API_KEY=                 # Email service
HIBP_API_KEY=                   # Have I Been Pwned API

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=         # Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN=       # Upstash Redis token

# Admin Security (Optional)
ADMIN_IP_ALLOWLIST=             # Comma-separated IPs
ADMIN_EMAILS=                   # Bootstrap admin access
```

### Environment Security Rules

1. **Never commit `.env` files** to version control
2. **Rotate secrets** quarterly
3. **Use Vercel environment variables** for production
4. **Separate keys** for development/staging/production

---

## Security Best Practices

### For Developers

1. **Input Validation**: Always use Zod schemas
2. **Parameterized Queries**: Never concatenate SQL strings
3. **Auth Checks**: Verify session on every protected route
4. **Ownership Verification**: Check `userId` matches session
5. **Error Messages**: Don't leak implementation details
6. **Logging**: Never log passwords, tokens, or full PII

### For Operations

1. **Dependency Auditing**: Run `npm audit` weekly
2. **Secret Rotation**: Rotate API keys quarterly
3. **Access Review**: Review admin access monthly
4. **Incident Response**: Follow playbook for breaches
5. **Backup Verification**: Test backup restoration quarterly

### Security Checklist for New Features

- [ ] Input validated with Zod schema
- [ ] Authentication required (if not public)
- [ ] Authorization checked (correct role)
- [ ] Ownership verified (user's own data)
- [ ] Rate limiting applied
- [ ] Audit logging added
- [ ] PII masked appropriately
- [ ] No SQL injection vectors
- [ ] No XSS vectors
- [ ] Error messages sanitized

---

## Incident Response

### Contact
- **Security Team**: security@ghostmydata.com
- **On-Call Admin**: developer@ghostmydata.com

### Response Procedure

1. **Identify**: Detect and confirm the incident
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat
4. **Recover**: Restore services
5. **Post-Mortem**: Document lessons learned

### Severity Levels

| Level | Response Time | Example |
|-------|--------------|---------|
| P0 - Critical | 15 minutes | Data breach, system compromise |
| P1 - High | 1 hour | Auth bypass, SQL injection |
| P2 - Medium | 4 hours | Rate limiting failure |
| P3 - Low | 24 hours | Minor vulnerability |

---

## Compliance

### CCPA (California Consumer Privacy Act)
- Users can request data deletion
- Automated opt-out requests to data brokers
- 45-day response requirement

### GDPR (General Data Protection Regulation)
- Data minimization
- Right to erasure
- Data portability
- Consent management

### SOC 2 Type II (Planned)
- Security controls documentation
- Annual audit
- Continuous monitoring

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-02-05 | Initial security documentation |
| 1.1 | 2025-02-05 | Added SQL injection fix, cron auth hardening |
| 1.2 | 2025-02-05 | Completed Phase 2: CSP headers, IP allowlist, Upstash Redis rate limiting |
| 1.3 | 2025-02-05 | Added security scan cron job, Security Agent integration |

---

*Last Updated: February 5, 2025*
*Document Owner: Security Team*
