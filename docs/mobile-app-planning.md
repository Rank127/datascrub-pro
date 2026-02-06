# GhostMyData Mobile App Planning

*Document Created: February 5, 2026*
*Status: Planning Phase*

---

## Executive Summary

This document outlines the plan to launch GhostMyData on iOS and Android. The recommended approach is **Expo (React Native)** for cost efficiency and code reuse with our existing Next.js/TypeScript stack.

**Recommended Timeline:** Start after Corporate Plans launch (Month 3-4)

---

## Strategic Timing

### Why Wait for Corporate Plans First?

| Factor | Rationale |
|--------|-----------|
| **Revenue** | Corporate plans generate immediate revenue to fund app development |
| **API Stability** | Corporate features will finalize our API structure |
| **Focus** | Splitting focus delays both projects |
| **Dependencies** | Mobile app consumes same API - better if API is stable |

### Suggested Timeline

```
Month 1-2:  Corporate Plans implementation
Month 2-3:  Corporate launch, first B2B customers
Month 3-4:  Mobile app development begins
Month 5:    Mobile app MVP launch (iOS + Android)
Month 6+:   Iterate based on user feedback, add corporate mobile features
```

---

## Technology Decision

### Options Evaluated

| Approach | Language | Platforms | Cost (Agency) | Maintenance |
|----------|----------|-----------|---------------|-------------|
| **Expo (React Native)** | TypeScript | iOS + Android | $15-40K | 1 codebase |
| Flutter | Dart | iOS + Android | $15-50K | 1 codebase, new language |
| Native | Swift + Kotlin | iOS + Android | $40-100K | 2 codebases |
| PWA | TypeScript | Web-based | $2-5K | No app store presence |

### Recommendation: Expo (React Native)

**Why Expo:**

1. **Same Language** - TypeScript (already using in Next.js)
2. **Same Patterns** - React components, hooks, state management
3. **One Codebase** - Single source for iOS and Android
4. **Rapid Development** - Hot reloading, Expo Go for testing
5. **OTA Updates** - Push bug fixes without App Store review
6. **Built-in Services** - Push notifications, auth, secure storage
7. **EAS Build** - Cloud builds, no Mac required for iOS

**Expo Limitations (acceptable for our use case):**

- Some native modules require "ejecting" (rare)
- Slightly larger app size (~20-30MB vs ~10MB native)
- Performance is 95% of native (sufficient for our app)

---

## Cost Breakdown

### One-Time Setup Costs

| Item | Cost | Notes |
|------|------|-------|
| Apple Developer Program | $99/year | Required for iOS App Store |
| Google Play Developer | $25 | One-time fee |
| D-U-N-S Number | Free | Required for Apple (takes 2-3 weeks) |
| App Store Assets | $0-500 | Screenshots, icons (can DIY) |
| **Total Setup** | **~$125-625** | |

### Ongoing Costs

| Item | Monthly | Annual | Notes |
|------|---------|--------|-------|
| Apple Developer | $8.25 | $99 | Required |
| Expo EAS (Production) | $99 | $1,188 | Build service, OTA updates |
| Push Notifications | $0 | $0 | Included with Expo |
| Analytics (optional) | $0-50 | $0-600 | Mixpanel, Amplitude, etc. |
| Error Tracking | $0-29 | $0-348 | Sentry (free tier available) |
| **Total Ongoing** | **~$107-186** | **~$1,287-2,235** | |

### Development Costs

| Approach | Cost | Timeline |
|----------|------|----------|
| **DIY (you or your team)** | $0 + time | 8-12 weeks |
| **Freelancer** | $5,000-15,000 | 6-10 weeks |
| **Agency (quality)** | $20,000-50,000 | 8-12 weeks |
| **Agency (premium)** | $50,000-100,000+ | 10-16 weeks |

### Total First Year (DIY Approach)

| Item | Cost |
|------|------|
| Setup | $125 |
| Expo EAS | $1,188 |
| Apple Developer | $99 |
| Your Time | 8-12 weeks |
| **Total** | **~$1,412 + your time** |

---

## Architecture

### API-First Design

```
┌─────────────────────────────────────────────────────────────┐
│                    EXISTING INFRASTRUCTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vercel     │  │   Prisma     │  │   Stripe     │      │
│  │   (Next.js)  │  │   (Postgres) │  │   (Billing)  │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │              REST API ENDPOINTS                   │      │
│  │  /api/auth, /api/scan, /api/exposures,           │      │
│  │  /api/removals, /api/user, /api/notifications    │      │
│  └──────────────────────────────────────────────────┘      │
│                          │                                   │
└──────────────────────────┼──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │   Web App    │ │   iOS App    │ │ Android App  │
   │   (Next.js)  │ │   (Expo)     │ │   (Expo)     │
   └──────────────┘ └──────────────┘ └──────────────┘
                    └───────┬────────┘
                            │
                    Single Codebase
```

### Mobile App Structure

