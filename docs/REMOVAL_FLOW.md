# GhostMyData - Data Removal Flow

This document explains what happens from start to finish when a user requests removal of a data exposure (including breach data from LeakCheck).

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REMOVAL REQUEST FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. USER SEES EXPOSURE    2. CLICKS "REMOVE"    3. SYSTEM PROCESSES         │
│  ┌─────────────────┐      ┌─────────────────┐   ┌─────────────────────────┐ │
│  │ Scan Results    │ ──▶  │ API Request     │ ──▶│ Determine Method       │ │
│  │ - LeakCheck     │      │ POST /api/      │   │ - AUTO_EMAIL           │ │
│  │ - Data Brokers  │      │   removals/     │   │ - AUTO_FORM            │ │
│  │ - HIBP          │      │   request       │   │ - MANUAL_GUIDE         │ │
│  └─────────────────┘      └─────────────────┘   └─────────────────────────┘ │
│                                                            │                 │
│                                                            ▼                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        4. EXECUTE REMOVAL                              │  │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────────┐  │  │
│  │  │ AUTO_EMAIL  │   │ AUTO_FORM   │   │ MANUAL_GUIDE                │  │  │
│  │  │             │   │             │   │                             │  │  │
│  │  │ Send CCPA/  │   │ Provide URL │   │ Provide opt-out URL +       │  │  │
│  │  │ GDPR email  │   │ + instruct- │   │ step-by-step instructions   │  │  │
│  │  │ to broker   │   │ ions        │   │                             │  │  │
│  │  └─────────────┘   └─────────────┘   └─────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                            │                 │
│                                                            ▼                 │
│  5. STATUS UPDATES        6. USER NOTIFIED        7. TRACK IN DASHBOARD     │
│  ┌─────────────────┐      ┌─────────────────┐     ┌─────────────────────┐   │
│  │ PENDING ──▶     │      │ Email sent to   │     │ /dashboard/removals │   │
│  │ SUBMITTED ──▶   │      │ user with       │     │ - Progress bar      │   │
│  │ IN_PROGRESS ──▶ │      │ status updates  │     │ - Status badges     │   │
│  │ COMPLETED       │      │                 │     │ - Manual action UI  │   │
│  └─────────────────┘      └─────────────────┘     └─────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Flow

### Step 1: User Sees an Exposure

When a user runs a scan, the system checks multiple sources:

- **LeakCheck** - Free breach database API (no key required)
- **HaveIBeenPwned** - Breach notification service
- **DeHashed** - Dark web dumps (optional, requires API key)
- **Data Brokers** - Spokeo, WhitePages, BeenVerified, etc.
- **Social Media** - LinkedIn, Facebook, Twitter, etc. (manual check links)

Results are stored in the `Exposure` table with:
- Source name (e.g., "LeakCheck - Canva.com")
- Data type exposed (EMAIL, PHONE, PASSWORD, etc.)
- Severity (LOW, MEDIUM, HIGH, CRITICAL)
- Preview of exposed data (masked)

**File**: `src/lib/scanners/breaches/leakcheck.ts`

---

### Step 2: User Clicks "Request Removal"

From the Exposures page (`/dashboard/exposures`), user clicks the remove button.

**What happens in the frontend**:
1. Sends POST request to `/api/removals/request`
2. Includes `exposureId` in the request body

**File**: `src/app/(dashboard)/dashboard/exposures/page.tsx`

---

### Step 3: API Validates the Request

**File**: `src/app/api/removals/request/route.ts`

The API performs these checks:

```typescript
// 1. Verify user is authenticated
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// 2. Check user's plan limits
// FREE: 1 removal/month
// PRO: Unlimited
// ENTERPRISE: Unlimited

// 3. Verify exposure exists and belongs to user
const exposure = await prisma.exposure.findFirst({
  where: { id: exposureId, userId: session.user.id }
});

// 4. Check it's not whitelisted
if (exposure.isWhitelisted) {
  return error("Cannot remove whitelisted items");
}

// 5. Check no existing removal request
const existingRequest = await prisma.removalRequest.findUnique({
  where: { exposureId }
});
```

---

### Step 4: Determine Removal Method

Based on the data source, the system chooses a removal method:

**File**: `src/app/api/removals/request/route.ts` (function `getRemovalMethod`)

| Source Type | Method | What Happens |
|-------------|--------|--------------|
| Data Brokers with email support | `AUTO_EMAIL` | Send CCPA/GDPR email |
| Data Brokers with form only | `AUTO_FORM` | Provide form URL + instructions |
| Social Media | `MANUAL_GUIDE` | Provide account deletion links |
| Dark Web / Paste Sites | `MANUAL_GUIDE` | Cannot automate, guide only |
| Breach Databases (LeakCheck) | `AUTO_EMAIL` | Send email to breach source |

**Data Broker Directory**: `src/lib/removers/data-broker-directory.ts`

```typescript
const DATA_BROKER_DIRECTORY = {
  SPOKEO: {
    name: "Spokeo",
    optOutUrl: "https://www.spokeo.com/optout",
    privacyEmail: "privacy@spokeo.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  // ... more brokers
}
```

