'use client';

import { HeroSearch, RecentSearches, StickyCTABar } from '@/components/features';
import {
    BookFeatureIllustration,
    ConnectFeatureIllustration,
    DiscoverFeatureIllustration,
    TrustFeatureIllustration,
} from '@/components/illustrations/feature-illustrations';
import { RotatingText } from '@/components/ui/rotating-text';
import { useCategories, useStats } from '@/hooks';
import { getCategoryIcon } from '@/lib/category-icons';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    MessageCircle,
    Quote,
    Shield,
    Sparkles,
    Star,
    Store,
    TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Fallback categories if API fails
const fallbackCategories = [
  { id: '1', name: 'Beauty & Wellness', slug: 'beauty-wellness', _count: { businesses: 0 } },
  { id: '2', name: 'Food & Dining', slug: 'food-dining', _count: { businesses: 0 } },
  { id: '3', name: 'Automotive', slug: 'automotive', _count: { businesses: 0 } },
  { id: '4', name: 'Home Services', slug: 'home-services', _count: { businesses: 0 } },
  { id: '5', name: 'Fitness & Health', slug: 'fitness-health', _count: { businesses: 0 } },
  { id: '6', name: 'Professional', slug: 'professional-services', _count: { businesses: 0 } },
];

// Testimonials data
const testimonials = [
  {
    quote: "Tarsit helped me find a great barber in my new neighborhood. The booking was seamless!",
    author: "Sarah M.",
    role: "Customer",
    avatar: "S",
  },
  {
    quote: "Since listing on Tarsit, we've seen a 40% increase in new client bookings.",
    author: "Mike's Auto Shop",
    role: "Business Owner",
    avatar: "M",
  },
  {
    quote: "The instant messaging feature makes it so easy to communicate with businesses.",
    author: "James L.",
    role: "Customer",
    avatar: "J",
  },
];



