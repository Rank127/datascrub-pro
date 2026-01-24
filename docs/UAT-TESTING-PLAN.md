# GhostMyData - User Acceptance Testing (UAT) Plan

## Document Information
- **Application**: GhostMyData - Personal Data Removal Service
- **Version**: 1.0.0
- **Production URL**: https://ghostmydata.com
- **Development**: http://localhost:3000
- **Last Updated**: January 2026

---

## 1. Executive Summary

This UAT plan covers comprehensive testing of all user-facing features of GhostMyData, a personal data removal service that helps users find and remove their personal information from data brokers, breach databases, dark web, and social media platforms.

### Testing Objectives
1. Verify all user workflows function as expected
2. Validate data integrity and security measures
3. Ensure UI/UX meets design specifications
4. Confirm business logic operates correctly
5. Test edge cases and error handling

---

## 2. Test Environment Setup

### Prerequisites
- [ ] Development server running (`npm run dev`)
- [ ] Database initialized with Prisma (`npx prisma db push`)
- [ ] Environment variables configured (`.env`)
- [ ] Modern browser (Chrome, Firefox, Safari, or Edge)

### Test Data Requirements
- Multiple test email addresses
- Test phone numbers
- Sample addresses (current and previous)
- Test usernames for social media

---

## 3. Test Scenarios

### 3.1 Marketing Pages (Public)

#### TC-M01: Landing Page
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to http://localhost:3001 | Landing page loads with hero section | |
| 2 | Verify navigation links | "How It Works", "Pricing" links visible | |
| 3 | Click "Get Started" button | Redirects to /register | |
| 4 | Click "Sign In" button | Redirects to /login | |
| 5 | Scroll down page | Stats, features, pricing preview visible | |
| 6 | Verify footer links | All links functional | |

#### TC-M02: Pricing Page
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /pricing | Pricing page loads | |
| 2 | Verify 3 plan cards | Free, Pro, Enterprise displayed | |
| 3 | Verify feature lists | All features listed correctly | |
| 4 | Click "Get Started" on Free | Redirects to /register | |
| 5 | Click "Start Free Trial" on Pro | Redirects to /register | |
| 6 | Verify FAQ section | All FAQs expandable and readable | |

#### TC-M03: How It Works Page
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /how-it-works | Page loads with 5 steps | |
| 2 | Verify step progression | Steps 1-5 clearly numbered | |
| 3 | Verify guarantees section | 3 guarantee cards visible | |
| 4 | Click CTA button | Redirects to /register | |

---

### 3.2 Authentication

#### TC-A01: User Registration
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /register | Registration form displays | |
| 2 | Leave all fields empty, submit | Validation errors shown | |
| 3 | Enter invalid email format | "Invalid email" error | |
| 4 | Enter password < 8 chars | "At least 8 characters" error | |
| 5 | Enter mismatched passwords | "Passwords do not match" error | |
| 6 | Don't check terms checkbox | "Accept terms" error | |
| 7 | Fill valid data, submit | Success, redirects to /login | |
| 8 | Try registering same email | "Account already exists" error | |

**Test Data:**
- Name: `Test User`
- Email: `testuser@example.com`
- Password: `TestPass123!`

#### TC-A02: User Login
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /login | Login form displays | |
| 2 | Submit empty form | Validation errors shown | |
| 3 | Enter wrong email | "Invalid email or password" error | |
| 4 | Enter wrong password | "Invalid email or password" error | |
| 5 | Enter valid credentials | Success, redirects to /dashboard | |
| 6 | Verify session persists | Refresh page, still logged in | |

#### TC-A03: Forgot Password
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /forgot-password | Reset form displays | |
| 2 | Enter email, submit | Success message shown | |
| 3 | Click "Back to login" | Redirects to /login | |

#### TC-A04: Logout
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | From dashboard, click user menu | Dropdown appears | |
| 2 | Click "Sign out" | Logged out, redirects to / | |
| 3 | Try accessing /dashboard | Redirects to /login | |

#### TC-A05: Protected Routes
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Logout, navigate to /dashboard | Redirects to /login | |
| 2 | Navigate to /dashboard/profile | Redirects to /login | |
| 3 | Login, navigate to /login | Redirects to /dashboard | |

---

### 3.3 Dashboard Overview

