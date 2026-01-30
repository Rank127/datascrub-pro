# Scripts Documentation

This document provides a comprehensive overview of all utility scripts in the GhostMyData platform.

## Overview

All scripts are located in the `/scripts/` directory and are designed for manual execution by administrators for data management, cleanup, and marketing tasks.

## Scripts Summary

| Script | Purpose | Runtime |
|--------|---------|---------|
| `cleanup-fake-exposures.ts` | Remove fraudulent exposures | ts-node |
| `convert-manual-to-proactive.ts` | Convert manual reviews to auto opt-out | tsx |
| `generate-banners.js` | Generate marketing banner images | node |
| `check-payment-methods.ts` | Check/cleanup duplicate Stripe payment methods | tsx |
| `update-billing-portal.ts` | Configure Stripe billing portal settings | tsx |
| `fix-user-subscription.ts` | Fix duplicate subscription issues | tsx |
| `test-cancellation-flow.ts` | Test subscription cancellation flow | tsx |
| `check-user-history.ts` | View user subscription history | tsx |

---

## Script Details

### 1. cleanup-fake-exposures.ts

**Location:** `/scripts/cleanup-fake-exposures.ts`
**Runtime:** TypeScript (ts-node)
**Lines:** ~125

**Purpose:**
Removes fake "potential exposures" created by the AllBrokersScanner that overwhelmed users with false positives.

**What it does:**
1. Identifies fraudulent manual review items
2. Preserves legitimate sources (FastPeopleSearch, PeopleFinders)
3. Processes deletions in 500-item batches
4. Generates before/after statistics

**When to use:**
- After identifying a batch of false positive exposures
- When AllBrokersScanner creates invalid entries
- For periodic cleanup of stale data

**Prerequisites:**
- Database access via `DATABASE_URL`
- Prisma client generated

**How to run:**
```bash
cd /home/rock/DarkWebCleanup/datascrub-pro-v2
npx ts-node scripts/cleanup-fake-exposures.ts
```

**Expected Output:**
```
Starting cleanup of fake exposures...
Found 1,234 fake exposures to remove
Processing batch 1/3...
Processing batch 2/3...
Processing batch 3/3...
Cleanup complete!
Before: 5,678 exposures
After: 4,444 exposures
Removed: 1,234 fake exposures
```

**Safety Measures:**
- Only targets specific source types
- Preserves legitimate manual review items
- Batch processing prevents timeout
- Logs all deletions for audit

**Rollback:**
- No automatic rollback
- Deleted items cannot be recovered
- Consider database backup before running

---

### 2. convert-manual-to-proactive.ts

**Location:** `/scripts/convert-manual-to-proactive.ts`
**Runtime:** TypeScript (tsx)
**Lines:** ~100

**Purpose:**
Converts manual review exposures to automated opt-out requests, enabling automatic processing by the removal system.

**What it does:**
1. Finds manual review exposures without removal requests
2. Creates proactive removal requests automatically
3. Updates exposure status to REMOVAL_PENDING
4. Processes in 100-item batches

**When to use:**
- To bulk-enable auto-removal for existing exposures
- When migrating users from manual to automated flow
- For backfilling removal requests on legacy data

**Prerequisites:**
- Database access via `DATABASE_URL`
- Prisma client generated
- Valid broker email templates in database

**How to run:**
```bash
cd /home/rock/DarkWebCleanup/datascrub-pro-v2
npx tsx scripts/convert-manual-to-proactive.ts
```

**Expected Output:**
```
Converting manual exposures to proactive requests...
Found 500 eligible exposures
Processing batch 1/5...
Created 100 removal requests
Processing batch 2/5...
Created 100 removal requests
...
Conversion complete!
Total converted: 500
Failed: 0
```

**Safety Measures:**
- Only processes exposures without existing requests
- Validates broker has email template
- Batch processing with progress logging
- Does not modify already-processed items

**Considerations:**
- Creates removal requests that will be processed by cron
- May increase email volume significantly
- Check rate limits before bulk conversion

---

### 3. generate-banners.js

**Location:** `/scripts/generate-banners.js`
**Runtime:** Node.js
**Lines:** ~50

**Purpose:**
Generates marketing banner images from HTML templates using Puppeteer.

**What it does:**
1. Loads HTML banner templates
2. Renders using headless Puppeteer browser
3. Captures screenshots as PNG images
4. Generates multiple sizes for different platforms

**Output Sizes:**
| Platform | Size |
|----------|------|
| YouTube | 2560x1440 |
| Twitter Header | 1500x500 |
| LinkedIn Banner | 1584x396 |
| Facebook Cover | 820x312 |
| Instagram | 1080x1080 |
| Open Graph | 1200x630 |

**Prerequisites:**
- Node.js installed
- Puppeteer installed (`npm install puppeteer`)
- HTML templates in `/public/banners/`

**How to run:**
```bash
cd /home/rock/DarkWebCleanup/datascrub-pro-v2
node scripts/generate-banners.js
```

