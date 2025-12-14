'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { NotFoundIllustration } from '@/components/illustrations';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-neutral-950 to-indigo-900/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative text-center max-w-lg">
        {/* 404 Illustration */}
        <div className="mb-8 flex justify-center">
          <NotFoundIllustration className="w-64 h-48 md:w-80 md:h-60" />
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-neutral-400 text-lg mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-neutral-950 bg-white hover:bg-neutral-100 rounded-full transition-all"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white border border-neutral-700 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-full transition-all"
          >
            <Search className="h-4 w-4" />
            Find Businesses
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-neutral-500 mb-4">Popular destinations</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/categories"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Browse Categories
            </Link>
            <Link
              href="/business/register"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
            >
              List Your Business
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