#### TC-D01: Dashboard Home
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Login and view /dashboard | Dashboard loads | |
| 2 | Verify welcome message | Shows user's first name | |
| 3 | Verify risk score display | Circular score indicator visible | |
| 4 | Verify stat cards | 6 cards: Risk Score, Active, Submitted, Removed, Manual Actions, Whitelisted | |
| 5 | Verify Submitted card | Shows total removal requests, purple icon | |
| 6 | Verify Manual Actions card | Shows done/total count, amber icon | |
| 7 | Verify removal progress | Progress bars display | |
| 8 | Verify recent exposures | Exposure cards visible | |
| 9 | Click "Start New Scan" | Navigates to /dashboard/scan | |
| 10 | Click "View all" exposures | Navigates to /dashboard/exposures | |
| 11 | Click Manual Actions card | Navigates to /dashboard/exposures?manualAction=pending | |
| 12 | Click Submitted card | Navigates to /dashboard/removals | |

#### TC-D02: Sidebar Navigation
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Verify all nav items | 9 items visible in sidebar | |
| 2 | Click "Dashboard" | Navigates to /dashboard | |
| 3 | Click "My Profile" | Navigates to /dashboard/profile | |
| 4 | Click "Scan" | Navigates to /dashboard/scan | |
| 5 | Click "Exposures" | Navigates to /dashboard/exposures | |
| 6 | Click "Whitelist" | Navigates to /dashboard/whitelist | |
| 7 | Click "Removals" | Navigates to /dashboard/removals | |
| 8 | Click "Alerts" | Navigates to /dashboard/alerts | |
| 9 | Click "Reports" | Navigates to /dashboard/reports | |
| 10 | Click "Settings" | Navigates to /dashboard/settings | |
| 11 | Verify active state | Current page highlighted | |

#### TC-D03: Mobile Responsiveness
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Resize to mobile width (<768px) | Sidebar collapses | |
| 2 | Click hamburger menu | Sidebar slides out | |
| 3 | Click nav item | Navigates and closes sidebar | |
| 4 | Click outside sidebar | Sidebar closes | |

---

### 3.4 Profile Management

#### TC-P01: Basic Information Tab
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/profile | Profile page loads | |
| 2 | Verify tabs | 5 tabs visible | |
| 3 | Enter full name | Text input accepts value | |
| 4 | Add alias, press Enter | Alias added as tag | |
| 5 | Add multiple aliases | All aliases displayed | |
| 6 | Click X on alias | Alias removed | |

#### TC-P02: Contact Information Tab
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Contact" tab | Contact form displays | |
| 2 | Add email address | Email added as tag | |
| 3 | Add multiple emails | All emails displayed | |
| 4 | Add phone number | Phone added as tag | |
| 5 | Add multiple phones | All phones displayed | |
| 6 | Remove email/phone | Items removed correctly | |

#### TC-P03: Addresses Tab
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Addresses" tab | Address form displays | |
| 2 | Fill address fields | All fields accept input | |
| 3 | Click "Add Address" | Address added to list | |
| 4 | Add multiple addresses | All addresses displayed | |
| 5 | Remove address | Address removed from list | |

#### TC-P04: Sensitive Information Tab
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Sensitive" tab | Sensitive form displays | |
| 2 | Verify security notice | Encryption notice visible | |
| 3 | Enter date of birth | Date picker works | |
| 4 | Enter SSN | Input masked/hidden | |

#### TC-P05: Usernames Tab
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Usernames" tab | Username form displays | |
| 2 | Add username | Username added as tag | |
| 3 | Add multiple usernames | All usernames displayed | |
| 4 | Remove username | Username removed | |

#### TC-P06: Save Profile
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Add data to multiple tabs | Data entered | |
| 2 | Click "Save Profile" | Loading state shows | |
| 3 | Wait for save | Success message appears | |
| 4 | Refresh page | Data persists (future: verify) | |

---

### 3.5 Scanning

#### TC-S01: Scan Type Selection
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/scan | Scan page loads | |
| 2 | Verify 2 scan type cards | Quick and Full scan visible | |
| 3 | Full scan selected by default | Full scan card highlighted | |
| 4 | Click Quick scan card | Quick scan selected | |
| 5 | Click Full scan card | Full scan selected | |
| 6 | Verify feature lists | Correct features per scan type | |

