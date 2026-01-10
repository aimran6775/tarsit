# Tarsit Website Optimization - 10 Phase Plan

## Overview

A comprehensive optimization plan to improve website performance, loading speed, and user experience while maintaining the premium look and feel.

---

## Phase 1: Image Optimization & Lazy Loading

**Priority: Critical | Duration: 2-3 days**

### Tasks:

- [ ] Implement Next.js Image component with proper sizing across all pages
- [ ] Add blur placeholders for images using `blurDataURL`
- [ ] Configure image optimization in `next.config.js`
- [ ] Convert large images to WebP format
- [ ] Implement lazy loading for below-the-fold images
- [ ] Add responsive image srcsets for different screen sizes
- [ ] Optimize video poster images

### Expected Impact:

- 40-60% reduction in image payload
- Faster Largest Contentful Paint (LCP)

---

## Phase 2: Code Splitting & Bundle Optimization

**Priority: Critical | Duration: 3-4 days**

### Tasks:

- [ ] Analyze bundle size with `@next/bundle-analyzer`
- [ ] Implement dynamic imports for heavy components
- [ ] Split vendor bundles (React, Mapbox, etc.)
- [ ] Remove unused dependencies
- [ ] Tree-shake Lucide icons (import individually)
- [ ] Optimize Tailwind CSS purge configuration
- [ ] Implement route-based code splitting

### Expected Impact:

- 30-50% reduction in initial JavaScript bundle
- Faster Time to Interactive (TTI)

---

## Phase 3: Caching Strategy Implementation

**Priority: High | Duration: 2-3 days**

### Tasks:

- [ ] Configure React Query cache properly (already using 1-min stale time)
- [ ] Implement service worker for static assets
- [ ] Add Cache-Control headers in Next.js config
- [ ] Configure CDN caching rules (Vercel/Cloudflare)
- [ ] Implement browser caching for fonts and images
- [ ] Add SWR (stale-while-revalidate) for API responses
- [ ] Cache business listings and categories

### Expected Impact:

- 60-80% reduction in repeat visit load times
- Reduced API calls

---

## Phase 4: API & Database Optimization

**Priority: High | Duration: 3-4 days**

### Tasks:

- [ ] Add database indexes for frequently queried fields
- [ ] Implement API response pagination
- [ ] Add Redis/Upstash caching layer for hot data
- [ ] Optimize Prisma queries (use select instead of include)
- [ ] Implement connection pooling for Prisma
- [ ] Add API response compression (gzip/brotli)
- [ ] Cache popular search results

### Expected Impact:

- 50-70% faster API response times
- Reduced database load

---

## Phase 5: Font & CSS Optimization

**Priority: Medium | Duration: 1-2 days**

### Tasks:

- [ ] Implement `font-display: swap` for web fonts
- [ ] Subset fonts to only needed characters
- [ ] Preload critical fonts
- [ ] Remove unused CSS with PurgeCSS
- [ ] Critical CSS extraction for above-the-fold
- [ ] Minify CSS in production
- [ ] Optimize Tailwind JIT compilation

### Expected Impact:

- 20-30% reduction in CSS payload
- Eliminate Flash of Unstyled Content (FOUC)

---

## Phase 6: Third-Party Script Optimization

**Priority: Medium | Duration: 2 days**

### Tasks:

- [ ] Defer non-critical third-party scripts
- [ ] Lazy load Mapbox until map is in viewport
- [ ] Load analytics scripts asynchronously
- [ ] Implement facade pattern for heavy embeds
- [ ] Add loading="lazy" to iframes
- [ ] Audit and remove unused third-party scripts
- [ ] Use Partytown for off-main-thread scripts

### Expected Impact:

- 30-40% reduction in main thread blocking
- Faster First Input Delay (FID)

---

## Phase 7: Server-Side Rendering & Static Generation

**Priority: Medium | Duration: 3-4 days**

### Tasks:

- [ ] Convert suitable pages to Static Site Generation (SSG)
- [ ] Implement Incremental Static Regeneration (ISR) for listings
- [ ] Add static generation for category pages
- [ ] Implement streaming SSR for dynamic pages
- [ ] Pre-render popular business pages
- [ ] Add `generateStaticParams` for dynamic routes
- [ ] Optimize `getServerSideProps` usage

### Expected Impact:

- Near-instant page loads for static content
- Better SEO performance

---

## Phase 8: Progressive Web App (PWA) Features

**Priority: Low | Duration: 2-3 days**

### Tasks:

- [ ] Add web app manifest
- [ ] Implement service worker for offline support
- [ ] Add offline fallback page
- [ ] Cache critical assets for offline use
- [ ] Implement background sync for forms
- [ ] Add push notification support (optional)
- [ ] Configure app icons and splash screens

### Expected Impact:

- App-like experience
- Works offline for cached content

---

## Phase 9: Performance Monitoring & Analytics

**Priority: Medium | Duration: 2 days**

### Tasks:

- [ ] Integrate Core Web Vitals monitoring
- [ ] Set up Real User Monitoring (RUM)
- [ ] Configure performance budgets
- [ ] Add Lighthouse CI to deployment pipeline
- [ ] Implement error boundary performance tracking
- [ ] Set up alerting for performance regressions
- [ ] Create performance dashboard

### Expected Impact:

- Early detection of performance issues
- Data-driven optimization decisions

---

## Phase 10: Advanced Optimizations

**Priority: Low | Duration: 3-4 days**

### Tasks:

- [ ] Implement HTTP/2 server push (if supported)
- [ ] Add preconnect for external domains
- [ ] Implement prefetching for likely navigation
- [ ] Optimize animation performance (GPU acceleration)
- [ ] Add intersection observer for lazy components
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize React rendering (memo, useMemo, useCallback)

### Expected Impact:

- Smoother interactions
- Better perceived performance

---

## Implementation Priority Matrix

| Phase | Priority | Impact | Effort | Start After |
| ----- | -------- | ------ | ------ | ----------- |
| 1     | Critical | High   | Medium | Immediately |
| 2     | Critical | High   | High   | Phase 1     |
| 3     | High     | High   | Medium | Phase 1     |
| 4     | High     | High   | High   | Phase 2     |
| 5     | Medium   | Medium | Low    | Anytime     |
| 6     | Medium   | Medium | Medium | Phase 2     |
| 7     | Medium   | High   | High   | Phase 3     |
| 8     | Low      | Low    | Medium | Phase 7     |
| 9     | Medium   | Medium | Low    | Phase 1     |
| 10    | Low      | Medium | High   | Phase 7     |

---

## Quick Wins (Can be done immediately)

1. **Enable Next.js Image Optimization** - Already configured
2. **Add font-display: swap** - Simple CSS change
3. **Increase React Query stale time** - For less critical data
4. **Add preconnect hints** - For external domains
5. **Enable gzip compression** - Server config

---

## Performance Targets

| Metric | Current | Target | Phase to Achieve |
| ------ | ------- | ------ | ---------------- |
| LCP    | TBD     | <2.5s  | Phases 1, 7      |
| FID    | TBD     | <100ms | Phases 2, 6      |
| CLS    | TBD     | <0.1   | Phase 1          |
| TTI    | TBD     | <3.8s  | Phases 2, 6      |
| Bundle | TBD     | <200KB | Phase 2          |

---

## Notes

- Measure before and after each phase
- Use Lighthouse, WebPageTest, and Chrome DevTools
- Prioritize mobile performance
- Consider geographic distribution of users
- Test with throttled network conditions
