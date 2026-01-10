'use client';

import { Grid3X3, List, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';
import { PRICE_OPTIONS, RATING_OPTIONS, SORT_OPTIONS, ViewMode } from './types';

interface ResultsHeaderProps {
  query?: string;
  categoryName?: string;
  totalResults: number;
  hasLocation: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeFiltersCount: number;
  onOpenFilters: () => void;
  className?: string;
}

export function ResultsHeader({
  query,
  categoryName,
  totalResults,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  activeFiltersCount,
  onOpenFilters,
  className = '',
}: ResultsHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      {/* Results count */}
      <p className="text-sm text-white/60">
        <span className="text-white font-medium">{totalResults}</span> results
        {query && <span className="text-white/40"> for "{query}"</span>}
        {categoryName && !query && <span className="text-white/40"> in {categoryName}</span>}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`p-1.5 rounded ${viewMode === 'map' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <MapIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-8 px-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-neutral-900">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filters */}
        <button
          onClick={onOpenFilters}
          className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 flex items-center gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

interface ActiveFiltersBarProps {
  filters: {
    category: string;
    categoryName?: string;
    priceRange: string;
    rating: string;
    sortBy: string;
    openNow: boolean;
    verified: boolean;
  };
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFiltersBar({
  filters,
  onRemoveFilter,
  onClearAll,
  className = '',
}: ActiveFiltersBarProps) {
  const activeFilters: { key: string; label: string }[] = [];

  if (filters.category && filters.categoryName) {
    activeFilters.push({ key: 'category', label: filters.categoryName });
  }
  if (filters.priceRange) {
    const priceOption = PRICE_OPTIONS.find((p) => p.value === filters.priceRange);
    activeFilters.push({ key: 'priceRange', label: priceOption?.label || filters.priceRange });
  }
  if (filters.rating) {
    const ratingOption = RATING_OPTIONS.find((r) => r.value === filters.rating);
    activeFilters.push({ key: 'rating', label: ratingOption?.description || `${filters.rating}+` });
  }
  if (filters.openNow) {
    activeFilters.push({ key: 'openNow', label: 'Open Now' });
  }
  if (filters.verified) {
    activeFilters.push({ key: 'verified', label: 'Verified' });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {activeFilters.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white/70 bg-white/5 border border-white/10"
        >
          {label}
          <button onClick={() => onRemoveFilter(key)} className="hover:text-rose-400">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button onClick={onClearAll} className="text-xs text-purple-400 hover:text-purple-300">
        Clear
      </button>
    </div>
  );
}
