'use client';

import { Crosshair, MapPin, Search, X } from 'lucide-react';
import { Category } from './types';

interface SmartSearchBarProps {
  query: string;
  location: string;
  onQueryChange: (query: string) => void;
  onLocationChange: (location: string) => void;
  onSearch: (query: string, location: string) => void;
  onUseLocation: () => void;
  geoLoading?: boolean;
  categories: Category[];
  className?: string;
}

export function SmartSearchBar({
  query,
  location,
  onQueryChange,
  onLocationChange,
  onSearch,
  onUseLocation,
  geoLoading,
  className = '',
}: SmartSearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 sm:gap-2 sm:flex-row ${className}`}
    >
      {/* Search Input - Larger touch target on mobile */}
      <div className="flex-1 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-4 sm:w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search businesses..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full h-12 sm:h-10 pl-11 sm:pl-10 pr-10 rounded-xl sm:rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 text-base sm:text-sm transition-all"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4 text-white/40" />
          </button>
        )}
      </div>

      {/* Location Input - Full width on mobile */}
      <div className="w-full sm:w-48 relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-4 sm:w-4 text-white/40" />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full h-12 sm:h-10 pl-11 sm:pl-10 pr-12 rounded-xl sm:rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 text-base sm:text-sm transition-all"
          enterKeyHint="search"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onUseLocation}
          disabled={geoLoading}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-target"
          title="Use my location"
        >
          <Crosshair className={`h-4 w-4 text-white/40 ${geoLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Button - Full width on mobile */}
      <button
        type="submit"
        className="h-12 sm:h-10 px-6 sm:px-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl sm:rounded-lg text-base sm:text-sm font-medium transition-all active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  );
}