#### TC-S02: Start Quick Scan
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Select Quick scan | Card highlighted | |
| 2 | Click "Start Quick Scan" | Progress bar appears | |
| 3 | Wait for completion | "Scan Complete" message | |
| 4 | Verify exposures found | Count displayed | |
| 5 | Verify sources checked | Count displayed | |
| 6 | Click "View Exposures" | Navigates to exposures | |

#### TC-S03: Start Full Scan
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Select Full scan | Card highlighted | |
| 2 | Click "Start Full Scan" | Progress bar appears | |
| 3 | Watch progress | Percentage increases | |
| 4 | Wait for completion | "Scan Complete" message | |
| 5 | Verify more exposures | More than quick scan | |
| 6 | Click "New Scan" | Form resets | |

#### TC-S04: Scan Without Profile
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Create new user (no profile) | User registered | |
| 2 | Try starting scan | Error message shown | |
| 3 | Message links to profile | Link navigates to /profile | |

#### TC-S05: Scan History
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Complete multiple scans | Scans finish | |
| 2 | View "Recent Scans" section | All scans listed | |
| 3 | Verify scan details | Type, date, exposures shown | |
| 4 | Verify status icons | Completed = green check | |

---

### 3.6 Exposures Management

#### TC-E01: View Exposures List
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/exposures | Exposures page loads | |
| 2 | Verify stat cards | Total, Critical, High, Removed | |
| 3 | Verify exposure cards | All exposures displayed | |
| 4 | Verify card details | Source, type, severity, date | |
| 5 | Verify severity badges | Color-coded correctly | |
| 6 | Verify status badges | Status displayed | |

#### TC-E02: Filter Exposures
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click Status dropdown | Options appear | |
| 2 | Select "Active" | Only active shown | |
| 3 | Select "Whitelisted" | Only whitelisted shown | |
| 4 | Click Severity dropdown | Options appear | |
| 5 | Select "Critical" | Only critical shown | |
| 6 | Combine filters | Both filters applied | |
| 7 | Select "All" for both | All exposures shown | |

#### TC-E03: Pagination
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Generate 25+ exposures | Many exposures exist | |
| 2 | Verify page indicator | "Page 1 of X" shown | |
| 3 | Click next page | Page 2 loads | |
| 4 | Click previous page | Page 1 loads | |
| 5 | First page, prev disabled | Button disabled | |
| 6 | Last page, next disabled | Button disabled | |

#### TC-E04: Whitelist from Exposure
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find active exposure | Card with whitelist icon | |
| 2 | Click whitelist icon | Exposure whitelisted | |
| 3 | Verify status change | Badge shows "WHITELISTED" | |
| 4 | Check whitelist page | Item appears there | |

#### TC-E05: Request Removal
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find active exposure | Card with trash icon | |
| 2 | Click remove icon | Removal requested | |
| 3 | Verify status change | Badge shows "REMOVAL_PENDING" | |
| 4 | Check removals page | Request appears there | |

#### TC-E06: External Link
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find exposure with URL | Card with link icon | |
| 2 | Click external link | Opens in new tab | |
| 3 | Verify URL correct | Matches source URL | |

#### TC-E07: Manual Action Filter
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click Manual Action dropdown | Options appear | |
| 2 | Select "Requires Action" | Only manual action items shown | |
| 3 | Select "Action Pending" | Only pending manual actions shown | |
| 4 | Select "Action Done" | Only completed manual actions shown | |
| 5 | Select "All" | All exposures shown | |
| 6 | Combine with Status filter | Both filters applied correctly | |

#### TC-E08: Mark Manual Action Done
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find exposure requiring manual action | Card shows "Mark Done" button | |
| 2 | Click "Mark Done" | Button changes to "Undo" | |
| 3 | Verify stats update | Manual Actions card shows updated count | |
| 4 | Filter by "Action Done" | Item appears in filtered list | |
| 5 | Click "Undo" | Button changes back to "Mark Done" | |
| 6 | Verify stats update | Count decreases by 1 | |

#### TC-E09: Submitted for Removal Card
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | View stats cards on Exposures page | "Submitted" card visible (purple) | |
| 2 | Request removal for exposure | Submitted count increases | |
| 3 | Click Submitted card | Navigates to /dashboard/removals | |

