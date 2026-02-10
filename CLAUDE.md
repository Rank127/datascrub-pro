# CLAUDE.md — Project Context for Claude Code

## Project Overview
- **App**: GhostMyData / DataScrub Pro v2 — data privacy platform
- **Stack**: Next.js, Prisma ORM, PostgreSQL, Vercel hosting
- **Repo**: https://github.com/Rank127/datascrub-pro.git (HTTPS, not SSH)
- **Deploy**: Push to `main` triggers Vercel build (~2min)

## Git Setup
- SSH keys not configured on this machine; always use HTTPS remote URL
- Remote origin: `https://github.com/Rank127/datascrub-pro.git`

## Architecture: Admin Dashboard
The admin dashboard has 6+ independent sections, each with its own user table and API calls:
- `src/components/dashboard/executive/user-management-section.tsx` — User Management tab (uses `/api/admin/users`)
- `src/components/dashboard/executive/user-activities-section.tsx` — Activities tab (uses `/api/admin/executive-stats`)
- `src/components/dashboard/executive/operations-section.tsx` — Operations tab (uses `/api/admin/users`)
- `src/components/dashboard/executive/finance-section.tsx` — Finance tab (uses `/api/admin/users`)
- `src/components/dashboard/integrations/database-section.tsx` — Database tab (uses `/api/admin/integrations/database/users`)

**Important**: When modifying user plan display or any user-level field, check ALL sections — a fix to one component does not apply to the others.

## Family Plan System
- `FamilyGroup` has one owner (Enterprise subscriber), up to 5 members
- `FamilyMember` record links user to group (created on invite acceptance)
- `FamilyInvitation` has 7-day expiry, status: PENDING/ACCEPTED/EXPIRED/CANCELLED
- Users inherit ENTERPRISE plan through family membership. Raw `user.plan` in DB may be FREE while effective plan is ENTERPRISE.
- Always use `effectivePlan` when displaying plan info (never raw `user.plan` alone)

### API Endpoints Returning Plan Data
- `/api/admin/users` — returns both `plan` and `effectivePlan` (with `planSource`, `familyOwner`, `familyGroupInfo`)
- `/api/admin/executive-stats` — overwrites `plan` field directly with effective value via `calculateEffectivePlan()`
- `/api/admin/integrations/database/users` — returns both `plan` and `effectivePlan`

### Known Issue (Fixed Feb 2026)
Invite acceptance can silently fail, leaving invitation PENDING with no FamilyMember record. When debugging family plan issues, always check both the invitation status AND the familyMembership record in the database.

## Key Users (Production)
- **Family Owner**: sandeepgupta@bellsouth.net (Sandeep Gupta) — ENTERPRISE
- **Family Members**: sgmgsg@hotmail.com (Manisha Gupta), suhanigupta97@gmail.com (Suhani Gupta)
