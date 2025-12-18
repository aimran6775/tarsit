# Tarsit Platform Improvement Roadmap

> **Last Updated**: December 13, 2024
> **Status**: Planning Complete - Ready to Execute
> **Total Estimated Time**: 6-8 weeks

---

## Overview

This document outlines a comprehensive plan to transform Tarsit from its current semi-complete MVP state into a production-ready local services marketplace. The work is organized into 8 phases, prioritized by criticality and dependency order.

---

## Phase 1: Foundation Fixes (Week 1)
**Priority: CRITICAL | Estimated: 2-3 days**

### 1.1 Route Consolidation & Cleanup
- [ ] **Remove duplicate auth routes**
  - Delete `/apps/web/src/app/(auth)/` folder (duplicate of `/apps/web/src/app/auth/`)
  - Ensure all links point to `/auth/login` and `/auth/signup`
  - Test all auth redirects work correctly

- [ ] **Create missing static pages**
  - Create `/apps/web/src/app/about/page.tsx` - About Tarsit page
  - Create `/apps/web/src/app/privacy/page.tsx` - Privacy Policy page
  - Create `/apps/web/src/app/terms/page.tsx` - Terms of Service page
  - Create `/apps/web/src/app/contact/page.tsx` - Contact Us page with form

- [ ] **Fix 404 page**
  - Create proper `/apps/web/src/app/not-found.tsx`
  - Design matches site theme
  - Includes helpful navigation back to home/search

### 1.2 Error Handling Infrastructure
- [ ] **Add global error boundary**
  - Create `/apps/web/src/components/ErrorBoundary.tsx`
  - Wrap app in error boundary in root layout
  - Create fallback UI that's user-friendly

- [ ] **Add toast notification system**
  - Install `sonner` or `react-hot-toast`
  - Create toast provider in `/apps/web/src/components/ui/toast.tsx`
  - Add to app providers
  - Create helper hooks for success/error/info toasts

- [ ] **API error handling standardization**
  - Update `apiClient` to handle common errors consistently
  - Add retry logic for transient failures
  - Handle 401 (redirect to login), 403 (show forbidden), 429 (rate limit), 500 (server error)

### 1.3 Homepage Improvements
- [ ] **Replace hardcoded stats with real data**
  - Create `/api/stats/public` endpoint in backend
  - Returns: total businesses, total reviews, total bookings
  - Update homepage to fetch real stats (with fallback)

- [ ] **Replace external video with self-hosted or image**
  - Option A: Download video, upload to Cloudflare R2, serve from CDN
  - Option B: Replace with high-quality static hero image
  - Add proper loading state/placeholder

- [ ] **Fix categories on homepage**
  - Fetch real categories from API instead of hardcoded
  - Show actual business counts per category
  - Handle loading/error states

### Deliverables Phase 1:
- [ ] All routes consolidated and working
- [ ] All footer links functional
- [ ] Error handling throughout app
- [ ] Toast notifications working
- [ ] Homepage shows real data

---

## Phase 2: Complete Business Registration Flow (Week 1-2)
**Priority: CRITICAL | Estimated: 3-4 days**

### 2.1 Backend: Business Creation Endpoint
- [ ] **Create combined signup + business creation endpoint**
  - POST `/api/auth/signup-business`
  - Accepts user data + business data
  - Creates user, then business in transaction
  - Returns user + business + tokens

- [ ] **Update business creation to geocode address**
  - Integrate geocoding service (Google Maps Geocoding API or free alternative)
  - Auto-populate latitude/longitude from address
  - Store coordinates in business record

### 2.2 Frontend: Complete Registration Form
- [ ] **Fix business registration page**
  - Update `handleSubmit` to send all business data (not just user signup)
  - On success, redirect to dashboard with business already created
  - Show proper success message

- [ ] **Add business photo upload during registration (optional step)**
  - Allow logo upload
  - Allow cover photo upload
  - Store in Cloudflare R2

### 2.3 Post-Registration Onboarding
- [ ] **Create onboarding checklist component**
  - Display in dashboard for new businesses
  - Tracks: Add description ✓, Add photos, Set hours, Add services, Request verification
  - Persists completion state

