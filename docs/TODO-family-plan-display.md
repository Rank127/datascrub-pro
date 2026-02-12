# TODO: Family Member Plan Display Issue

## Issue
Family members of Enterprise plans are showing as "FREE" instead of "ENTERPRISE" in the admin dashboard, even after the fix to `/api/admin/executive-stats/route.ts`.

## Affected Users (Examples)
- `sgmgsg@hotmail.com` - Manisha Gupta (shows FREE, should be ENTERPRISE)
- `suhanigupta97@gmail.com` - Suhani Gupta (shows FREE, should be ENTERPRISE)

## Fix Applied (Commit a241005)
Updated `/src/app/api/admin/executive-stats/route.ts`:
- Added `calculateEffectivePlan()` helper function
- Modified `recentSignups` query to include `familyMembership` data
- Modified `topUsersByActivity` query to include `familyMembership` data
- Both now return effective plan based on family group owner's subscription

## Still Not Working
After Ctrl+Shift+R (hard refresh), users still display as FREE.

## Next Steps to Investigate
1. **Check deployment** - Verify Vercel deployment completed successfully
2. **Check which component/API** - The admin dashboard may use a different endpoint:
   - `/api/admin/users` - Already has `effectivePlan` calculation
   - `/api/admin/executive-stats` - Fixed in commit a241005
   - There may be another endpoint or the frontend component may not be using the correct field
3. **Check frontend component** - `src/components/dashboard/executive/user-activities-section.tsx`:
   - Lines 193, 317, 455 use `user.plan` directly
   - May need to verify it's receiving the calculated effective plan
4. **Database check** - Verify the family membership data exists for these users:
   ```sql
   SELECT u.email, u.plan, fm.id as membership_id, fg.ownerId,
          owner.email as owner_email, s.plan as owner_plan
   FROM "User" u
   LEFT JOIN "FamilyMember" fm ON fm."userId" = u.id
   LEFT JOIN "FamilyGroup" fg ON fg.id = fm."familyGroupId"
   LEFT JOIN "User" owner ON owner.id = fg."ownerId"
   LEFT JOIN "Subscription" s ON s."userId" = owner.id
   WHERE u.email IN ('sgmgsg@hotmail.com', 'suhanigupta97@gmail.com');
   ```

## Date
February 6, 2026
