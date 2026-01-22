# GhostMyData - Deployment Guide

Total time: ~15 minutes | Total cost: $0 to start

---

## Step 1: Create GitHub Account (if needed)
**Time: 2 min**

1. Go to https://github.com
2. Click "Sign up"
3. Use your email, create password
4. Verify email

---

## Step 2: Create Supabase Database (FREE)
**Time: 3 min**

1. Go to https://supabase.com
2. Click "Start your project" → Sign in with GitHub
3. Click "New Project"
   - Name: `ghostmydata`
   - Database Password: **SAVE THIS** (you'll need it)
   - Region: Choose closest to you
   - Click "Create new project"
4. Wait ~2 min for project to initialize
5. Go to **Project Settings** (gear icon) → **Database**
6. Scroll to "Connection string" section
7. Copy both:
   - **Transaction mode** (port 6543) → This is your `DATABASE_URL`
   - **Session mode** (port 5432) → This is your `DIRECT_URL`
8. Replace `[YOUR-PASSWORD]` with the password you created

---

## Step 3: Create Vercel Account (FREE)
**Time: 2 min**

1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel

---

## Step 4: Push Code to GitHub
**Time: 3 min**

Run these commands in your terminal:

```bash
cd /path/to/datascrub-pro

# Initialize git
git init
git add .
git commit -m "Initial commit - GhostMyData"

# Create GitHub repo (you'll need GitHub CLI or do it manually)
# Option A: GitHub CLI
gh repo create datascrub-pro --private --source=. --push

# Option B: Manual
# 1. Go to github.com → New Repository
# 2. Name: datascrub-pro
# 3. Private
# 4. Don't initialize with README
# 5. Copy the commands shown and run them
```

---

## Step 5: Deploy to Vercel
**Time: 5 min**

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Find `ghostmydata` → Click "Import"
4. **Configure Environment Variables** (click to expand):

   Add these variables:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Supabase transaction URL |
   | `DIRECT_URL` | Your Supabase session URL |
   | `AUTH_SECRET` | Run: `openssl rand -base64 32` |
   | `AUTH_URL` | `https://your-project.vercel.app` (update after deploy) |
   | `ENCRYPTION_KEY` | Run: `openssl rand -hex 32` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
   | `NEXT_PUBLIC_APP_NAME` | `GhostMyData` |

5. Click "Deploy"
6. Wait 2-3 minutes for build

---

## Step 6: Run Database Migration
**Time: 1 min**

After deploy, in your terminal:

```bash
# Set your production database URL
export DATABASE_URL="your-supabase-url-here"
export DIRECT_URL="your-supabase-direct-url-here"

# Run migration
npx prisma db push
```

Or use Vercel CLI:
```bash
vercel env pull .env.local
npx prisma db push
```

---

## Step 7: Add Custom Domain (Optional)
**Time: 5 min**

1. Buy domain from:
   - Namecheap (~$10/year)
   - Cloudflare (~$9/year)
   - Google Domains (~$12/year)

2. In Vercel Dashboard:
   - Go to your project → Settings → Domains
   - Add your domain
   - Follow DNS instructions shown

3. Update environment variables:
   - `AUTH_URL` = `https://yourdomain.com`
   - `NEXT_PUBLIC_APP_URL` = `https://yourdomain.com`

---

## Quick Reference: Generate Secrets

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 32
```

---

## Checklist

- [ ] GitHub account created
- [ ] Supabase project created
- [ ] Database URLs copied
- [ ] Vercel account created
- [ ] Code pushed to GitHub
- [ ] Project deployed to Vercel
- [ ] Environment variables set
- [ ] Database migrated
- [ ] (Optional) Custom domain added

---

## Your URLs

After deployment:
- **App**: `https://ghostmydata-xxx.vercel.app` (or your custom domain)
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/[PROJECT-ID]`
- **Vercel Dashboard**: `https://vercel.com/[USERNAME]/ghostmydata`

---

## Monthly Costs

| Service | Cost |
|---------|------|
| Vercel | $0 (free tier) |
| Supabase | $0 (free tier) |
| Domain | ~$1/month |
| HIBP API | $3.50/month (optional) |
| **Total** | **~$5/month** |

---

## Next Steps After Deploy

1. Register your first account
2. Add your profile information
3. Run a scan
4. Set up Stripe for payments (when ready)
5. Add HIBP API key for real breach data

---

## Troubleshooting

**Build fails on Vercel:**
- Check environment variables are all set
- Check DATABASE_URL format is correct

**Database connection error:**
- Verify password has no special characters that need escaping
- Use the pooler URL (port 6543) for DATABASE_URL

**Auth not working:**
- Make sure AUTH_URL matches your actual domain
- Redeploy after changing AUTH_URL

---

Need help? Check the logs in Vercel Dashboard → Deployments → [Latest] → View Logs
