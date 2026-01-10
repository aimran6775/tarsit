'use client';

import {
  Award,
  Building2,
  ChevronRight,
  ExternalLink,
  Globe,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Star,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Business, CATEGORY_COLORS } from './types';

interface QuickViewModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function QuickViewModal({
  business,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: QuickViewModalProps) {
  if (!isOpen || !business) return null;

  const getPriceDisplay = (priceRange: string) => {
    switch (priceRange) {
      case 'BUDGET':
        return { text: '$', color: 'text-emerald-400', label: 'Budget Friendly' };
      case 'MODERATE':
        return { text: '$$', color: 'text-amber-400', label: 'Moderate' };
      case 'EXPENSIVE':
        return { text: '$$$', color: 'text-rose-400', label: 'Premium' };
      default:
        return { text: '$$', color: 'text-white/50', label: 'Varies' };
    }
  };

  const price = getPriceDisplay(business.priceRange);
  const categoryStyle = CATEGORY_COLORS[business.category.slug] || CATEGORY_COLORS.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-neutral-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image Header */}
        <div className="relative h-56 bg-gradient-to-br from-neutral-800 to-neutral-900">
          {business.primaryPhoto ? (
            <Image
              src={business.primaryPhoto.url}
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-20 w-20 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {business.featured && (
              <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold flex items-center gap-1.5 shadow-lg">
                <Zap className="h-4 w-4" />
                Featured
              </span>
            )}
            {business.verified && (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/90 backdrop-blur-sm text-white text-sm font-semibold flex items-center gap-1.5 shadow-lg">
                <Award className="h-4 w-4" />
                Verified
              </span>
            )}
          </div>

          {/* Price & Rating on Image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium mb-2 ${categoryStyle.bg} ${categoryStyle.text}`}
              >
                {business.category.name}
              </span>
              <h2 className="text-2xl font-bold text-white">{business.name}</h2>
              <p className="text-white/60 flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4" />
                {business.city}, {business.state}
                {business.distance && (
                  <span className="ml-2 flex items-center gap-1 text-white/40">
                    <Navigation className="h-3 w-3" />
                    {business.distance.toFixed(1)} mi
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white text-lg">{business.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-white/50">{business.reviewCount} reviews</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-white/70 leading-relaxed mb-6">{business.description}</p>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className={`text-xl font-bold ${price.color}`}>{price.text}</span>
              <p className="text-xs text-white/40 mt-1">{price.label}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-xl font-bold text-amber-400">{business.rating.toFixed(1)}</span>
              <p className="text-xs text-white/40 mt-1">Rating</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-xl font-bold text-blue-400">{business.reviewCount}</span>
              <p className="text-xs text-white/40 mt-1">Reviews</p>
            </div>
          </div>

          {/* Contact Info (if available) */}
          {(business.phone || business.website) && (
            <div className="flex flex-wrap gap-3 mb-6">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Phone className="h-4 w-4" />
                  {business.phone}
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/business/${business.slug}`}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              View Full Profile
              <ChevronRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onToggleFavorite(business.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-rose-400'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() =>
                navigator.share?.({ title: business.name, url: `/business/${business.slug}` })
              }
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
