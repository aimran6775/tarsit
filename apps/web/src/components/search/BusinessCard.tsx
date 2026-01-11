'use client';

import { getOptimizedImageUrl, isSupabaseStorageUrl } from '@/lib/image-optimization';
import {
    Award,
    Building2,
    Check,
    ChevronRight,
    Eye,
    Heart,
    MapPin,
    Navigation,
    Share2,
    Star,
    TrendingUp,
    Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Business, CATEGORY_COLORS } from './types';

interface BusinessCardProps {
  business: Business;
  viewMode: 'grid' | 'list' | 'compact';
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onQuickView?: (business: Business) => void;
  index?: number;
}

export function BusinessCard({
  business,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onQuickView,
  index = 0,
}: BusinessCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Memoize optimized image URLs for better performance
  const optimizedImageUrl = useMemo(() => {
    if (!business.primaryPhoto?.url) return null;
    const url = business.primaryPhoto.url;

    // For compact view, use smaller image
    if (viewMode === 'compact') {
      return isSupabaseStorageUrl(url)
        ? getOptimizedImageUrl(url, { width: 128, height: 128, quality: 70 })
        : url;
    }

    // For grid/list view, use card-sized image
    return isSupabaseStorageUrl(url)
      ? getOptimizedImageUrl(url, { width: 400, height: 300, quality: 80 })
      : url;
  }, [business.primaryPhoto?.url, viewMode]);

  const getPriceDisplay = (priceRange: string) => {
    switch (priceRange) {
      case 'BUDGET':
        return {
          text: '$',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          label: 'Budget Friendly',
        };
      case 'MODERATE':
        return { text: '$$', color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Moderate' };
      case 'EXPENSIVE':
        return { text: '$$$', color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'Premium' };
      default:
        return { text: '$$', color: 'text-white/50', bg: 'bg-white/10', label: 'Varies' };
    }
  };

  const getCategoryStyle = (slug: string) => {
    return CATEGORY_COLORS[slug] || CATEGORY_COLORS.default;
  };

  const price = getPriceDisplay(business.priceRange);
  const categoryStyle = getCategoryStyle(business.category.slug);

  // Animation delay based on index for staggered appearance
  const animationDelay = `${index * 50}ms`;

  if (viewMode === 'compact') {
    return (
      <Link
        href={`/business/${business.slug}`}
        className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
        style={{ animationDelay }}
      >
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
          {optimizedImageUrl ? (
            <Image
              src={optimizedImageUrl}
              alt={business.name}
              fill
              sizes="64px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white/20" />
            </div>
          )}
          {business.verified && (
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white group-hover:text-purple-400 truncate transition-colors">
            {business.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className={categoryStyle.text}>{business.category.name}</span>
            {business.region && (
              <>
                <span>•</span>
                <span title={business.region.name}>{business.region.flag}</span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {business.rating.toFixed(1)}
            </span>
            <span>•</span>
            <span className={price.color}>{price.text}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
      </Link>
    );
  }

  if (viewMode === 'list') {
    return (
      <Link
        href={`/business/${business.slug}`}
        className="group block"
        style={{ animationDelay }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm">
          {/* Image Section */}
          <div className="relative w-48 md:w-64 flex-shrink-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
            {optimizedImageUrl ? (
              <>
                {!imageLoaded && <div className="absolute inset-0 bg-neutral-800 animate-pulse" />}
                <Image
                  src={optimizedImageUrl}
                  alt={business.name}
                  fill
                  sizes="(max-width: 768px) 192px, 256px"
                  className={`object-cover transition-all duration-500 ${
                    isHovered ? 'scale-105' : 'scale-100'
                  } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-white/20" />
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {business.featured && (
                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                  <TrendingUp className="h-3 w-3" />
                  Featured
                </span>
              )}
              {business.verified && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            {/* Quick Actions */}
            <div
              className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(business.id);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
                  isFavorite
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-rose-400 border border-white/10'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              {onQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onQuickView(business);
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm text-white/70 hover:bg-black/70 hover:text-white border border-white/10 transition-all"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-medium uppercase tracking-wide ${categoryStyle.text}`}
                  >
                    {business.category.name}
                  </span>
                  {business.region && (
                    <span className="text-xs text-white/60 flex items-center gap-1" title={business.region.name}>
                      {business.region.flag}
                    </span>
                  )}
                </div>
                {business.distance && (
                  <span className="text-xs text-white/40 flex items-center gap-1 inline-flex">
                    <Navigation className="h-3 w-3" />
                    {business.distance.toFixed(1)} mi
                  </span>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded-md ${price.bg} ${price.color} text-xs font-semibold`}
              >
                {price.text}
              </span>
            </div>

            <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-purple-400 transition-colors">
              {business.name}
            </h3>

            <p className="text-sm text-white/40 flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {business.city}, {business.state}
            </p>

            <p className="text-sm text-white/60 line-clamp-2 mb-4 flex-1">{business.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-amber-400">{business.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-white/40">{business.reviewCount} reviews</span>
              </div>
              <span className="text-sm text-purple-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Details
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View (default) - Mobile Optimized
  return (
    <Link
      href={`/business/${business.slug}`}
      className="group block"
      style={{ animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 active:border-purple-500/50 hover:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm h-full flex flex-col active:scale-[0.99]">
        {/* Image Section - Shorter on mobile */}
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden">
          {optimizedImageUrl ? (
            <>
              {!imageLoaded && <div className="absolute inset-0 bg-neutral-800 animate-pulse" />}
              <Image
                src={optimizedImageUrl}
                alt={business.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-cover transition-all duration-500 ${
                  isHovered ? 'scale-110' : 'scale-100'
                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-white/10" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {business.featured && (
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg shadow-amber-500/30">
                <Zap className="h-3 w-3" />
                Featured
              </span>
            )}
            {business.verified && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                <Award className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          {/* Actions - Always visible on mobile, hover reveal on desktop */}
          <div
            className={`absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'sm:opacity-0 sm:-translate-y-2'
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(business.id);
              }}
              className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm active:scale-95 ${
                isFavorite
                  ? 'bg-rose-500 text-white scale-110'
                  : 'bg-black/50 text-white/70 hover:bg-rose-500 active:bg-rose-600 hover:text-white border border-white/20'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigator.share?.({ title: business.name, url: `/business/${business.slug}` });
              }}
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm text-white/70 hover:bg-white/20 active:bg-white/30 hover:text-white border border-white/20 transition-all active:scale-95"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-white">{business.rating.toFixed(1)}</span>
              <span className="text-white/50 text-sm">({business.reviewCount})</span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm ${price.color} font-semibold border border-white/10`}
            >
              {price.text}
            </span>
          </div>
        </div>

        {/* Content Section - Compact on mobile */}
        <div className="p-3.5 sm:p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide px-1.5 sm:px-2 py-0.5 rounded-md ${categoryStyle.bg} ${categoryStyle.text}`}
              >
                {business.category.name}
              </span>
              {business.region && (
                <span className="text-[10px] sm:text-xs text-white/60 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5" title={business.region.name}>
                  {business.region.flag}
                </span>
              )}
            </div>
            {business.distance && (
              <span className="text-[10px] sm:text-xs text-white/40 flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {business.distance.toFixed(1)} mi
              </span>
            )}
          </div>

          <h3 className="font-semibold text-base sm:text-lg text-white mb-0.5 sm:mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
            {business.name}
          </h3>

          <p className="text-xs sm:text-sm text-white/40 flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            <span className="truncate">
              {business.city}, {business.state}
            </span>
          </p>

          <p className="text-xs sm:text-sm text-white/60 line-clamp-2 flex-1 hidden sm:block">
            {business.description}
          </p>

          {/* Quick Action Bar - Simpler on mobile */}
          <div
            className={`mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-white/10 flex items-center justify-between transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-white text-sm">{business.rating.toFixed(1)}</span>
              <span className="text-white/40 text-xs">({business.reviewCount})</span>
            </div>
            <span className="text-xs sm:text-sm text-purple-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