- [ ] **Create "Complete Your Profile" prompts**
  - Nudge users to complete missing info
  - Show profile completeness percentage

### Deliverables Phase 2:
- [ ] Business registration creates actual business entity
- [ ] Address is geocoded automatically
- [ ] Onboarding checklist guides new businesses
- [ ] Photo upload works during registration

---

## Phase 3: Reviews System Completion (Week 2)
**Priority: CRITICAL | Estimated: 2-3 days**

### 3.1 Backend: Review Endpoints
- [ ] **Verify review CRUD endpoints exist and work**
  - GET `/api/reviews/business/:id` - List reviews for business
  - POST `/api/reviews` - Create review (requires auth + booking?)
  - PUT `/api/reviews/:id` - Update own review
  - DELETE `/api/reviews/:id` - Delete own review

- [ ] **Add review eligibility check**
  - Option A: Anyone can review (like Google)
  - Option B: Only customers who booked can review (verified reviews)
  - Create endpoint: GET `/api/reviews/can-review/:businessId`

- [ ] **Business response to reviews**
  - PUT `/api/reviews/:id/respond` - Business owner adds response
  - Only business owner can respond to their reviews

### 3.2 Frontend: Review Submission
- [ ] **Create ReviewForm component**
  - Star rating selector (1-5 stars)
  - Title input (optional)
  - Comment textarea
  - Photo upload (optional, up to 3 photos)
  - Submit button with loading state

- [ ] **Add "Write a Review" button to business page**
  - Shows if user is logged in
  - Shows if user hasn't reviewed yet
  - Opens review modal or navigates to review page

- [ ] **Create review submission modal**
  - `/apps/web/src/app/business/[slug]/components/ReviewModal.tsx`
  - Accessible from business detail page
  - Shows success message after submission
  - Auto-updates review list

### 3.3 Frontend: Business Response to Reviews
- [ ] **Add response UI in business dashboard**
  - List all reviews in dashboard
  - Each review has "Respond" button
  - Response text area + submit
  - Shows existing response if present

### Deliverables Phase 3:
- [ ] Customers can submit reviews from business page
- [ ] Reviews appear immediately after submission
- [ ] Business owners can respond to reviews
- [ ] Review photos can be uploaded

---

## Phase 4: Image Upload System (Week 2-3)
**Priority: HIGH | Estimated: 2-3 days**

### 4.1 Backend: Upload Infrastructure
- [ ] **Verify Cloudflare R2 integration**
  - Check `/apps/api/src/uploads/` service
  - Ensure presigned URL generation works
  - Test upload flow end-to-end

- [ ] **Create image processing pipeline**
  - Resize images on upload (multiple sizes: thumbnail, medium, large)
  - Convert to WebP for better performance
  - Generate blurhash for placeholders

### 4.2 Frontend: Photo Management in Dashboard
- [ ] **Create PhotoUploader component**
  - Drag-and-drop support
  - Multiple file selection
  - Progress indicator
  - Preview before upload
  - Error handling for invalid files

- [ ] **Add Photos tab to business dashboard**
  - Grid view of all photos
  - Upload new photos button
  - Set featured photo
  - Delete photos
  - Reorder photos (drag-drop)

- [ ] **Add logo/cover photo upload**
  - Dedicated sections in business settings
  - Crop tool for proper dimensions
  - Preview before saving

### 4.3 Frontend: Photo Display Improvements
- [ ] **Update PhotoGallery component**
  - Use optimized image URLs
  - Add blurhash placeholders
  - Implement lazy loading
  - Add lightbox for full-screen view

### Deliverables Phase 4:
- [ ] Business owners can upload/manage photos
- [ ] Logo and cover photo upload working
- [ ] Photos display with proper optimization
- [ ] Drag-drop reordering works

---

## Phase 5: Messaging System Completion (Week 3)
**Priority: HIGH | Estimated: 3-4 days**

### 5.1 Backend: Real-time Infrastructure
- [ ] **Verify Socket.io setup**
  - Check `/apps/api/src/chat/chat.gateway.ts`
  - Ensure WebSocket connections work
  - Test authentication in WebSocket context