#### TC-E10: Opt-Out URL Priority
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find manual action exposure | External link visible | |
| 2 | Click external link | Opens opt-out form (not search page) | |
| 3 | Verify URL is actionable | Direct link to removal/privacy form | |

---

### 3.7 Whitelist Management

#### TC-W01: View Whitelist
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/whitelist | Whitelist page loads | |
| 2 | Verify info card | Explanation visible | |
| 3 | Verify item count | Correct number shown | |
| 4 | Verify item details | Source, name, date | |

#### TC-W02: Add to Whitelist
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Add to Whitelist" | Dialog opens | |
| 2 | Select source type | Dropdown works | |
| 3 | Enter account name | Text accepted | |
| 4 | Enter URL (optional) | Text accepted | |
| 5 | Enter reason (optional) | Text accepted | |
| 6 | Click "Add to Whitelist" | Dialog closes, item added | |
| 7 | Try adding without source | Validation error | |
| 8 | Try adding without name | Validation error | |

#### TC-W03: Remove from Whitelist
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find whitelisted item | Item in list | |
| 2 | Click trash icon | Item removed | |
| 3 | Verify list updated | Item no longer shown | |
| 4 | Check exposures page | Status changed to Active | |

#### TC-W04: External Link
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Add item with URL | Item created | |
| 2 | Click external link | Opens in new tab | |

---

### 3.8 Removal Requests

#### TC-R01: View Removals
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/removals | Removals page loads | |
| 2 | Verify stat cards | Total, Completed, In Progress, Needs Attention | |
| 3 | Verify progress bar | Overall progress shown | |
| 4 | Verify removal cards | All requests displayed | |

#### TC-R02: Removal Status Display
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Verify status badges | Correct colors per status | |
| 2 | Verify method shown | AUTO_FORM, AUTO_EMAIL, etc. | |
| 3 | Verify submission date | Date displayed | |
| 4 | Verify attempt count | Number shown | |

#### TC-R03: Manual Action Required
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find "Manual Action" item | Status = REQUIRES_MANUAL | |
| 2 | Verify instructions | Step-by-step guide shown | |
| 3 | Verify visual indicator | Orange warning styling | |

#### TC-R04: Refresh Removals
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Refresh" button | Loading state | |
| 2 | Wait for completion | List updated | |

---

### 3.9 Alerts

#### TC-AL01: View Alerts
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/alerts | Alerts page loads | |
| 2 | Verify unread count | Badge shows count | |
| 3 | Verify alert cards | All alerts displayed | |
| 4 | Verify alert types | Different icons per type | |
| 5 | Verify timestamps | Relative time shown | |

#### TC-AL02: Mark as Read
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Find unread alert | "New" badge visible | |
| 2 | Click alert | Alert marked as read | |
| 3 | Verify badge removed | No longer shows "New" | |
| 4 | Verify styling change | Less prominent background | |

#### TC-AL03: Mark All as Read
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Have multiple unread | Unread count > 1 | |
| 2 | Click "Mark all as read" | All marked read | |
| 3 | Verify count updated | "0 unread alerts" | |
| 4 | Button disappears | No longer shown | |

---

### 3.10 Reports

#### TC-RP01: View Reports
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/reports | Reports page loads | |
| 2 | Verify summary stats | 4 stat cards visible | |
| 3 | Verify progress bars | Protection progress shown | |
| 4 | Verify monthly reports | Report list displayed | |

#### TC-RP02: Report Details
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | View report card | Period, date visible | |
| 2 | Verify stats shown | New, Removed, Score change | |
| 3 | Verify trend indicators | Up/down arrows correct | |

#### TC-RP03: Export Report
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click download icon | Download initiates (mock) | |
| 2 | Click "Export All" | Export initiates (mock) | |

---

### 3.11 Settings

#### TC-ST01: Account Settings
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to /dashboard/settings | Settings page loads | |
| 2 | Verify current name/email | Pre-filled with user data | |
| 3 | Edit name | Text changes | |
| 4 | Click "Save Changes" | Success feedback | |

#### TC-ST02: Notification Settings
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | View notification section | Checkboxes displayed | |
| 2 | Toggle email notifications OFF | All sub-options disabled | |
| 3 | Toggle email notifications ON | Sub-options enabled | |
| 4 | Toggle individual options | State changes saved | |

