'use client';

import { ArrowRight, Loader2, Locate, Scissors, Search, Utensils, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Rotating service words for placeholder
const rotatingServices = [
  'barbers',
  'restaurants',
  'photographers',
  'dentists',
  'gyms',
  'salons',
  'mechanics',
  'cafes',
  'spas',
  'tutors',
];

// Popular searches with icons for better mobile UX
const popularSearches = [
  { term: 'Hair Salon', icon: Scissors },
  { term: 'Restaurant', icon: Utensils },
  { term: 'Gym', icon: null },
  { term: 'Dentist', icon: null },
  { term: 'Coffee', icon: null },
];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [showMoreSearches, setShowMoreSearches] = useState(false);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingServices.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Get user's location
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode to get city name
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Near you';
          setLocation(city);
        } catch {
          setLocation('Near you');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert('Unable to get your location. Please enter it manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);

    router.push(`/search?${params.toString()}`);
  };

  // Mobile: show only 3 items unless expanded
  const visibleSearches = showMoreSearches ? popularSearches : popularSearches.slice(0, 3);

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      {/* Search Container - Mobile Optimized */}
      <div
        className={`relative bg-white/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden ${
          isFocused ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-white/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Search Input - Mobile First */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder={`Find nearby ${rotatingServices[placeholderIndex]}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full h-14 sm:h-14 pl-12 pr-10 bg-transparent text-white placeholder:text-white/40 border-none outline-none text-base sm:text-sm focus:ring-0"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-white/40" />
              </button>
            )}
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden sm:block w-px bg-white/10" />

          {/* Location Input with Geolocation */}
          <div className="relative border-t sm:border-t-0 border-white/10 flex items-center">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-50"
              title="Use my location"
            >
              {isLocating ? (
                <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
              ) : (
                <Locate className="h-5 w-5 text-purple-400" />
              )}
            </button>
            <input
              type="text"
              placeholder="Your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full sm:w-48 h-14 sm:h-14 pl-12 pr-4 bg-transparent text-white placeholder:text-white/40 border-none outline-none text-base sm:text-sm focus:ring-0"
              enterKeyHint="search"
              autoComplete="off"
            />
          </div>

          {/* Search Button - Full width on mobile */}
          <div className="p-2">
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-6 bg-white text-neutral-900 rounded-xl font-medium text-base sm:text-sm hover:bg-neutral-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Searches - Improved Mobile UX with larger touch targets */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <span className="text-xs text-white/30 mr-1">Popular:</span>
          {visibleSearches.map(({ term, icon: Icon }) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                const params = new URLSearchParams();
                params.set('q', term);
                if (location) params.set('location', location);
                router.push(`/search?${params.toString()}`);
              }}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-white/60 hover:text-white active:text-white bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-full transition-all whitespace-nowrap active:scale-[0.98]"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {term}
            </button>
          ))}
          {/* Show More/Less toggle on mobile */}
          {!showMoreSearches && popularSearches.length > 3 && (
            <button
              type="button"
              onClick={() => setShowMoreSearches(true)}
              className="sm:hidden px-3 py-2.5 min-h-[44px] text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              +{popularSearches.length - 3} more
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
