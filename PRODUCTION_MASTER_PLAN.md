# 🚀 Tarsit Production Master Plan

This document outlines the 10-phase strategy to take Tarsit from development to a production-ready state on `tarsit.com`.

## Phase 1: Infrastructure & Environment Hardening

**Goal:** Establish a secure, scalable, and isolated production environment.

- [ ] **Database (Supabase):**
  - [ ] Create a dedicated _Production_ project in Supabase (separate from Dev).
  - [ ] Enable Point-in-Time Recovery (PITR) backups.
  - [ ] Configure connection pooling (Supavisor).
- [ ] **Backend Hosting (Railway/Render):**
  - [ ] Set up NestJS deployment pipeline.
  - [ ] Configure environment variables (Production secrets).
  - [ ] Set up health check endpoints (`/health`).
- [ ] **Frontend Hosting (Vercel):**
  - [ ] Connect GitHub repo to Vercel.
  - [ ] Configure build settings (`pnpm build`).
  - [ ] Set up custom domain `tarsit.com` and `www.tarsit.com`.
- [ ] **DNS & SSL:**
  - [ ] Configure A/CNAME records.
  - [ ] Verify SSL certificate issuance.

## Phase 2: Security Auditing & Compliance

**Goal:** Protect user data and prevent abuse.

- [ ] **Authentication:**
  - [ ] Enforce strong password policies.
  - [ ] Verify OAuth (Google) production credentials.
  - [ ] Review JWT expiration times (Access: 15m, Refresh: 7d).
- [ ] **Data Protection:**
  - [ ] **CRITICAL:** Replace any remaining Cloudinary usage with Supabase Storage (per project rules).
  - [ ] Audit Supabase Row Level Security (RLS) policies.
  - [ ] Sanitize all user inputs (Zod/Class-validator).
- [ ] **Network Security:**
  - [ ] Configure strict CORS (allow only `tarsit.com`).
  - [ ] Implement Rate Limiting (NestJS Throttler) for API endpoints.
  - [ ] Set up Helmet security headers (CSP, X-Frame-Options).

## Phase 3: Performance Optimization

**Goal:** Ensure sub-second load times and smooth interactions.

- [ ] **Frontend:**
  - [ ] Implement `next/image` for all dynamic images.
  - [ ] Analyze bundle size (`@next/bundle-analyzer`) and code-split heavy components.
  - [ ] Implement React Query caching strategies (stale times).
- [ ] **Backend:**
  - [ ] Add database indexes for frequent queries (Search, Filtering).
  - [ ] Implement Redis caching for expensive endpoints (e.g., `GET /businesses`).
  - [ ] Optimize Prisma queries (avoid N+1 problems).
- [ ] **Assets:**
  - [ ] Serve static assets via CDN (Vercel Edge Network).

## Phase 4: Comprehensive Testing

**Goal:** Verify system stability and correctness.

- [ ] **Unit Testing:**
  - [ ] Achieve >80% coverage for critical business logic (Services/Utils).
- [ ] **E2E Testing:**
  - [ ] Create Playwright flows for: Signup, Business Creation, Booking, Messaging.
- [ ] **Load Testing:**
  - [ ] Use k6 to simulate 100+ concurrent users.
- [ ] **Smoke Testing:**
  - [ ] Verify critical paths on the production build before public release.

## Phase 5: Monitoring & Observability

**Goal:** Detect and resolve issues before users report them.

- [ ] **Error Tracking:**
  - [ ] Integrate Sentry for Frontend and Backend.
- [ ] **Logging:**
  - [ ] Configure structured logging (Pino) for the API.
  - [ ] Set up log aggregation (Datadog or Vercel Logs).
- [ ] **Analytics:**
  - [ ] Integrate PostHog or Google Analytics 4.
  - [ ] Track key conversion events (Signups, Bookings).
- [ ] **Uptime:**
  - [ ] Set up UptimeRobot or BetterStack monitoring.

## Phase 6: SEO & Content Strategy

**Goal:** Maximize organic visibility.

- [ ] **Metadata:**
  - [ ] Define dynamic `metadata` (Title, Description, OpenGraph) for all pages.
  - [ ] Generate `sitemap.xml` and `robots.txt`.
- [ ] **Structured Data:**
  - [ ] Implement JSON-LD for `LocalBusiness` on business profile pages.
- [ ] **Canonicalization:**
  - [ ] Ensure consistent URL structures (trailing slashes, www vs non-www).

## Phase 7: User Experience Polish

**Goal:** Delight users with a professional feel.

- [ ] **Loading States:**
  - [ ] Replace spinners with Skeleton loaders for main content areas.
- [ ] **Error Handling:**
  - [ ] Create custom 404 and 500 error pages.
  - [ ] Implement Error Boundaries for React components.
- [ ] **Accessibility:**
  - [ ] Audit color contrast and ARIA labels (Lighthouse Accessibility score > 90).
- [ ] **Responsiveness:**
  - [ ] Verify layout on Mobile (iOS/Android) and Tablet.

## Phase 8: Legal & Administrative

**Goal:** Ensure legal compliance and operational readiness.

- [ ] **Documents:**
  - [ ] Draft and publish Terms of Service.
  - [ ] Draft and publish Privacy Policy.
  - [ ] Implement Cookie Consent banner.
- [ ] **Admin Tools:**
  - [ ] Verify Admin Dashboard functionality (User management, Content moderation).
  - [ ] Set up support email aliases (support@tarsit.com).

## Phase 9: Marketing & Launch Prep

**Goal:** Prepare for user acquisition.

- [ ] **Landing Page:**
  - [ ] Optimize the hero section and value proposition.
  - [ ] Add social proof (if available) or "Beta" labeling.
- [ ] **Communication:**
  - [ ] Design transactional email templates (Welcome, Reset Password).
  - [ ] Set up social media accounts.
- [ ] **Data:**
  - [ ] Seed the production database with initial categories and "Model" businesses.

## Phase 10: Go-Live & Post-Launch

**Goal:** Successful public release.

- [ ] **Launch Day:**
  - [ ] Final database migration.
  - [ ] DNS propagation check.
  - [ ] "Flip the switch" (Remove maintenance mode/password protection).
- [ ] **Post-Launch:**
  - [ ] Monitor error rates closely for 48 hours.
  - [ ] Collect user feedback via in-app widget.
  - [ ] Begin weekly release cycle.