**Expected Output:**
```
Generating banners...
Created: public/banners/youtube-banner.png (2560x1440)
Created: public/banners/twitter-header.png (1500x500)
Created: public/banners/linkedin-banner.png (1584x396)
Created: public/banners/facebook-cover.png (820x312)
Created: public/banners/instagram-post.png (1080x1080)
Created: public/banners/og-image.png (1200x630)
Done! Generated 6 banners.
```

**Customization:**
- Edit HTML templates in `/public/banners/`
- Modify sizes in script configuration
- Add new platform sizes as needed

---

## Running Scripts Locally

### Environment Setup

1. **Clone and install:**
```bash
cd /home/rock/DarkWebCleanup/datascrub-pro-v2
npm install
```

2. **Set environment variables:**
```bash
export DATABASE_URL="postgresql://..."
# Or use .env file
```

3. **Generate Prisma client:**
```bash
npx prisma generate
```

### Script Runners

**For TypeScript (.ts) scripts:**
```bash
# Using ts-node
npx ts-node scripts/script-name.ts

# Using tsx (faster)
npx tsx scripts/script-name.ts
```

**For JavaScript (.js) scripts:**
```bash
node scripts/script-name.js
```

### Common Issues

**"Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

**"Connection refused" (database)**
- Check DATABASE_URL is set
- Verify database is accessible
- Check network/firewall rules

**"Puppeteer: Failed to launch browser"**
```bash
# Install browser dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or use puppeteer with bundled Chromium
npm install puppeteer
```

---

## Creating New Scripts

### Template for Data Scripts

```typescript
// scripts/my-new-script.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting script...");

  try {
    // Your logic here
    const result = await prisma.someTable.findMany({
      where: { /* conditions */ },
    });

    console.log(`Found ${result.length} items`);

    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < result.length; i += batchSize) {
      const batch = result.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}...`);

      // Process batch
      await Promise.all(batch.map(item => {
        // Process each item
      }));
    }

    console.log("Script completed successfully!");
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### Best Practices

1. **Always use batch processing** for large datasets
2. **Add progress logging** for visibility
3. **Include error handling** with meaningful messages
4. **Disconnect database** in finally block
5. **Add dry-run mode** for destructive operations
6. **Log before/after statistics** for auditing

---

## Script Execution Checklist

Before running any script in production:

- [ ] Verify you're connected to the correct database
- [ ] Take database backup if script is destructive
- [ ] Test script on staging/dev first
- [ ] Review script logic and parameters
- [ ] Check current system load
- [ ] Notify team if script affects live data
- [ ] Monitor script progress
- [ ] Verify results after completion

---

## SEO Agent Scripts

The SEO Agent is a separate automated system located in `/src/lib/seo-agent/`. See [CRON_JOBS.md](./CRON_JOBS.md) for details on the SEO agent cron job.

### Agent Components

| File | Purpose |
|------|---------|
| `technical-audit.ts` | Technical SEO analysis |
| `content-optimizer.ts` | Content quality analysis |
| `blog-generator.ts` | Blog topic generation |
| `report-generator.ts` | Report compilation |
| `index.ts` | Module exports |

These run automatically via the `/api/cron/seo-agent` endpoint and don't require manual execution.

---

## Stripe & Subscription Scripts

### 4. check-payment-methods.ts

**Location:** `/scripts/check-payment-methods.ts`
**Runtime:** TypeScript (tsx)
**Lines:** ~95

**Purpose:**
Checks for duplicate payment methods attached to a Stripe customer and optionally removes them.

**What it does:**
1. Fetches all card payment methods for a customer
2. Identifies duplicates (same brand, last4, expiry)
3. Optionally removes duplicates, keeping the newest one

**When to use:**
- When a customer reports duplicate cards in billing portal
- After payment method issues are reported
- Periodic cleanup of customer accounts

**How to run:**
```bash
# Check for duplicates (read-only)
npx tsx scripts/check-payment-methods.ts cus_abc123

# Remove duplicates (destructive)
npx tsx scripts/check-payment-methods.ts cus_abc123 --cleanup
```

**Arguments:**
- `<customer_id>` - Stripe customer ID (required, starts with `cus_`)
- `--cleanup` - Actually remove duplicates (default is read-only)

**Expected Output:**
```
=== Payment Methods for Customer ===

Customer ID: cus_abc123
Found 3 payment method(s):

  ID: pm_xxx
  Brand: amex
  Last 4: 1003
  Exp: 12/2027
  Created: 2026-01-29T...

=== DUPLICATE PAYMENT METHODS FOUND ===
Card: amex-1003-12/2027
Count: 2 duplicates

To clean up duplicates, run:
  npx tsx scripts/check-payment-methods.ts cus_abc123 --cleanup
```

---

### 5. update-billing-portal.ts

**Location:** `/scripts/update-billing-portal.ts`
**Runtime:** TypeScript (tsx)
**Lines:** ~110