```
ghostmydata-mobile/
├── app/                      # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── index.tsx         # Dashboard
│   │   ├── exposures.tsx     # Exposures list
│   │   ├── removals.tsx      # Removal status
│   │   └── settings.tsx      # Account settings
│   ├── exposure/[id].tsx     # Exposure detail
│   └── _layout.tsx           # Root layout
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── cards/                # Dashboard cards
│   └── lists/                # List components
├── lib/
│   ├── api.ts                # API client
│   ├── auth.ts               # Authentication
│   └── notifications.ts      # Push notification handlers
├── hooks/                    # Custom React hooks
├── stores/                   # State management (Zustand)
├── constants/                # Colors, config
└── assets/                   # Images, fonts
```

---

## Feature Roadmap

### Phase 1: MVP (8-10 weeks)

**Goal:** Core functionality for individual users

| Feature | Priority | Complexity |
|---------|----------|------------|
| **Authentication** | | |
| Email/password login | P0 | Low |
| Biometric login (Face ID, fingerprint) | P0 | Low (Expo built-in) |
| Password reset | P0 | Low |
| **Dashboard** | | |
| Protection score | P0 | Low |
| Exposure count summary | P0 | Low |
| Recent activity feed | P1 | Medium |
| **Exposures** | | |
| List all exposures | P0 | Low |
| Filter by status/severity | P1 | Medium |
| Exposure detail view | P0 | Low |
| Request removal (button) | P0 | Low |
| **Removals** | | |
| List removal requests | P0 | Low |
| Removal status tracking | P0 | Low |
| **Notifications** | | |
| Push notification setup | P0 | Medium |
| New exposure alerts | P0 | Medium |
| Removal completion alerts | P1 | Low |
| **Settings** | | |
| View account info | P0 | Low |
| Notification preferences | P1 | Low |
| Logout | P0 | Low |

**Not in MVP:**
- Initiating scans (use web)
- Payment/subscription management (use web)
- Family member management (use web)
- Dark web monitoring details (use web)

### Phase 2: Enhanced Features (4-6 weeks)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Initiate scan from mobile | P1 | Medium |
| Scan progress tracking | P1 | Medium |
| Dark web alert details | P2 | Low |
| Family member quick view | P2 | Medium |
| Share protection score | P2 | Low |
| Widget (iOS/Android) | P2 | High |
| Apple Watch complication | P3 | Medium |

### Phase 3: Corporate Features (4-6 weeks)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Organization switcher | P1 | Medium |
| Team dashboard (admin) | P1 | Medium |
| Member protection status | P1 | Low |
| Team exposure summary | P1 | Medium |
| Approve removal requests | P2 | Medium |
| View team reports | P2 | Medium |
| Invite team members | P3 | Medium |

---

## Push Notifications Strategy

### Notification Types

| Event | Priority | Frequency |
|-------|----------|-----------|
| New exposure found | High | As it happens |
| Removal completed | Medium | As it happens |
| Removal failed (needs attention) | High | As it happens |
| Weekly protection summary | Low | Weekly digest |
| Data breach affecting user | Critical | Immediate |
| Subscription expiring | Medium | 7 days, 1 day before |

### Implementation

```typescript
// Using Expo Notifications
import * as Notifications from 'expo-notifications';

// Register for push notifications
async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync();
  // Send token to our API: POST /api/user/push-token
  await api.post('/user/push-token', { token: token.data });
}
```

### Backend Integration

Add to existing API:
- `POST /api/user/push-token` - Store device push token
- `DELETE /api/user/push-token` - Remove on logout
- Update notification service to send push via Expo Push API

---

## App Store Requirements

### Apple App Store

| Requirement | Status | Notes |
|-------------|--------|-------|
| Apple Developer Account | Needed | $99/year |
| D-U-N-S Number | Needed | Free, 2-3 weeks to obtain |
| App Privacy Policy | Have it | Link to existing policy |
| App Store Screenshots | Needed | 6.5" and 5.5" iPhone sizes |
| App Icon | Needed | 1024x1024 PNG |
| App Description | Needed | Up to 4000 characters |
| Keywords | Needed | 100 character limit |
| Age Rating | 4+ | No objectionable content |
| Review Guidelines | Must comply | ~1-7 days for review |

### Google Play Store

| Requirement | Status | Notes |
|-------------|--------|-------|
| Google Play Developer | Needed | $25 one-time |
| Privacy Policy | Have it | Link to existing policy |
| Feature Graphic | Needed | 1024x500 PNG |
| Screenshots | Needed | Phone and tablet sizes |
| App Icon | Needed | 512x512 PNG |
| Short Description | Needed | 80 characters |
| Full Description | Needed | 4000 characters |
| Content Rating | Complete questionnaire | IARC rating |
| Data Safety | Needed | Declare data collection |

### App Store Optimization (ASO)

**Suggested Keywords:**
- Primary: data removal, privacy protection, data broker removal
- Secondary: identity protection, personal data, opt out, people search removal
- Competitor: deleteme alternative, incogni alternative

**App Name Options:**
- "GhostMyData - Privacy Protection"
- "GhostMyData: Remove Your Data"
- "GhostMyData - Data Removal"

