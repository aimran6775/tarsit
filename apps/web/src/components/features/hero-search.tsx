'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    
    router.push(`/search?${params.toString()}`);
  };

  const popularSearches = ['Hair Salon', 'Coffee Shop', 'Gym', 'Restaurant', 'Dentist'];

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      {/* Search Container */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 pl-11 pr-4 bg-transparent text-white placeholder:text-white/40 border-none outline-none text-sm focus:ring-0"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-white/10" />

          {/* Location Input */}
          <div className="relative border-t sm:border-t-0 border-white/10">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full sm:w-40 h-14 pl-11 pr-4 bg-transparent text-white placeholder:text-white/40 border-none outline-none text-sm focus:ring-0"
            />
          </div>

          {/* Search Button */}
          <div className="p-2">
            <button
              type="submit"
              className="w-full sm:w-auto h-10 px-5 bg-white text-neutral-900 rounded-xl font-medium text-sm hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-white/30">Try:</span>
        {popularSearches.map((term) => (
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
            className="px-3 py-1.5 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </form>
  );
}