**Purpose:**
Configures Stripe's Customer Billing Portal with proper upgrade/downgrade and cancellation settings.

**What it does:**
1. Updates billing portal configuration in Stripe
2. Enables subscription upgrades/downgrades between plans
3. Configures cancellation to occur at period end (not immediately)
4. Requires cancellation reasons from customers
5. Enables payment method updates and invoice history

**Features Configured:**
- **Subscription Update:** Pro ↔ Enterprise with proration
- **Cancellation:** At period end, with reason required
- **Payment Methods:** Update enabled
- **Invoice History:** Enabled
- **Customer Info:** Email, address, phone, name updates

**When to use:**
- Initial setup of billing portal
- After adding new subscription plans
- When changing cancellation policies

**How to run:**
```bash
npx tsx scripts/update-billing-portal.ts
```

**Expected Output:**
```
=== Updating Billing Portal Configuration ===

Config ID: bpc_xxx

✓ Configuration updated successfully!

Features enabled:
  - Subscription upgrade/downgrade between Pro and Enterprise
  - Cancellation at period end (keeps access until billing cycle ends)
  - Cancellation reasons required
  - Payment method updates
  - Invoice history
  - Customer info updates
```

**Prerequisites:**
- `STRIPE_SECRET_KEY` in `.env.local`
- Valid product and price IDs in script

---

### 6. fix-user-subscription.ts

**Location:** `/scripts/fix-user-subscription.ts`
**Runtime:** TypeScript (tsx)
**Lines:** ~200

**Purpose:**
Fixes duplicate subscription issues by syncing the database with the correct Stripe subscription state.

**What it does:**
1. Finds all Stripe subscriptions for a customer
2. Identifies the highest-tier active subscription
3. Cancels duplicate subscriptions in Stripe (with `--cancel-duplicates`)
4. Syncs database to match the correct subscription (with `--fix`)
5. Updates user's plan to match subscription

**When to use:**
- When a user has accidentally created multiple subscriptions
- After payment failures cause subscription state mismatches
- When database and Stripe are out of sync

**How to run:**
```bash
# Check current state (dry run)
npx tsx scripts/fix-user-subscription.ts user@example.com

# Apply fixes to database
npx tsx scripts/fix-user-subscription.ts user@example.com --fix

# Also cancel duplicates in Stripe
npx tsx scripts/fix-user-subscription.ts user@example.com --fix --cancel-duplicates
```

**Arguments:**
- `<email>` - User email address (required)
- `--fix` - Apply fixes (default is dry-run, read-only)
- `--cancel-duplicates` - Cancel duplicate subscriptions in Stripe

**Safety Measures:**
- Default is dry-run mode (shows what would happen)
- Preserves the highest-tier subscription
- Cancels duplicates at period end (user keeps access)
- Logs all actions for audit

---

### 7. test-cancellation-flow.ts

**Location:** `/scripts/test-cancellation-flow.ts`
**Runtime:** TypeScript (tsx)
**Lines:** ~180

**Purpose:**
Tests the subscription cancellation flow including email notifications.

**What it does:**
1. Simulates cancellation request via API
2. Verifies `cancel_at_period_end` is set correctly
3. Tests cancellation email template
4. Tests reactivation flow
5. Verifies reactivation email template

**When to use:**
- After implementing cancellation features
- Before deploying cancellation changes to production
- Testing email templates

**How to run:**
```bash
npx tsx scripts/test-cancellation-flow.ts
```

---

### 8. check-user-history.ts

**Location:** `/scripts/check-user-history.ts`
**Runtime:** TypeScript (tsx)
**Lines:** ~100

**Purpose:**
Displays complete subscription history and account status for a user.

**What it does:**
1. Fetches user profile from database
2. Retrieves subscription details
3. Shows Stripe subscription status
4. Lists payment history
5. Displays audit log entries

**When to use:**
- Debugging user account issues
- Investigating billing problems
- Customer support investigations

**How to run:**
```bash
npx tsx scripts/check-user-history.ts user@example.com
```

**Arguments:**
- `<email>` - User email address (required)

---

## Support Ticket Guidelines

When responding to support tickets via the admin dashboard:

### Do:
- Be professional and courteous
- Apologize for any inconvenience
- Provide clear step-by-step directions
- Ask users to refresh the page
- Point users to the correct feature/location

### Don't:
- Reveal internal system details
- Mention bugs or code fixes
- Use technical jargon
- Share staff member names (use "GhostMyData Support")
- Admit to system failures

### Example Response:
```
Hi there,

Thank you for reaching out! We apologize for any inconvenience.

Please refresh your page and you'll find the [Feature] in the [Location].

**To [do the thing]:**
1. Go to **Dashboard → [Section]**
2. Look for the **"[Feature Name]"** at the top
3. [Additional steps...]

If you have any other questions, we're happy to help!

Best regards,
GhostMyData Support Team
```