---

### Step 5: Create Removal Request Record

```typescript
// Create removal request in database
const removalRequest = await prisma.removalRequest.create({
  data: {
    userId: session.user.id,
    exposureId,
    method,           // AUTO_EMAIL, AUTO_FORM, or MANUAL_GUIDE
    status: "PENDING",
  },
});

// Update exposure status
await prisma.exposure.update({
  where: { id: exposureId },
  data: { status: "REMOVAL_PENDING" },
});
```

---

### Step 6: Execute the Removal

**File**: `src/lib/removers/removal-service.ts` (function `executeRemoval`)

#### Option A: AUTO_EMAIL (Automated Email)

If the broker has a privacy email, the system sends a CCPA/GDPR removal request:

```typescript
case "AUTO_EMAIL": {
  if (brokerInfo.privacyEmail) {
    const result = await sendCCPARemovalRequest({
      toEmail: brokerInfo.privacyEmail,  // e.g., privacy@spokeo.com
      fromName: userName,
      fromEmail: userEmail,
      dataTypes: [formatDataType(dataType)],
      sourceUrl: exposure.sourceUrl,
    });

    if (result.success) {
      await updateRemovalStatus(removalRequestId, "SUBMITTED");
      await sendRemovalUpdateEmail(userEmail, userName, {...});
    }
  }
}
```

**The Email Sent** (`src/lib/email/index.ts`):

```
Subject: Data Deletion Request - CCPA/GDPR - John Doe

To Whom It May Concern,

I am writing to exercise my rights under the California Consumer Privacy Act
(CCPA) and/or the General Data Protection Regulation (GDPR) to request the
deletion of my personal information from your systems.

Request Details:
- Full Name: John Doe
- Email: john@example.com
- Data Types to Remove: Email Address
- Profile URL: https://spokeo.com/john-doe-123

Under the CCPA (Cal. Civ. Code § 1798.105) and GDPR (Article 17), I have
the right to request that a business delete any personal information about
me that it has collected.

Please confirm receipt of this request and provide written confirmation
once my data has been deleted. According to applicable regulations, you
must respond within 45 days (CCPA) or 30 days (GDPR).

Sincerely,
John Doe
```

#### Option B: AUTO_FORM (Form-Based)

For brokers that only accept form submissions:

```typescript
case "AUTO_FORM": {
  // Can't automate form submission without browser automation
  // Mark as requiring manual action
  await updateRemovalStatus(removalRequestId, "REQUIRES_MANUAL");

  return {
    success: true,
    method: "MANUAL_GUIDE",
    message: "Please complete the opt-out form for Spokeo",
    instructions: getOptOutInstructions(source),
  };
}
```

#### Option C: MANUAL_GUIDE

For sources that can't be automated (social media, dark web):

```typescript
case "MANUAL_GUIDE": {
  await updateRemovalStatus(removalRequestId, "REQUIRES_MANUAL");

  // Save instructions to the removal request
  await prisma.removalRequest.update({
    where: { id: removalRequestId },
    data: { notes: getOptOutInstructions(source) },
  });

  return {
    success: true,
    method: "MANUAL_GUIDE",
    message: "Manual removal required for LinkedIn",
    instructions: `
      To remove your data from LinkedIn:
      1. Visit their opt-out page: https://linkedin.com/help/...
      2. Or email their privacy team: privacy@linkedin.com

      Estimated processing time: 30 days
      Note: Account must be deleted manually through settings
    `,
  };
}
```

---

### Step 7: Status Updates

The removal request goes through these statuses:

| Status | Meaning |
|--------|---------|
| `PENDING` | Just created, not yet processed |
| `SUBMITTED` | Email sent to data broker |
| `IN_PROGRESS` | Broker acknowledged, processing |
| `COMPLETED` | Data successfully removed |
| `FAILED` | Removal failed (will retry) |
| `REQUIRES_MANUAL` | User must complete manually |

Status updates are tracked:
- `submittedAt` - When email was sent
- `completedAt` - When removal was confirmed
- `attempts` - Number of retry attempts
- `lastError` - Most recent error message

---

### Step 8: User Notifications

**File**: `src/lib/email/index.ts`

Users receive emails for:

1. **Removal Submitted**
   ```
   📤 Removal Request Submitted
   Your data removal request has been submitted to Spokeo.
   We'll keep you updated as the removal progresses.
   ```

2. **Removal Completed**
   ```
   ✅ Removal Completed!
   Great news! Your data has been successfully removed from Spokeo.
   ```

3. **Removal Failed**
   ```
   ⚠️ Removal Requires Attention
   The automatic removal encountered an issue.
   You may need to complete this removal manually.
   ```

---

### Step 9: Dashboard Tracking

**File**: `src/app/(dashboard)/dashboard/removals/page.tsx`

Users can view all removal requests at `/dashboard/removals`:

