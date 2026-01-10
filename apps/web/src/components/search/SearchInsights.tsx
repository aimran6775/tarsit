'use client';

import {
  Award,
  Building2,
  DollarSign,
  Flame,
  MapPin,
  Star,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Business, SearchResponse } from './types';

interface SearchInsightsProps {
  results: SearchResponse | null;
  businesses: Business[];
  query: string;
  location: string;
  hasLocation: boolean;
  className?: string;
}

export function SearchInsights({
  results,
  businesses,
  query: _query,
  location: _location,
  hasLocation,
  className = '',
}: SearchInsightsProps) {
  if (!results || businesses.length === 0) return null;

  // Calculate insights
  const avgRating = businesses.reduce((acc, b) => acc + b.rating, 0) / businesses.length;
  const totalReviews = businesses.reduce((acc, b) => acc + b.reviewCount, 0);
  const verifiedCount = businesses.filter((b) => b.verified).length;
  const featuredCount = businesses.filter((b) => b.featured).length;
  const nearbyCount = hasLocation
    ? businesses.filter((b) => b.distance && b.distance < 5).length
    : 0;

  // Price distribution
  const priceDistribution = {
    budget: businesses.filter((b) => b.priceRange === 'BUDGET').length,
    moderate: businesses.filter((b) => b.priceRange === 'MODERATE').length,
    expensive: businesses.filter((b) => b.priceRange === 'EXPENSIVE').length,
  };

  // Top category
  const categoryCount = businesses.reduce(
    (acc, b) => {
      acc[b.category.name] = (acc[b.category.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  // Rating distribution
  const highRated = businesses.filter((b) => b.rating >= 4.5).length;

  return (
    <div className={`${className}`}>
      {/* Main Insights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Total Results */}
        <InsightCard
          icon={<Building2 className="h-5 w-5" />}
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          value={results.pagination.total}
          label="Businesses Found"
        />

        {/* Average Rating */}
        <InsightCard
          icon={<Star className="h-5 w-5 fill-current" />}
          iconBg="bg-amber-500/20"
          iconColor="text-amber-400"
          value={avgRating.toFixed(1)}
          label="Avg Rating"
          suffix="★"
        />

        {/* Total Reviews */}
        <InsightCard
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
          value={formatNumber(totalReviews)}
          label="Total Reviews"
        />

        {/* Verified */}
        <InsightCard
          icon={<Award className="h-5 w-5" />}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          value={verifiedCount}
          label="Verified"
          suffix={`/ ${businesses.length}`}
        />
      </div>

      {/* Secondary Insights */}
      <div className="flex flex-wrap gap-2">
        {/* High Rated */}
        {highRated > 0 && (
          <InsightBadge
            icon={<Flame className="h-3.5 w-3.5 text-orange-400" />}
            text={`${highRated} highly rated (4.5+)`}
          />
        )}

        {/* Featured */}
        {featuredCount > 0 && (
          <InsightBadge
            icon={<TrendingUp className="h-3.5 w-3.5 text-amber-400" />}
            text={`${featuredCount} featured`}
          />
        )}

        {/* Nearby */}
        {nearbyCount > 0 && (
          <InsightBadge
            icon={<MapPin className="h-3.5 w-3.5 text-green-400" />}
            text={`${nearbyCount} within 5 miles`}
          />
        )}

        {/* Top Category */}
        {topCategory && (
          <InsightBadge
            icon={<Target className="h-3.5 w-3.5 text-indigo-400" />}
            text={`Most: ${topCategory[0]} (${topCategory[1]})`}
          />
        )}

        {/* Price Mix */}
        <InsightBadge
          icon={<DollarSign className="h-3.5 w-3.5 text-emerald-400" />}
          text={`$: ${priceDistribution.budget} | $$: ${priceDistribution.moderate} | $$$: ${priceDistribution.expensive}`}
        />
      </div>
    </div>
  );
}

// Insight Card Component
function InsightCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  suffix,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {suffix && <span className="text-sm text-white/40">{suffix}</span>}
      </div>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </div>
  );
}

// Insight Badge Component
function InsightBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
      {icon}
      {text}
    </div>
  );
}

// Helper function
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
