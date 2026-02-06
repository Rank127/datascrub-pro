# GhostMyData Mobile App - Technical Specification

*Document Created: February 6, 2026*
*Status: Ready for Development*

---

## Executive Summary

This document provides the complete technical specification for launching GhostMyData on iOS and Android, including infrastructure, toolstack, costs, legal compliance, and competitive analysis.

**Key Opportunity:** Most competitors (DeleteMe, Incogni, Optery) do NOT have dedicated mobile apps. They rely on web dashboards only. This is a significant market gap.

---

## Table of Contents

1. [Market Research & Competitor Analysis](#1-market-research--competitor-analysis)
2. [Legal & Compliance Requirements](#2-legal--compliance-requirements)
3. [Existing Infrastructure (What We Have)](#3-existing-infrastructure-what-we-have)
4. [Technology Stack](#4-technology-stack)
5. [Cost Breakdown](#5-cost-breakdown)
6. [Development Phases](#6-development-phases)
7. [Security Requirements](#7-security-requirements)
8. [App Store Requirements](#8-app-store-requirements)
9. [Launch Checklist](#9-launch-checklist)
10. [Risk Assessment](#10-risk-assessment)

---

## 1. Market Research & Competitor Analysis

### Competitor Mobile App Status

| Competitor | Mobile App | Platform | Notes |
|------------|------------|----------|-------|
| **DeleteMe** | NO | Web only | Founded 2010, no app despite 850+ broker coverage |
| **Incogni** | NO | Web only | Surfshark subsidiary, bundles with VPN but no dedicated app |
| **Optery** | NO | Web only | Most expensive, no mobile presence |
| **Aura** | YES | iOS + Android | All-in-one suite (VPN, antivirus, identity) |
| **LifeLock** | YES | iOS + Android | Part of Norton, identity protection focus |
| **Privacy Bee** | NO | Web only | 980+ brokers, no app |
| **Kanary** | YES | iOS + Android | Mobile-first, but limited to 300 brokers |

**Source:** [Security.org - Best Data Removal Services 2026](https://www.security.org/data-removal/best/)

### Competitive Advantage

GhostMyData mobile app would be one of the **first dedicated data removal apps** in the market:

| Feature | GhostMyData (Planned) | Kanary | Aura |
|---------|----------------------|--------|------|
| Primary Focus | Data removal | Data removal | All-in-one suite |
| Broker Coverage | 600+ | 300 | 200+ |
| AI Shield | Yes | No | No |
| Screenshot Proof | Yes | No | No |
| Push Notifications | Yes | Yes | Yes |
| Family Sharing | Yes | No | Yes |
| Price | $9.99/mo | $14.99/mo | $12/mo |

### Market Size

| Metric | Value | Source |
|--------|-------|--------|
| Privacy App Market (2026) | $7.99 billion | Industry reports |
| Growth Rate | 18.2% CAGR | |
| Adults concerned about privacy | 85% | |
| Adults using data removal | 6% | |
| Smartphone users globally | 6.8 billion | |

**Opportunity:** 85% concerned × 6% using = massive untapped market

---

## 2. Legal & Compliance Requirements

### App Store Privacy Requirements

#### Apple App Store (iOS)

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Privacy Policy URL | ✅ Have | Link to existing policy |
| App Privacy Details | ❌ Needed | Complete App Store Connect form |
| Privacy Nutrition Labels | ❌ Needed | Declare all data collection |
| App Tracking Transparency | ❌ Needed | Implement ATT prompt if tracking |
| Privacy Manifest | ❌ Needed | Required for certain APIs |
| Data deletion mechanism | ✅ Have | Account deletion exists |

**Source:** [Termly - Mobile App Privacy Policy](https://termly.io/resources/templates/app-privacy-policy/)

#### Google Play Store (Android)

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Privacy Policy URL | ✅ Have | Link on store listing |
| Data Safety Section | ❌ Needed | Complete Play Console form |
| Publicly accessible URL | ✅ Have | No PDF, active URL |
| In-app privacy link | ❌ Needed | Add to settings screen |
| Data deletion disclosure | ✅ Have | Document in policy |

**Source:** [Termly - Android Privacy Policy Requirements](https://termly.io/resources/articles/android-privacy-policy/)

### Privacy Law Compliance

#### GDPR (EU/UK Users)

| Requirement | Implementation |
|-------------|----------------|
| Lawful basis for processing | Consent + Legitimate interest (service delivery) |
| Right to access | `/api/account` - users can view their data |
| Right to rectification | `/api/profile` - users can update data |
| Right to erasure | Account deletion feature exists |
| Right to portability | Need to add data export feature |
| Consent mechanism | Implement granular consent on signup |
| Data breach notification | Existing alert system |

**Penalties:** Up to €20 million or 4% of global revenue

**Source:** [Usercentrics - App Privacy Guide](https://usercentrics.com/knowledge-hub/ultimate-guide-to-app-privacy/)

#### CCPA/CPRA (California Users)

| Requirement | Implementation |
|-------------|----------------|
| Right to know | Privacy policy + in-app disclosures |
| Right to delete | Account deletion exists |
| Right to opt-out | "Do Not Sell" link needed |
| Right to non-discrimination | Cannot penalize for exercising rights |
| Notice at collection | In-app consent flow |

**Penalties:** $2,500/unintentional violation, $7,500/intentional violation

**Source:** [CookieYes - Privacy Policy for App](https://www.cookieyes.com/blog/privacy-policy-for-app/)

#### Additional State Laws

| State | Law | Key Requirements |
|-------|-----|------------------|
| Virginia | VCDPA | Similar to CCPA, opt-out rights |
| Colorado | CPA | Universal opt-out mechanism |
| Connecticut | CTDPA | Consent for sensitive data |
| Utah | UCPA | Opt-out for targeted ads |

### Children's Privacy (COPPA)

| Requirement | Our Approach |
|-------------|--------------|
| Age restriction | 18+ service only |
| Age gate | Implement age verification at signup |
| No data from children | Block accounts under 18 |
| Privacy policy statement | "Not intended for children under 18" |

### Privacy Policy Updates Needed

Add to existing privacy policy:
- [ ] Mobile app specific data collection (device ID, push tokens)
- [ ] Biometric data handling (Face ID, fingerprint - stored locally)
- [ ] Analytics/crash reporting disclosures
- [ ] Third-party SDKs used in app
- [ ] Push notification data handling

---

## 3. Existing Infrastructure (What We Have)

### API Endpoints Ready for Mobile

**Authentication:**
```
POST /api/auth/[...nextauth]  - Login/logout
POST /api/auth/reset-password - Password reset
POST /api/auth/check-2fa      - 2FA status
POST /api/auth/verify-2fa     - 2FA verification
```

**Core Data:**
```
GET  /api/exposures           - List exposures (paginated, filtered)
PATCH /api/exposures          - Update exposure status
GET  /api/scan/status         - Scan progress
GET  /api/dashboard/stats     - Dashboard statistics
GET  /api/dashboard/trends    - Trends data
```

**Removals:**
```
POST /api/removals/request    - Request removal
POST /api/removals/bulk       - Bulk removal
GET  /api/removals/status     - Removal status
```

**Notifications:**
```
GET  /api/notifications       - Preferences
PATCH /api/notifications      - Update preferences
GET  /api/alerts              - User alerts
PATCH /api/alerts             - Mark read
```

**Account:**
```
GET  /api/account             - Account info
PATCH /api/account            - Update account
GET  /api/subscription        - Plan details
GET  /api/profile             - Personal profile
```

**Family:**
```
GET  /api/family              - Family group
POST /api/family/invite       - Invite member
```

### Database Models Ready

| Model | Mobile Use |
|-------|------------|
| User | Authentication, profile |
| Exposure | Main data display |
| RemovalRequest | Status tracking |
| Scan | Progress display |
| Subscription | Plan gating |
| Alert | Push notification source |
| PersonalProfile | Encrypted user data |
| FamilyGroup | Family features |

### External Services Integrated

| Service | Purpose | Mobile Impact |
|---------|---------|---------------|
| Stripe | Payments | Deep link to web for payment |
| Twilio | SMS | Already integrated |
| Resend | Email | No change needed |
| Anthropic | AI | Backend only |

### New Endpoint Needed

```typescript
// Store push notification token
POST /api/user/push-token
Body: { token: string, platform: 'ios' | 'android' }

// Remove push token on logout
DELETE /api/user/push-token
Body: { token: string }
```

---

## 4. Technology Stack

### Mobile App Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Expo SDK 52+ | Managed workflow, OTA updates |
| **Language** | TypeScript | Same as web app |
| **UI Framework** | React Native | Code sharing with web concepts |
| **Navigation** | Expo Router | File-based routing (like Next.js) |
| **State Management** | Zustand | Lightweight, TypeScript-friendly |
| **API Client** | Axios + React Query | Caching, offline support |
| **Auth Storage** | expo-secure-store | Encrypted token storage |
| **Push Notifications** | expo-notifications | Cross-platform push |
| **Biometrics** | expo-local-authentication | Face ID, fingerprint |
| **Analytics** | expo-analytics / Mixpanel | Usage tracking |
| **Crash Reporting** | Sentry | Error monitoring |

### Development Tools

| Tool | Purpose | Cost |
|------|---------|------|
| Expo CLI | Local development | Free |
| Expo Go | Testing on device | Free |
| EAS Build | Cloud builds | $99/mo (Production) |
| EAS Submit | Store submission | Included |
| EAS Update | OTA updates | Included |
| VS Code | IDE | Free |
| Xcode | iOS simulator | Free (Mac only) |
| Android Studio | Android emulator | Free |

### Backend Changes (Minimal)

```typescript
// New file: src/app/api/user/push-token/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token, platform } = await req.json();

  await prisma.pushToken.upsert({
    where: { token },
    create: { userId: session.user.id, token, platform },
    update: { userId: session.user.id, platform },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();

  await prisma.pushToken.delete({
    where: { token, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
```

```prisma
// Add to schema.prisma

model PushToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  String   // 'ios' | 'android'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

---

## 5. Cost Breakdown

### One-Time Setup Costs

| Item | Cost | Notes |
|------|------|-------|
| Apple Developer Account | $99 | Required for iOS |
| Google Play Developer | $25 | One-time fee |
| D-U-N-S Number | $0 | Free, 2-3 weeks to obtain |
| App icons/splash | $0-200 | DIY or hire designer |
| Privacy policy review | $0-500 | Legal review optional |
| **Total Setup** | **$124-824** | |

### Monthly Operating Costs

| Item | Monthly | Annual | Notes |
|------|---------|--------|-------|
| Apple Developer | $8.25 | $99 | Required annually |
| Expo EAS Production | $99 | $1,188 | Builds, updates, hosting |
| Sentry (errors) | $0-26 | $0-312 | Free tier: 5K errors/mo |
| Mixpanel (analytics) | $0-28 | $0-336 | Free tier: 20M events/mo |
| **Total Monthly** | **$107-161** | **$1,287-1,935** | |

**Source:** [Expo Pricing](https://expo.dev/pricing)

### Development Costs

| Approach | Cost Range | Timeline |
|----------|------------|----------|
| **DIY (you)** | $0 | 8-12 weeks |
| **Single freelancer** | $5,000-15,000 | 6-10 weeks |
| **Small agency** | $20,000-50,000 | 8-12 weeks |
| **Premium agency** | $50,000-150,000 | 10-16 weeks |

**Source:** [React Native App Development Cost](https://reactnativeexpert.com/blog/react-native-app-development-cost/)

### Annual Maintenance

| Item | Cost | Notes |
|------|------|-------|
| First year bugs/updates | 50% of dev cost | Industry standard |
| Ongoing maintenance | 15-20% of dev cost | Annual |
| OS compatibility updates | Included | iOS/Android updates |

**Source:** [Mobile App Development Cost 2026](https://supawire.com/insights/mobile-app-development-cost-2026)

### Total Year 1 Cost (DIY)

| Category | Cost |
|----------|------|
| Setup | $124 |
| Operating (12 months) | $1,287 |
| Development | $0 (your time) |
| **Total Year 1** | **~$1,411** |

### Total Year 1 Cost (Freelancer)

| Category | Cost |
|----------|------|
| Setup | $124 |
| Operating (12 months) | $1,287 |
| Development | $10,000 |
| **Total Year 1** | **~$11,411** |

---

## 6. Development Phases

### Phase 0: Setup (Week 1)

**Tasks:**
- [ ] Register Apple Developer Account
- [ ] Register Google Play Developer Account
- [ ] Apply for D-U-N-S Number (if needed)
- [ ] Set up Expo account
- [ ] Subscribe to EAS Production ($99/mo)
- [ ] Initialize Expo project
- [ ] Configure EAS Build

**Deliverables:**
- Expo project scaffolded
- Build pipeline working
- Test app on Expo Go

### Phase 1: MVP Core (Weeks 2-4)

**Authentication:**
- [ ] Login screen (email/password)
- [ ] Biometric login (Face ID, fingerprint)
- [ ] 2FA flow
- [ ] Password reset
- [ ] Secure token storage
- [ ] Auto-logout on inactivity

**Dashboard:**
- [ ] Protection score card
- [ ] Exposure count summary
- [ ] Quick stats (removed, pending, active)
- [ ] Recent activity feed

**Exposures:**
- [ ] Exposures list with filters
- [ ] Search functionality
- [ ] Exposure detail view
- [ ] Severity indicators
- [ ] Request removal button
- [ ] Pull-to-refresh

**Removals:**
- [ ] Removals list
- [ ] Status indicators (pending, in progress, completed)
- [ ] Removal detail view
- [ ] Screenshot proof display

### Phase 2: Notifications & Settings (Week 5)

**Push Notifications:**
- [ ] Permission request flow
- [ ] Token registration with backend
- [ ] Handle notification tap (deep link)
- [ ] Notification preferences sync

**Settings:**
- [ ] Account info display
- [ ] Notification preferences
- [ ] Plan/subscription info
- [ ] Privacy policy link
- [ ] Terms of service link
- [ ] Logout
- [ ] Delete account link (opens web)

### Phase 3: Polish & Submit (Week 6)

**UI/UX:**
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Offline indicator
- [ ] Dark mode support
- [ ] Accessibility labels

**App Store:**
- [ ] App icons (all sizes)
- [ ] Splash screen
- [ ] Screenshots (iPhone 6.7", 6.5", 5.5")
- [ ] Screenshots (Android phone, tablet)
- [ ] App description
- [ ] Keywords
- [ ] Privacy policy URL
- [ ] Submit to TestFlight
- [ ] Submit to Google Play Internal Testing

### Phase 4: Beta & Launch (Weeks 7-8)

**Beta Testing:**
- [ ] Internal team testing (1 week)
- [ ] Fix critical bugs
- [ ] Performance optimization
- [ ] Crash monitoring setup

**Launch:**
- [ ] Submit to App Store (1-7 day review)
- [ ] Submit to Google Play (1-3 day review)
- [ ] Monitor reviews and crashes
- [ ] Respond to user feedback

---

## 7. Security Requirements

### Authentication Security

| Requirement | Implementation |
|-------------|----------------|
| Token storage | expo-secure-store (encrypted) |
| Biometric auth | expo-local-authentication |
| Session timeout | 30-day token expiry |
| Token refresh | Silent refresh on app open |
| Logout cleanup | Clear all secure storage |

### Data Security

| Requirement | Implementation |
|-------------|----------------|
| HTTPS only | Enforce in API client |
| Certificate pinning | Optional (high security) |
| No sensitive data in logs | Strip tokens, PII from logs |
| Secure clipboard | Don't copy sensitive data |
| Screenshot protection | Optional blur on app switch |

### API Security

| Requirement | Implementation |
|-------------|----------------|
| Auth headers | Bearer token on all requests |
| Rate limiting | Existing backend limits |
| Request signing | Optional (future) |
| API versioning | /api/v1/* prefix (future) |

### Code Security

| Requirement | Implementation |
|-------------|----------------|
| No secrets in code | Use environment variables |
| Obfuscation | EAS Build includes basic obfuscation |
| Dependency audit | npm audit before release |
| Code signing | Apple/Google certificates |

---

## 8. App Store Requirements

### Apple App Store

#### Required Assets

| Asset | Specification |
|-------|---------------|
| App Icon | 1024×1024 PNG (no alpha) |
| Screenshots 6.7" | 1290×2796 or 2796×1290 (iPhone 15 Pro Max) |
| Screenshots 6.5" | 1284×2778 or 2778×1284 (iPhone 14 Plus) |
| Screenshots 5.5" | 1242×2208 or 2208×1242 (iPhone 8 Plus) |
| App Preview (optional) | 15-30 second video |

#### App Store Connect

| Field | Content |
|-------|---------|
| App Name | GhostMyData - Data Removal |
| Subtitle | Remove Your Personal Data |
| Promotional Text | Protect your privacy. Remove your data from 600+ data brokers. |
| Description | (See below) |
| Keywords | data removal,privacy,data broker,delete my data,opt out,personal data,identity protection |
| Category | Primary: Utilities, Secondary: Lifestyle |
| Age Rating | 17+ (references personal data) |
| Privacy Policy URL | https://ghostmydata.com/privacy |

#### Suggested Description

```
GhostMyData automatically removes your personal information from 600+ data broker websites.

FEATURES:
• Scan for your exposed data across hundreds of sites
• Automated removal requests sent on your behalf
• Real-time tracking of removal progress
• Push notifications for new exposures
• Screenshot proof of every removal
• AI Shield protection against deepfakes
• Family sharing for household protection

WHY GHOSTMYDATA:
Data brokers collect and sell your personal information - your name, address, phone number, email, and more. This data is used for spam, scams, and identity theft. GhostMyData finds where your data is exposed and automatically requests removal.

PLANS:
• Free: Monthly scan, manual removal tracking
• Pro ($9.99/mo): Unlimited automated removals, weekly scans
• Enterprise ($24.99/mo): Family coverage, priority support

Download now and take back control of your privacy.
```

### Google Play Store

#### Required Assets

| Asset | Specification |
|-------|---------------|
| App Icon | 512×512 PNG (32-bit) |
| Feature Graphic | 1024×500 PNG/JPG |
| Phone Screenshots | 16:9 or 9:16, min 320px, max 3840px |
| Tablet Screenshots | Same specs, 7" and 10" |
| TV Banner (optional) | 1280×720 PNG/JPG |

#### Data Safety Section

| Question | Answer |
|----------|--------|
| Does app collect data? | Yes |
| Data types collected | Personal info (name, email, phone), Account info |
| Is data encrypted in transit? | Yes |
| Can users request deletion? | Yes |
| Data shared with third parties? | No (except for service delivery) |

---

## 9. Launch Checklist

### Pre-Development
- [ ] Apple Developer Account registered
- [ ] Google Play Developer Account registered
- [ ] D-U-N-S Number obtained (if applicable)
- [ ] Expo account created
- [ ] EAS subscription activated
- [ ] Project initialized

### Development Complete
- [ ] All MVP features working
- [ ] Authentication flow tested
- [ ] Push notifications working
- [ ] Offline handling implemented
- [ ] Error boundaries in place
- [ ] Analytics integrated
- [ ] Crash reporting integrated

### Pre-Submission
- [ ] App icons created (all sizes)
- [ ] Screenshots captured (all sizes)
- [ ] App descriptions written
- [ ] Privacy policy updated for mobile
- [ ] Terms of service reviewed
- [ ] GDPR compliance verified
- [ ] CCPA compliance verified
- [ ] Internal testing complete
- [ ] Performance benchmarks met
- [ ] No critical bugs

### Submission
- [ ] TestFlight build uploaded
- [ ] Google Play internal track uploaded
- [ ] Beta testers invited
- [ ] Beta feedback collected
- [ ] Critical fixes applied
- [ ] App Store submission
- [ ] Google Play submission

### Post-Launch
- [ ] Monitor crash reports (Sentry)
- [ ] Monitor app reviews
- [ ] Respond to reviews (especially negative)
- [ ] Track download metrics
- [ ] Track engagement metrics
- [ ] Plan first update based on feedback
- [ ] ASO optimization based on data

---

## 10. Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| App Store rejection | Medium | High | Follow guidelines strictly, test thoroughly |
| Authentication issues | Low | Critical | Extensive testing, fallback to web |
| Push notification failures | Medium | Medium | Retry logic, email fallback |
| Performance on old devices | Medium | Medium | Test on iPhone 8, budget Androids |
| API rate limiting | Low | Medium | Implement exponential backoff |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low downloads | Medium | Medium | ASO, marketing, in-app prompts on web |
| Negative reviews | Medium | High | Quality testing, responsive support |
| Competitor launches app | Medium | Medium | First-mover advantage, unique features |
| Apple/Google policy changes | Low | High | Stay updated on guidelines |

### Legal Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Privacy law violation | Low | Critical | Legal review, compliance audit |
| User data breach | Low | Critical | Encryption, security audit |
| COPPA violation | Low | High | Age gate, 18+ restriction |
| App Store legal dispute | Low | Medium | Clear terms, responsive to issues |

---

## 11. Success Metrics

### Launch Goals (90 Days)

| Metric | Target |
|--------|--------|
| Total downloads | 1,000+ |
| Daily active users | 100+ |
| App Store rating | 4.5+ stars |
| Crash-free rate | 99.5%+ |
| Push opt-in rate | 60%+ |
| Conversion (free→paid) | 5%+ |

### Year 1 Goals

| Metric | Target |
|--------|--------|
| Total downloads | 10,000+ |
| Monthly active users | 2,000+ |
| Revenue from app | $50,000+ |
| App Store rating | 4.7+ stars |
| Reviews | 500+ |

---

## 12. Resources & References

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)

### Compliance
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/console/about/guides/releasewithconfidence/)
- [Termly - App Privacy Policy](https://termly.io/resources/templates/app-privacy-policy/)
- [iubenda - Mobile App Privacy](https://www.iubenda.com/en/blog/app-privacy-policy-template/)

### Cost Research
- [Expo Pricing](https://expo.dev/pricing)
- [React Native Development Cost](https://reactnativeexpert.com/blog/react-native-app-development-cost/)
- [Mobile App Development Cost 2026](https://supawire.com/insights/mobile-app-development-cost-2026)

### Competitor Research
- [Security.org - Best Data Removal Services](https://www.security.org/data-removal/best/)
- [CyberInsider - Incogni vs DeleteMe](https://cyberinsider.com/data-removal/incogni-vs-deleteme/)
- [CyberInsider - Optery vs Incogni](https://cyberinsider.com/data-removal/optery-vs-incogni/)

---

*Document Version: 1.0*
*Author: GhostMyData Product Team*
*Status: Ready for Development*