- **Stats Overview**: Total, Completed, In Progress, Needs Attention
- **Progress Bar**: Visual completion percentage
- **Request List**: Each removal with status badge
- **Manual Action UI**: For REQUIRES_MANUAL, shows:
  - Opt-out URL link
  - Privacy email link
  - Step-by-step instructions
  - Estimated processing time

---

## For LeakCheck Breaches Specifically

When a breach is found via LeakCheck:

1. **Exposure Created**:
   ```typescript
   {
     source: "BREACH_DB",
     sourceName: "LeakCheck - Canva.com",
     dataType: "EMAIL",
     severity: "CRITICAL",  // If password exposed
     rawData: {
       breachName: "Canva.com",
       breachDate: "2019-05",
       exposedFields: ["password", "email", "name"],
       poweredBy: "LeakCheck",
     }
   }
   ```

2. **Removal Request**:
   - Method: `AUTO_EMAIL` (default for breach DBs)
   - Email sent to: Depends on the breached company
   - Note: Breach databases like LeakCheck/HIBP don't remove data - the breach already happened. The email goes to the original breached company.

3. **What Users Should Know**:
   - Breach data can't be "removed" from the internet
   - The email requests the original company remove stored data
   - User should change passwords for affected accounts
   - Enable 2FA where possible

---

## Database Schema

```prisma
model RemovalRequest {
  id          String        @id @default(cuid())
  userId      String
  exposureId  String        @unique

  status      RemovalStatus @default(PENDING)
  method      RemovalMethod // AUTO_EMAIL, AUTO_FORM, MANUAL_GUIDE

  submittedAt DateTime?
  completedAt DateTime?
  attempts    Int           @default(0)
  lastError   String?
  notes       String?       // Manual instructions

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user        User          @relation(...)
  exposure    Exposure      @relation(...)
}

enum RemovalStatus {
  PENDING
  SUBMITTED
  IN_PROGRESS
  COMPLETED
  FAILED
  REQUIRES_MANUAL
}

enum RemovalMethod {
  AUTO_FORM
  AUTO_EMAIL
  API
  MANUAL_GUIDE
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/api/removals/request/route.ts` | POST endpoint to create removal request |
| `src/app/api/removals/status/route.ts` | GET endpoint to list user's removals |
| `src/lib/removers/removal-service.ts` | Core removal execution logic |
| `src/lib/removers/data-broker-directory.ts` | Opt-out URLs and contacts for brokers |
| `src/lib/email/index.ts` | Email templates (CCPA request, notifications) |
| `src/app/(dashboard)/dashboard/removals/page.tsx` | User dashboard UI |

---

## Automated Verification System

The system automatically verifies if removal requests have been completed by re-scanning the source.

### How It Works

1. **Scheduling**: When a removal is marked as `SUBMITTED`, a `verifyAfter` date is set based on the source's estimated processing time.

2. **Daily Cron Job**: Runs at 8 AM UTC daily (`/api/cron/verify-removals`)
   - Finds all removals with `verifyAfter <= now` and status `SUBMITTED` or `IN_PROGRESS`
   - Re-runs the appropriate scanner for each exposure
   - Checks if the data is still present

3. **Verification Outcomes**:
   - **Data NOT found** → Mark as `COMPLETED`, notify user
   - **Data still found** → Schedule next verification (up to 3 attempts)
   - **Max attempts reached** → Mark as `FAILED`, notify user

### Verification Delays by Source

| Source | Days to Wait | Reason |
|--------|--------------|--------|
| TruePeopleSearch | 3 | Fast automated removal |
| FastPeopleSearch | 3 | Fast automated removal |
| Spokeo | 7 | Quick processing |
| WhitePages | 10 | Standard processing |
| BeenVerified | 14 | Longer processing |
| Radaris | 21 | Known slow |
| Breach databases | 45 | CCPA deadline |
| Social media | 35 | Account deletion period |

### Database Fields

```prisma
model RemovalRequest {
  // ... existing fields ...

  // Verification tracking
  verifyAfter       DateTime?  // When to run verification scan
  lastVerifiedAt    DateTime?  // Last verification attempt
  verificationCount Int        @default(0) // Number of attempts
}
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/removers/verification-service.ts` | Core verification logic |
| `src/app/api/cron/verify-removals/route.ts` | Cron endpoint |
| `vercel.json` | Cron schedule configuration |

---

## Limitations

1. **No Browser Automation**: Can't auto-fill web forms (would need Puppeteer/Playwright)
2. **No API Integrations**: Most data brokers don't have removal APIs
3. **Breach Data**: Can't undo a breach - can only request company deletes stored data
4. **Response Time**: Data brokers have 30-45 days to respond per CCPA/GDPR
5. **Scanner Coverage**: Verification only works for sources with available scanners

---

## Future Improvements

1. **Browser Automation**: Use Puppeteer to auto-submit opt-out forms
2. **Follow-up Emails**: Auto-send reminders if no response in 30 days
3. **Bulk Removals**: Process multiple exposures in one request
4. **API Integrations**: Direct API calls where available (rare)
5. **More Scanners**: Add verification support for more data broker sources