- [ ] **Implement real-time events**
  - `message:new` - New message received
  - `message:read` - Message marked as read
  - `user:typing` - User is typing indicator
  - `user:online` - User online status

- [ ] **Add message persistence**
  - Save all messages to database
  - Load message history on chat open
  - Pagination for old messages

### 5.2 Frontend: Chat Improvements
- [ ] **Add Socket.io client**
  - Create `/apps/web/src/lib/socket.ts`
  - Handle connection/disconnection
  - Reconnection logic

- [ ] **Update messages page for real-time**
  - Listen for new messages
  - Update UI in real-time
  - Show typing indicators
  - Show online/offline status

- [ ] **Add chat notifications**
  - Browser push notifications (with permission)
  - Unread badge in header
  - Sound notification option

### 5.3 Chat from Business Page
- [ ] **Improve ChatModal component**
  - Show chat history if exists
  - Real-time message updates
  - Better UX for starting new conversation

### Deliverables Phase 5:
- [ ] Real-time messaging works
- [ ] Typing indicators show
- [ ] Push notifications for new messages
- [ ] Unread message badges

---

## Phase 6: Map Integration (Week 3-4)
**Priority: MEDIUM | Estimated: 2-3 days**

### 6.1 Map Display Components
- [ ] **Install map library**
  - Use `react-leaflet` (free) or `@react-google-maps/api`
  - Create map wrapper component
  - Handle API key configuration

- [ ] **Create BusinessMap component**
  - Shows single business location
  - Custom marker with business logo
  - Info popup with business name/address
  - Directions link

- [ ] **Create SearchResultsMap component**
  - Shows all search results on map
  - Clustering for many markers
  - Click marker to see business preview
  - Sync with list (hover highlight)

### 6.2 Map Integration in Pages
- [ ] **Add map to business detail page**
  - Show in sidebar or below contact info
  - "Get Directions" button

- [ ] **Add map view toggle to search page**
  - Grid / List / Map view options
  - Split view (list + map side by side)
  - Map updates with search filters

### 6.3 Location-based Features
- [ ] **Add "Near Me" functionality**
  - Get user's location (with permission)
  - Auto-populate search location
  - Sort by distance

- [ ] **Add location picker for business registration**
  - Map click to set location
  - Draggable marker for adjustment
  - Address autocomplete

### Deliverables Phase 6:
- [ ] Business pages show location on map
- [ ] Search results can be viewed on map
- [ ] "Near Me" search works
- [ ] Business registration has map picker

---

## Phase 7: Authentication & Security (Week 4)
**Priority: HIGH | Estimated: 2-3 days**

### 7.1 Improve Token Storage
- [ ] **Move tokens to httpOnly cookies**
  - Update auth service to use cookies instead of localStorage
  - More secure against XSS attacks
  - Update API client to not send Authorization header (cookies auto-sent)

- [ ] **Implement refresh token rotation**
  - Short-lived access tokens (15 min)
  - Long-lived refresh tokens (7 days)
  - Auto-refresh before expiry

### 7.2 Complete Auth Flows
- [ ] **Fix email verification flow**
  - Verify email sent on signup
  - Create `/auth/verify-email/[token]` page
  - Show verification status
  - Resend verification email option

- [ ] **Fix password reset flow**
  - Verify forgot password email sends
  - Test `/auth/reset-password/[token]` page
  - Password strength requirements
  - Confirmation message

- [ ] **Implement OAuth providers**
  - Google Sign-In integration
  - Apple Sign-In integration
  - Link social accounts to existing account

### 7.3 Security Hardening
- [ ] **Remove demo credentials from UI**
  - Remove from login page
  - Create separate test account documentation

- [ ] **Add rate limiting feedback**
  - Show user-friendly message when rate limited
  - Countdown timer before retry

- [ ] **Add CSRF protection**
  - Generate CSRF tokens
  - Validate on state-changing requests

### Deliverables Phase 7:
- [ ] Tokens stored securely in cookies
- [ ] Email verification works end-to-end
- [ ] Password reset works end-to-end
- [ ] Google OAuth login works
- [ ] No sensitive data in UI

