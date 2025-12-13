'use client';

import Link from 'next/link';
import { ArrowRight, Star, MapPin, Clock, MessageCircle, Calendar, Shield, Building2 } from 'lucide-react';
import { HeroSearch } from '@/components/features';
import { useCategories, useStats } from '@/hooks';

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  'restaurants': '🍽️',
  'beauty-spas': '💆',
  'beauty-wellness': '💆',
  'home-services': '🏠',
  'auto-services': '🚗',
  'automotive': '🚗',
  'health-medical': '🏥',
  'professional-services': '💼',
  'shopping': '🛍️',
  'entertainment': '🎭',
  'fitness': '💪',
  'fitness-health': '💪',
  'education': '📚',
  'food-dining': '🍽️',
};

// Fallback categories if API fails
const fallbackCategories = [
  { id: '1', name: 'Beauty & Wellness', slug: 'beauty-wellness', _count: { businesses: 0 } },
  { id: '2', name: 'Food & Dining', slug: 'food-dining', _count: { businesses: 0 } },
  { id: '3', name: 'Automotive', slug: 'automotive', _count: { businesses: 0 } },
  { id: '4', name: 'Home Services', slug: 'home-services', _count: { businesses: 0 } },
  { id: '5', name: 'Fitness & Health', slug: 'fitness-health', _count: { businesses: 0 } },
  { id: '6', name: 'Professional', slug: 'professional-services', _count: { businesses: 0 } },
];

export default function HomePage() {
  const { data: categories = fallbackCategories, isLoading: categoriesLoading } = useCategories();
  const { data: stats } = useStats();

  const features = [
    {
      icon: MapPin,
      title: 'Local Discovery',
      description: 'Find trusted businesses in your neighborhood',
    },
    {
      icon: MessageCircle,
      title: 'Instant Chat',
      description: 'Connect directly with business owners',
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Schedule appointments in seconds',
    },
    {
      icon: Star,
      title: 'Verified Reviews',
      description: 'Real feedback from real customers',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Live availability and wait times',
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Verified businesses you can count on',
    },
  ];

  // Format numbers with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Display categories (limit to 6 for homepage)
  const displayCategories = (categories || fallbackCategories).slice(0, 6);

  return (
    <div className="relative min-h-screen bg-neutral-950">
      {/* Video Background Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background - Using local video */}
        <div className="absolute inset-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/main-search-video-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/main-search-video.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Gradient at bottom for content transition */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-neutral-950 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight mb-6">
            Find local businesses
            <br />
            <span className="text-white/60">you'll love</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto">
            Discover, connect, and book with trusted local services. 
            All in one place.
          </p>

          {/* Search Bar */}
          <div className="mb-12">
            <HeroSearch />
          </div>

          {/* Dynamic Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-medium">
                {stats?.totalBusinesses ? `${formatNumber(stats.totalBusinesses)}+` : '—'}
              </span>
              <span>businesses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-medium">
                {stats?.totalReviews ? `${formatNumber(stats.totalReviews)}+` : '—'}
              </span>
              <span>reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-medium">
                {stats?.totalBookings ? `${formatNumber(stats.totalBookings)}+` : '—'}
              </span>
              <span>bookings</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Browse by category
            </h2>
            <p className="text-neutral-400 text-lg">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 animate-pulse"
                >
                  <div className="w-10 h-10 bg-neutral-800 rounded-lg mb-3" />
                  <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-neutral-800 rounded w-1/2" />
                </div>
              ))
            ) : (
              displayCategories.map((category) => (
                <Link
                  key={category.id || category.slug}
                  href={`/search?category=${category.slug}`}
                  className="group p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/30 hover:bg-neutral-900 transition-all duration-300"
                >
                  <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">
                    {categoryEmojis[category.slug] || '📁'}
                  </div>
                  <h3 className="font-medium text-white text-sm mb-1 group-hover:text-purple-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {(category as { _count?: { businesses: number } })._count?.businesses || 0} places
                  </p>
                </Link>
              ))
            )}
          </div>

          {/* View All Categories Link */}
          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View all categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Why tarsit?
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Everything you need to discover and connect with local businesses
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/20 transition-all duration-300"
              >
                <feature.icon className="h-6 w-6 text-purple-400 mb-4" />
                <h3 className="font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of businesses reaching new customers every day. 
            Get started for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/business/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-neutral-950 bg-white hover:bg-neutral-100 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              List your business
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/business/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-transparent border border-neutral-700 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-full transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-neutral-400 text-sm">
              © 2024 tarsit. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="text-neutral-400 hover:text-white transition-colors link-underline">
                About
              </Link>
              <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors link-underline">
                Privacy
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors link-underline">
                Terms
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors link-underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
