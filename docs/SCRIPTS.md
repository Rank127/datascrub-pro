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