---

## Phase 8: Performance & Polish (Week 4-5)
**Priority: MEDIUM | Estimated: 3-4 days**

### 8.1 Loading States & Skeletons
- [ ] **Create skeleton components**
  - BusinessCardSkeleton
  - BusinessDetailSkeleton
  - ReviewSkeleton
  - ChatSkeleton
  - DashboardSkeleton

- [ ] **Add skeletons to all data-fetching pages**
  - Search page
  - Business detail page
  - Dashboards
  - Messages

### 8.2 Performance Optimizations
- [ ] **Image optimization**
  - Use Next.js Image component everywhere
  - Implement responsive images (srcset)
  - Add blur placeholders

- [ ] **Code splitting improvements**
  - Lazy load modals
  - Lazy load dashboard tabs
  - Route-based code splitting verified

- [ ] **API response caching**
  - Cache categories (long TTL)
  - Cache business list (short TTL, invalidate on update)
  - Use React Query caching effectively

### 8.3 SEO Implementation
- [ ] **Add meta tags to all pages**
  - Create `/apps/web/src/lib/seo.ts` utilities
  - Page-specific titles
  - Open Graph tags
  - Twitter cards

- [ ] **Implement structured data**
  - LocalBusiness schema for business pages
  - Review schema for reviews
  - BreadcrumbList for navigation

- [ ] **Create sitemap**
  - Dynamic sitemap generation
  - Include all business pages
  - Submit to search engines

### 8.4 Accessibility Audit
- [ ] **Run accessibility checks**
  - Use axe-core or similar
  - Fix all critical issues
  - Add ARIA labels where needed
  - Keyboard navigation works

### Deliverables Phase 8:
- [ ] Loading skeletons on all pages
- [ ] Lighthouse score 90+
- [ ] SEO meta tags on all pages
- [ ] Structured data implemented
- [ ] Accessibility issues fixed

---

## Phase 9: Admin Dashboard Completion (Week 5-6)
**Priority: MEDIUM | Estimated: 3-4 days**

### 9.1 Replace Mock Data with Real APIs
- [ ] **Implement all admin API endpoints**
  - GET /api/admin/stats/realtime
  - GET /api/admin/users (with pagination, filters)
  - GET /api/admin/businesses (with pagination, filters)
  - GET /api/admin/reviews (with pagination, filters)
  - GET /api/admin/audit-logs
  - GET /api/admin/system/health

- [ ] **Update admin dashboard to use real data**
  - Remove all mock data fallbacks
  - Show proper error states
  - Add retry functionality

### 9.2 Admin Actions
- [ ] **User management**
  - Suspend/activate users
  - Promote to admin
  - Delete user (soft delete)
  - View user details

- [ ] **Business management**
  - Verify businesses
  - Feature/unfeature businesses
  - Suspend/activate businesses
  - Edit business details

- [ ] **Review moderation**
  - Flag inappropriate reviews
  - Delete reviews
  - View reported content

### 9.3 Categories Management
- [ ] **Implement categories CRUD in admin**
  - List all categories
  - Add new category
  - Edit category (name, icon, slug)
  - Reorder categories
  - Delete category (if no businesses)

### Deliverables Phase 9:
- [ ] Admin dashboard shows real data
- [ ] All admin actions work
- [ ] Categories can be managed
- [ ] Audit logging captures admin actions

---

## Phase 10: Testing & Quality Assurance (Week 6)
**Priority: HIGH | Estimated: 3-4 days**

### 10.1 E2E Test Coverage
- [ ] **Update user journey tests**
  - Fix any broken tests
  - Add tests for new features
  - Cover all critical paths

- [ ] **Add business owner journey tests**
  - Registration flow
  - Dashboard functionality
  - Appointment management
  - Photo upload

- [ ] **Add admin journey tests**
  - Login as admin
  - User management
  - Business verification

### 10.2 Unit & Integration Tests
- [ ] **Backend API tests**
  - Auth endpoints
  - Business CRUD
  - Reviews CRUD
  - Appointments
  - Search

- [ ] **Frontend component tests**
  - Critical components
  - Form validations
  - Error states

