'use client';

import { ArrowLeft, Building2, Check, Heart, MapPin, Share2, Star } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BusinessDetail } from '../types';

interface BusinessHeroProps {
  business: BusinessDetail;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function BusinessHero({ business, isFavorited, onToggleFavorite }: BusinessHeroProps) {
  const router = useRouter();
  const primaryPhoto =
    business.coverImage ||
    business.photos?.find((p) => p.featured)?.url ||
    business.photos?.[0]?.url;

  const getPriceRangeDisplay = (priceRange: string) => {
    switch (priceRange) {
      case 'BUDGET':
        return '$';
      case 'MODERATE':
        return '$$';
      case 'EXPENSIVE':
        return '$$$';
      default:
        return '$$';
    }
  };

  return (
    <div className="relative h-64 sm:h-72 md:h-96 bg-neutral-900">
      {primaryPhoto ? (
        <Image
          src={primaryPhoto}
          alt={business.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={80}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
          <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-white/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Navigation - Larger touch targets on mobile */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex justify-between items-center safe-area-top">
        <button
          onClick={() => router.back()}
          className="h-11 w-11 sm:h-10 sm:w-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 active:bg-black/70 transition-colors active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            className={`h-11 w-11 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 active:bg-black/70'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => navigator.share?.({ url: window.location.href, title: business.name })}
            className="h-11 w-11 sm:h-10 sm:w-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 active:bg-black/70 transition-colors active:scale-95"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Business Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Logo - Hidden on mobile for more content space */}
            {business.logoImage && (
              <div className="hidden md:block w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1 shadow-lg flex-shrink-0">
                <Image
                  src={business.logoImage}
                  alt={`${business.name} logo`}
                  width={72}
                  height={72}
                  className="rounded-lg object-cover"
                  sizes="72px"
                  quality={80}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-medium">
                  {business.category.name}
                </span>
                {business.verified && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-500 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1">
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    Verified
                  </span>
                )}
                {business.featured && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500 rounded-full text-[10px] sm:text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2 line-clamp-2">
                {business.name}
              </h1>

              {business.tagline && (
                <p className="text-white/80 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 line-clamp-1">
                  {business.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="flex items-center bg-amber-400 text-neutral-900 px-1.5 sm:px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current mr-0.5 sm:mr-1" />
                    <span className="font-semibold text-xs sm:text-sm">
                      {business.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-white/70 text-xs">({business.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-white/80">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {business.city}, {business.state}
                  </span>
                </div>
                <div className="text-emerald-400 font-semibold">
                  {getPriceRangeDisplay(business.priceRange)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