export default function HomePage() {
  const { data: categories = fallbackCategories, isLoading: categoriesLoading } = useCategories();
  const { data: stats } = useStats();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Format numbers with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Display categories (limit to 6 for homepage)
  const displayCategories = (categories || fallbackCategories).slice(0, 6);

  return (
    <div className="relative min-h-screen bg-neutral-950 dark:bg-neutral-950 light:bg-slate-50">
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
          <div className="absolute inset-0 bg-black/60 dark:bg-black/60 light:bg-black/40" />
          {/* Gradient at bottom for content transition */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-neutral-950 dark:from-neutral-950 light:from-slate-50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-20">
          {/* Main Heading - Mobile optimized */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight mb-4 sm:mb-6 leading-tight">
            Discover local businesses
            <br />
            <RotatingText
              words={[
                'near you',
                'you can trust',
                'that deliver',
                'made for you',
              ]}
              className="text-purple-400 font-bold"
              interval={2500}
            />
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/50 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Create your digital presence, connect with customers, and grow. Everything you need in
            one place.
          </p>

          {/* Search Bar */}
          <div className="mb-4">
            <HeroSearch />
          </div>

          {/* Recent Searches - Personalization for returning users */}
          <div className="mb-6">
            <RecentSearches />
          </div>

          {/* How It Works - Mini Teaser */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 text-white/40">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-400" />
              </span>
              <span className="hidden sm:inline">Discover</span>
            </div>
            <ArrowRight className="h-3 w-3 text-white/20" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
              </span>
              <span className="hidden sm:inline">Connect</span>
            </div>
            <ArrowRight className="h-3 w-3 text-white/20" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400" />
              </span>
              <span className="hidden sm:inline">Book</span>
            </div>
          </div>

          {/* Business Owner CTA */}
          <div className="mb-10">
            <Link
              href="/business/register"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-purple-400 transition-colors group"
            >
              <Store className="h-4 w-4" />
              Own a business?
              <span className="text-purple-400 group-hover:underline">List it free →</span>
            </Link>
          </div>

          {/* Dynamic Stats - Mobile optimized with horizontal layout */}
          <div className="flex justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-white/40">
            <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <span className="text-white/80 font-medium text-sm sm:text-base">
                {stats?.totalBusinesses ? `${formatNumber(stats.totalBusinesses)}+` : '—'}
              </span>
              <span>presences</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <span className="text-white/80 font-medium text-sm sm:text-base">
                {stats?.totalReviews ? `${formatNumber(stats.totalReviews)}+` : '—'}
              </span>
              <span>reviews</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <span className="text-white/80 font-medium text-sm sm:text-base">
                {stats?.totalBookings ? `${formatNumber(stats.totalBookings)}+` : '—'}
              </span>
              <span>connections</span>
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
      <section className="relative py-16 sm:py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-3 sm:mb-4">
              Browse by category
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg">
              Find exactly what you're looking for
            </p>
          </div>

          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categoriesLoading
              ? // Loading skeletons
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
              : displayCategories.map((category) => {
                  const CategoryIcon = getCategoryIcon(category.slug);
                  return (
                    <Link
                      key={category.id || category.slug}
                      href={`/search?category=${category.slug}`}
                      className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/30 active:border-purple-500/50 hover:bg-neutral-900 active:bg-neutral-800/50 transition-all duration-300 active:scale-[0.98] hover:shadow-lg hover:shadow-purple-500/5"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:from-purple-500/30 group-hover:to-indigo-500/30 group-hover:border-purple-500/40 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                        <CategoryIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 transition-all duration-300 group-hover:text-purple-300 group-hover:scale-110" />
                      </div>
                      <h3 className="font-medium text-white text-xs sm:text-sm mb-0.5 sm:mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors">
                        {(category as { _count?: { businesses: number } })._count?.businesses || 0}{' '}
                        places
                      </p>
                    </Link>
                  );
                })}
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

      {/* Social Proof - Testimonials Section */}
      <section className="py-16 sm:py-20 bg-neutral-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm mb-4">
              <Sparkles className="h-4 w-4" />
              Loved by thousands
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
              What people are saying
            </h2>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentTestimonial
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 absolute inset-0 translate-x-8'
                  }`}
                >
                  <div className="text-center p-6 sm:p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                    <Quote className="h-8 w-8 text-purple-400/30 mx-auto mb-4" />
                    <p className="text-lg sm:text-xl text-white/90 mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                        {testimonial.avatar}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">{testimonial.author}</p>
                        <p className="text-neutral-500 text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-purple-400 w-6'
                      : 'bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - How It Works */}
      <section className="py-24 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">How tarsit works</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Discover, connect, and book with local businesses in three simple steps
            </p>
          </div>

          {/* Feature 1: Discover */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
                <MapPin className="h-4 w-4" />
                Step 1
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Discover local businesses</h3>
              <p className="text-neutral-400 mb-6">
                Search by category, location, or service. Our smart search helps you find exactly
                what you need, whether it's a salon, restaurant, mechanic, or home service.
              </p>
              <ul className="space-y-3">
                {[
                  'Location-based recommendations',
                  'Verified business profiles',
                  'Real customer ratings',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <DiscoverFeatureIllustration className="w-full max-w-md" />
            </div>
          </div>

          {/* Feature 2: Connect */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="flex justify-center">
              <ConnectFeatureIllustration className="w-full max-w-md" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-4">
                <MessageCircle className="h-4 w-4" />
                Step 2
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Connect directly</h3>
              <p className="text-neutral-400 mb-6">
                Chat with business owners instantly. Ask questions, get quotes, and discuss your
                needs before making a commitment.
              </p>
              <ul className="space-y-3">
                {['Instant messaging', 'Real-time responses', 'No phone tag necessary'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-neutral-300">
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Feature 3: Book */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm mb-4">
                <Calendar className="h-4 w-4" />
                Step 3
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Book with confidence</h3>
              <p className="text-neutral-400 mb-6">
                Schedule appointments online, view real-time availability, and receive instant
                confirmations. Managing your bookings has never been easier.
              </p>
              <ul className="space-y-3">
                {['Online scheduling', 'Automated reminders', 'Easy rescheduling'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <BookFeatureIllustration className="w-full max-w-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <TrustFeatureIllustration className="w-full max-w-sm" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Trusted by thousands
              </h2>
              <p className="text-neutral-400 text-lg mb-8">
                Every business on tarsit is verified. We ensure quality through real reviews,
                verified profiles, and secure transactions.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, label: 'Verified businesses', value: 'Identity checked' },
                  { icon: Star, label: 'Real reviews', value: 'Authentic feedback' },
                  { icon: Clock, label: 'Fast support', value: '24/7 available' },
                  { icon: TrendingUp, label: 'Growing network', value: '2,500+ businesses' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <item.icon className="h-5 w-5 text-emerald-400 mb-2" />
                    <p className="text-white font-medium text-sm">{item.label}</p>
                    <p className="text-neutral-500 text-xs">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to build your presence?
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of businesses with their own digital presence. Get started for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-neutral-950 bg-white hover:bg-neutral-100 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Create your Presence
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

      {/* Sticky CTA Bar - Shows on scroll */}
      <StickyCTABar
        title="Ready to grow your business?"
        ctaText="List your business free"
        ctaHref="/business/register"
        showAfterScroll={600}
      />
    </div>
  );
}
