'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, MapPin, Star, Check, Building2 } from 'lucide-react';
import { BusinessDetail } from '../types';

interface BusinessHeroProps {
  business: BusinessDetail;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function BusinessHero({ business, isFavorited, onToggleFavorite }: BusinessHeroProps) {
  const primaryPhoto = business.coverImage || 
    business.photos?.find(p => p.featured)?.url || 
    business.photos?.[0]?.url;

  const getPriceRangeDisplay = (priceRange: string) => {
    switch (priceRange) {
      case 'BUDGET': return '$';
      case 'MODERATE': return '$$';
      case 'EXPENSIVE': return '$$$';
      default: return '$$';
    }
  };

  return (
    <div className="relative h-72 md:h-96 bg-neutral-900">
      {primaryPhoto ? (
        <Image
          src={primaryPhoto}
          alt={business.name}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
          <Building2 className="h-20 w-20 text-white/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Link 
          href="/search" 
          className="h-10 w-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex gap-2">
          <button 
            onClick={onToggleFavorite}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
              isFavorited 
                ? 'bg-red-500 text-white' 
                : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => navigator.share?.({ url: window.location.href, title: business.name })}
            className="h-10 w-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Business Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            {/* Logo */}
            {business.logoImage && (
              <div className="hidden md:block w-20 h-20 rounded-xl bg-white p-1 shadow-lg flex-shrink-0">
                <Image
                  src={business.logoImage}
                  alt={`${business.name} logo`}
                  width={72}
                  height={72}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  {business.category.name}
                </span>
                {business.verified && (
                  <span className="px-2.5 py-1 bg-emerald-500 rounded-full text-xs font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {business.featured && (
                  <span className="px-2.5 py-1 bg-amber-500 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{business.name}</h1>
              
              {business.tagline && (
                <p className="text-white/80 text-sm md:text-base mb-3">{business.tagline}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-amber-400 text-neutral-900 px-2 py-0.5 rounded-full">
                    <Star className="h-3.5 w-3.5 fill-current mr-1" />
                    <span className="font-semibold">{business.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-white/70">({business.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/80">
                  <MapPin className="h-4 w-4" />
                  {business.city}, {business.state}
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