### 10.3 Manual Testing Checklist
- [ ] **Cross-browser testing**
  - Chrome, Firefox, Safari, Edge
  - Mobile browsers

- [ ] **Device testing**
  - Desktop (various sizes)
  - Tablet
  - Mobile (iOS + Android)

- [ ] **User acceptance testing**
  - Full customer journey
  - Full business owner journey
  - Full admin journey

### Deliverables Phase 10:
- [ ] All E2E tests passing
- [ ] 80%+ code coverage
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness verified

---

## Phase 11: Documentation & Launch Prep (Week 6-7)
**Priority: MEDIUM | Estimated: 2-3 days**

### 11.1 User Documentation
- [ ] **Customer Help Center**
  - How to search for businesses
  - How to book appointments
  - How to leave reviews
  - Account management

- [ ] **Business Owner Guide**
  - Getting started guide
  - Managing your profile
  - Handling appointments
  - Responding to reviews

### 11.2 Developer Documentation
- [ ] **API documentation**
  - Swagger/OpenAPI up to date
  - All endpoints documented
  - Authentication explained

- [ ] **Setup guide**
  - Local development setup
  - Environment variables
  - Database setup

### 11.3 Launch Checklist
- [ ] **Infrastructure**
  - Production environment configured
  - Database backups scheduled
  - Error monitoring (Sentry) set up
  - Analytics (Google Analytics) configured

- [ ] **Legal**
  - Terms of Service finalized
  - Privacy Policy finalized
  - Cookie consent implemented

- [ ] **Marketing**
  - Landing page optimized
  - Social sharing works
  - Email templates ready

### Deliverables Phase 11:
- [ ] Help documentation written
- [ ] API docs complete
- [ ] Infrastructure ready
- [ ] Legal pages live

---

## Tracking Progress

### Phase Status Legend
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⏸️ Blocked

### Current Status

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| Phase 1: Foundation Fixes | 🟢 | 100% | COMPLETE - Dec 13, 2024 |
| Phase 2: Business Registration | 🔴 | 0% | Ready to start |
| Phase 3: Reviews System | 🔴 | 0% | - |
| Phase 4: Image Upload | 🔴 | 0% | - |
| Phase 5: Messaging System | 🔴 | 0% | - |
| Phase 6: Map Integration | 🔴 | 0% | - |
| Phase 7: Auth & Security | 🔴 | 0% | - |
| Phase 8: Performance & Polish | 🔴 | 0% | - |
| Phase 9: Admin Dashboard | 🔴 | 0% | - |
| Phase 10: Testing & QA | 🔴 | 0% | - |
| Phase 11: Docs & Launch | 🔴 | 0% | - |

---

## Quick Reference: File Locations

### Frontend (apps/web/src/)
```
app/
├── (auth)/          # DELETE - duplicate
├── auth/            # KEEP - main auth routes
├── about/           # CREATE
├── privacy/         # CREATE
├── terms/           # CREATE
├── contact/         # CREATE
├── business/
│   ├── [slug]/
│   │   └── components/
│   │       └── ReviewModal.tsx  # CREATE
│   └── dashboard/
│       └── components/
│           └── PhotosTab.tsx    # CREATE
├── not-found.tsx    # CREATE
└── ...

components/
├── ErrorBoundary.tsx           # CREATE
├── ui/
│   └── toast.tsx               # CREATE
└── ...

lib/
├── socket.ts                   # CREATE
└── seo.ts                      # UPDATE
```

### Backend (apps/api/src/)
```
auth/
├── auth.controller.ts          # UPDATE - add signup-business
└── auth.service.ts             # UPDATE

admin/
├── admin.controller.ts         # UPDATE - real endpoints
└── admin.service.ts            # UPDATE

stats/                          # CREATE
├── stats.controller.ts
├── stats.module.ts
└── stats.service.ts
```

---

## Getting Started

To begin Phase 1, run through the checklist in order. Each task should be:
1. Implemented
2. Tested locally
3. Committed with descriptive message
4. Marked complete in this document

Let's start with Phase 1, Task 1.1: Route Consolidation & Cleanup.

---

*This document will be updated as we progress through each phase.*
