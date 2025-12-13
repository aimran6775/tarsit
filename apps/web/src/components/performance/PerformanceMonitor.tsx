'use client';

import { useEffect } from 'react';

/**
 * Performance Monitor Component
 * Tracks and reports web vitals and performance metrics
 */
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Track Web Vitals
    const trackWebVital = (metric: any) => {
      // Send to analytics service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to analytics
        // analytics.track('web_vital', {
        //   name: metric.name,
        //   value: metric.value,
        //   id: metric.id,
        //   delta: metric.delta,
        // });
        console.log('Web Vital:', metric);
      }
    };

    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      trackWebVital({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        id: lastEntry.id,
      });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        trackWebVital({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          id: entry.id,
        });
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      trackWebVital({
        name: 'CLS',
        value: clsValue,
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Track Time to First Byte (TTFB)
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.entryType === 'navigation') {
          const ttfb = entry.responseStart - entry.requestStart;
          trackWebVital({
            name: 'TTFB',
            value: ttfb,
          });
        }
      });
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });

    // Cleanup
    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, []);

  return null;
}