---

## Security Considerations

### Authentication

| Method | Implementation |
|--------|----------------|
| Session tokens | Secure storage (Expo SecureStore) |
| Biometric | Expo LocalAuthentication |
| Auto-logout | After 30 days inactive |
| Token refresh | Silent refresh on app open |

### Data Storage

```typescript
// Secure storage for sensitive data
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('authToken', token);
const token = await SecureStore.getItemAsync('authToken');
```

### API Security

- All existing API authentication works
- Add mobile app identifier header
- Rate limiting per device
- Certificate pinning (optional, high security)

---

## Testing Strategy

### Development Testing

| Method | Tool | Purpose |
|--------|------|---------|
| Expo Go | Expo Go app | Rapid development testing |
| iOS Simulator | Xcode | iOS-specific testing |
| Android Emulator | Android Studio | Android-specific testing |
| Physical devices | TestFlight / Internal | Real-world testing |

### Pre-Launch Testing

| Phase | Audience | Duration |
|-------|----------|----------|
| Internal alpha | Team only | 1-2 weeks |
| Closed beta | 10-20 users | 2 weeks |
| Open beta | 100+ users | 1-2 weeks |
| Soft launch | Limited regions | 1 week |
| Full launch | Everyone | - |

### Beta Distribution

- **iOS:** TestFlight (up to 10,000 testers)
- **Android:** Google Play Internal/Closed Testing

---

## Development Checklist

### Pre-Development

- [ ] Register Apple Developer Account ($99)
- [ ] Register Google Play Developer Account ($25)
- [ ] Apply for D-U-N-S Number (if needed for Apple)
- [ ] Set up Expo account (free)
- [ ] Set up EAS Build subscription ($99/month)
- [ ] Create app icons and splash screens
- [ ] Plan API endpoints needed for mobile

### Development Setup

- [ ] Initialize Expo project: `npx create-expo-app ghostmydata-mobile`
- [ ] Configure Expo Router for navigation
- [ ] Set up authentication flow
- [ ] Create API client with existing endpoints
- [ ] Implement secure token storage
- [ ] Set up push notification handling

### MVP Features

- [ ] Login / Register screens
- [ ] Dashboard with protection score
- [ ] Exposures list and detail views
- [ ] Removals list and status
- [ ] Push notification registration
- [ ] Settings screen
- [ ] Biometric authentication

### Pre-Launch

- [ ] App Store screenshots (all sizes)
- [ ] App Store descriptions and keywords
- [ ] Privacy policy link verification
- [ ] TestFlight / Internal testing complete
- [ ] Performance optimization
- [ ] Crash reporting setup (Sentry)
- [ ] Analytics setup

### Launch

- [ ] Submit to App Store (allow 1-7 days review)
- [ ] Submit to Google Play (allow 1-3 days review)
- [ ] Prepare launch announcement
- [ ] Monitor crash reports and reviews
- [ ] Plan first update based on feedback

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| App Store rejection | Medium | High | Follow guidelines, test thoroughly |
| Performance issues | Low | Medium | Test on older devices |
| API changes breaking app | Low | High | Version your API, graceful degradation |
| Low adoption | Medium | Medium | ASO optimization, in-app prompts on web |
| Negative reviews | Medium | Medium | Quality testing, responsive support |

---

## Success Metrics

### Launch Goals (First 90 Days)

| Metric | Target |
|--------|--------|
| Downloads | 1,000+ |
| DAU (Daily Active Users) | 100+ |
| App Store Rating | 4.5+ stars |
| Crash-free rate | 99.5%+ |
| Push notification opt-in | 60%+ |

### Long-Term Goals (Year 1)

| Metric | Target |
|--------|--------|
| Total downloads | 10,000+ |
| Monthly active users | 2,000+ |
| Conversion (free → paid via app) | 5%+ |
| App Store Rating | 4.7+ stars |

---

## Open Questions

1. **Offline Support:** How much functionality should work offline?
   - Recommendation: Read-only cache of recent data, queue actions for sync

2. **Scan from Mobile:** Should users be able to initiate scans?
   - Recommendation: Yes in Phase 2, but show progress notification

3. **Deep Linking:** Support links from emails opening in app?
   - Recommendation: Yes, using Expo Linking

4. **Tablet Support:** Optimize for iPad/Android tablets?
   - Recommendation: Phase 2, responsive layout

5. **Dark Mode:** Support system dark mode?
   - Recommendation: Yes, from MVP (matches web app)

---

## Next Steps (When Ready)

1. [ ] Decide: Build in-house or hire developer?
2. [ ] Register Apple Developer Account
3. [ ] Register Google Play Developer Account
4. [ ] Apply for D-U-N-S Number
5. [ ] Set up Expo account and EAS
6. [ ] Create app design mockups
7. [ ] Initialize Expo project
8. [ ] Begin MVP development

---

## References

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/console/about/guides/releasewithconfidence/)
- [React Native](https://reactnative.dev/)

---

*Document Version: 1.0*
*Author: GhostMyData Product Team*
*Status: Awaiting Decision*
