'use client';

import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface StickyCTABarProps {
  /** Scroll threshold in pixels before showing */
  showAfterScroll?: number;
  /** Title text */
  title?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA link */
  ctaHref?: string;
  /** Type of CTA - business or customer */
  variant?: 'business' | 'customer';
}

export function StickyCTABar({
  showAfterScroll = 800,
  title = "Ready to grow your business?",
  ctaText = "Get started free",
  ctaHref = "/business/register",
  variant = 'business',
}: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('sticky_cta_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollPercent = (scrollY / (docHeight - viewportHeight)) * 100;

      // Show after scroll threshold OR when user scrolls back up from 50%+
      setIsVisible(scrollY > showAfterScroll || scrollPercent > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('sticky_cta_dismissed', 'true');
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className={`
        py-3 px-4 sm:px-6 backdrop-blur-lg border-t
        ${variant === 'business' 
          ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border-purple-500/20' 
          : 'bg-neutral-900/90 border-neutral-800'
        }
      `}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-white text-sm sm:text-base font-medium text-center sm:text-left">
              {title}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={ctaHref}
              className={`
                inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                ${variant === 'business'
                  ? 'bg-white text-purple-900 hover:bg-neutral-100'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
                }
              `}
            >
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