#### TC-ST03: Subscription Display
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | View subscription section | 3 plans displayed | |
| 2 | Verify current plan badge | "Current" on FREE | |
| 3 | Verify upgrade buttons | On non-current plans | |
| 4 | Click upgrade button | (Mock) upgrade flow | |

#### TC-ST04: Security Settings
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | View security section | Options displayed | |
| 2 | Click "Change Password" | (Mock) password flow | |
| 3 | Click "Enable 2FA" | (Mock) 2FA flow | |
| 4 | Click "Delete Account" | (Mock) delete flow | |

---

### 3.12 Header & Navigation

#### TC-H01: Header Elements
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Verify notification bell | Bell icon visible | |
| 2 | Verify notification count | Badge shows count | |
| 3 | Click notification bell | Navigates to alerts | |
| 4 | Verify user avatar | Shows initials or image | |

#### TC-H02: User Dropdown
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click user avatar | Dropdown opens | |
| 2 | Verify user info | Name and email shown | |
| 3 | Click "My Profile" | Navigates to profile | |
| 4 | Click "Settings" | Navigates to settings | |
| 5 | Click "Sign out" | Logs out user | |

---

## 4. Non-Functional Testing

### 4.1 Performance Testing
| Test | Criteria | Pass/Fail |
|------|----------|-----------|
| Page load time | < 3 seconds | |
| Scan completion | < 30 seconds | |
| API response time | < 500ms | |
| No memory leaks | Stable after 10 min use | |

### 4.2 Security Testing
| Test | Criteria | Pass/Fail |
|------|----------|-----------|
| Passwords hashed | Not stored in plain text | |
| PII encrypted | AES-256 encryption used | |
| Session security | JWT tokens used | |
| Protected routes | Redirect to login | |
| HTTPS ready | No mixed content | |

### 4.3 Accessibility Testing
| Test | Criteria | Pass/Fail |
|------|----------|-----------|
| Keyboard navigation | All elements accessible | |
| Screen reader | Labels present | |
| Color contrast | WCAG AA compliant | |
| Focus indicators | Visible focus states | |

### 4.4 Browser Compatibility
| Browser | Version | Pass/Fail |
|---------|---------|-----------|
| Chrome | Latest | |
| Firefox | Latest | |
| Safari | Latest | |
| Edge | Latest | |

### 4.5 Mobile Responsiveness
| Breakpoint | Test | Pass/Fail |
|------------|------|-----------|
| 320px (mobile) | Layout correct | |
| 768px (tablet) | Layout correct | |
| 1024px (desktop) | Layout correct | |
| 1440px (large) | Layout correct | |

---

## 5. Test Execution Checklist

### Pre-Test
- [ ] Clean database (optional: `npx prisma db push --force-reset`)
- [ ] Start development server
- [ ] Clear browser cache
- [ ] Open browser DevTools for error monitoring

### During Test
- [ ] Screenshot any failures
- [ ] Note exact steps to reproduce issues
- [ ] Check browser console for errors
- [ ] Monitor network requests

### Post-Test
- [ ] Document all findings
- [ ] Categorize bugs by severity
- [ ] Create tickets for issues
- [ ] Sign off on passed tests

---

## 6. Bug Severity Levels

| Level | Description | Example |
|-------|-------------|---------|
| **Critical** | App unusable, data loss | Cannot login, scan crashes |
| **High** | Major feature broken | Whitelist doesn't save |
| **Medium** | Feature works with issues | Filter resets on navigation |
| **Low** | Minor/cosmetic issues | Typo in label |

---

## 7. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Product Owner | | | |
| Developer | | | |

---

## 8. Appendix

### A. Test Account Credentials
```
Email: testuser@example.com
Password: TestPass123!
```

### B. Quick Commands
```bash
# Start dev server
npm run dev

# Reset database
npx prisma db push --force-reset

# Generate Prisma client
npx prisma generate
```

### C. Known Limitations
1. Mock data used for some scanners (HIBP is real, others simulated)
2. 2FA not implemented
3. Some dark web scanners use simulated data

### D. Implemented Features (Production Ready)
1. Email notifications via Resend (all types working)
2. Stripe payments fully integrated (checkout, portal, webhooks)
3. Password reset with email tokens
4. Refund processing with automated emails
5. SEO optimizations (sitemap, RSS, OG images, structured data)
