'use client';

import {
  Accessibility,
  Award,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Filter,
  Package,
  PawPrint,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Truck,
  Wifi,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { AMENITY_OPTIONS, Category, PRICE_OPTIONS, RATING_OPTIONS, SORT_OPTIONS } from './types';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  filters: {
    category: string;
    priceRange: string;
    rating: string;
    sortBy: string;
    amenities: string[];
    openNow: boolean;
    verified: boolean;
  };
  onFiltersChange: (filters: {
    category: string;
    priceRange: string;
    rating: string;
    sortBy: string;
    amenities: string[];
    openNow: boolean;
    verified: boolean;
  }) => void;
  onApply: () => void;
  onClear: () => void;
}

export function AdvancedFilters({
  isOpen,
  onClose,
  categories,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'price', 'rating', 'sort'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    updateFilter('amenities', updated);
  };

  const activeCount = [
    filters.category,
    filters.priceRange,
    filters.rating,
    filters.sortBy !== 'relevance' ? filters.sortBy : '',
    ...(filters.amenities || []),
    filters.openNow ? 'open' : '',
    filters.verified ? 'verified' : '',
  ].filter(Boolean).length;

  // Icon helper
  const getAmenityIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Wifi: <Wifi className="h-4 w-4" />,
      Car: <Car className="h-4 w-4" />,
      Accessibility: <Accessibility className="h-4 w-4" />,
      PawPrint: <PawPrint className="h-4 w-4" />,
      Sun: <Sun className="h-4 w-4" />,
      Truck: <Truck className="h-4 w-4" />,
      Package: <Package className="h-4 w-4" />,
      Calendar: <Calendar className="h-4 w-4" />,
    };
    return icons[iconName] || <Filter className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                <SlidersHorizontal className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                {activeCount > 0 && <p className="text-xs text-white/50">{activeCount} active</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('openNow', !filters.openNow)}
                className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  filters.openNow
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Clock className="h-4 w-4" />
                Open Now
              </button>
              <button
                onClick={() => updateFilter('verified', !filters.verified)}
                className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  filters.verified
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Award className="h-4 w-4" />
                Verified
              </button>
            </div>

            {/* Category Filter */}
            <FilterSection
              title="Category"
              icon={<Filter className="h-4 w-4 text-purple-400" />}
              isExpanded={expandedSections.has('category')}
              onToggle={() => toggleSection('category')}
            >
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => updateFilter('category', '')}
                    className="w-4 h-4 text-purple-500 border-white/30 bg-transparent focus:ring-purple-500"
                  />
                  <span className="text-sm text-white">All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      filters.category === cat.slug
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat.slug}
                      onChange={() => updateFilter('category', cat.slug)}
                      className="w-4 h-4 text-purple-500 border-white/30 bg-transparent focus:ring-purple-500"
                    />
                    <span className="text-sm text-white flex-1">{cat.name}</span>
                    {cat._count && (
                      <span className="text-xs text-white/40 px-2 py-0.5 bg-white/10 rounded-full">
                        {cat._count.businesses}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range Filter */}
            <FilterSection
              title="Price Range"
              icon={<DollarSign className="h-4 w-4 text-purple-400" />}
              isExpanded={expandedSections.has('price')}
              onToggle={() => toggleSection('price')}
            >
              <div className="grid grid-cols-2 gap-2">
                {PRICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      updateFilter('priceRange', filters.priceRange === opt.value ? '' : opt.value)
                    }
                    className={`p-3 rounded-xl text-center transition-all ${
                      filters.priceRange === opt.value
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg font-semibold">{opt.symbol || opt.icon}</span>
                    <p className="text-xs mt-1">{opt.label}</p>
                    {opt.description && (
                      <p className="text-[10px] text-white/40">{opt.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Rating Filter */}
            <FilterSection
              title="Minimum Rating"
              icon={<Star className="h-4 w-4 text-purple-400" />}
              isExpanded={expandedSections.has('rating')}
              onToggle={() => toggleSection('rating')}
            >
              <div className="space-y-2">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      updateFilter('rating', filters.rating === opt.value ? '' : opt.value)
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      filters.rating === opt.value
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm text-white">{opt.label}</span>
                    {opt.stars > 0 && (
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(opt.stars)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Sort By */}
            <FilterSection
              title="Sort By"
              icon={<Sparkles className="h-4 w-4 text-purple-400" />}
              isExpanded={expandedSections.has('sort')}
              onToggle={() => toggleSection('sort')}
            >
              <div className="space-y-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('sortBy', opt.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      filters.sortBy === opt.value
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {filters.sortBy === opt.value && <Check className="h-4 w-4 text-purple-400" />}
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white">{opt.label}</p>
                      <p className="text-xs text-white/40">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Amenities */}
            <FilterSection
              title="Amenities"
              icon={<Wifi className="h-4 w-4 text-purple-400" />}
              isExpanded={expandedSections.has('amenities')}
              onToggle={() => toggleSection('amenities')}
            >
              <div className="grid grid-cols-2 gap-2">
                {AMENITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleAmenity(opt.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                      filters.amenities?.includes(opt.value)
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {getAmenityIcon(opt.icon)}
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-6 space-y-3 bg-neutral-900/80 backdrop-blur-sm">
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              Apply Filters
              {activeCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{activeCount}</span>
              )}
            </button>
            <button
              onClick={onClear}
              className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collapsible Filter Section Component
function FilterSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-white">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-white/40" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/40" />
        )}
      </button>
      {isExpanded && <div className="p-4 border-t border-white/10">{children}</div>}
    </div>
  );
}
