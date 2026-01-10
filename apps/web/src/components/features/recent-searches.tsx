'use client';

import { Clock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tarsit_recent_searches';
const MAX_RECENT = 5;

interface RecentSearch {
  query: string;
  location?: string;
  timestamp: number;
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSearches(JSON.parse(stored));
      } catch {
        setSearches([]);
      }
    }
  }, []);

  const addSearch = (query: string, location?: string) => {
    const newSearch: RecentSearch = {
      query,
      location,
      timestamp: Date.now(),
    };

    setSearches((prev) => {
      // Remove duplicates
      const filtered = prev.filter(
        (s) => !(s.query.toLowerCase() === query.toLowerCase() && s.location === location)
      );
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearches = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSearches([]);
  };

  const removeSearch = (index: number) => {
    setSearches((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { searches, addSearch, clearSearches, removeSearch };
}

export function RecentSearches() {
  const router = useRouter();
  const { searches, removeSearch, clearSearches } = useRecentSearches();

  if (searches.length === 0) return null;

  const handleSearchClick = (search: RecentSearch) => {
    const params = new URLSearchParams();
    params.set('q', search.query);
    if (search.location) params.set('location', search.location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Clock className="h-3 w-3" />
          Recent searches
        </div>
        <button
          onClick={clearSearches}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <div
            key={`${search.query}-${search.timestamp}`}
            className="group flex items-center gap-1 pl-3 pr-1.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <button onClick={() => handleSearchClick(search)} className="hover:text-white">
              {search.query}
              {search.location && (
                <span className="text-white/40 ml-1">in {search.location}</span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSearch(index);
              }}
              className="p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
