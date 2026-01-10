'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string, location?: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'hero' | 'minimal';
}

export function SearchBar({ 
  onSearch, 
  placeholder = 'Search businesses...', 
  className = '',
  compact = false,
  variant: _variant = 'default'
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(query, location);
    } else {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (location) params.set('location', location);
      router.push(`/search?${params.toString()}`);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-transparent text-white placeholder:text-neutral-500 border-none outline-none text-sm"
          />
        </div>

        {/* Location Input */}
        <div className="relative sm:w-48 border-t sm:border-t-0 sm:border-l border-neutral-800">
          <MapPin className="absolute left-4 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-transparent text-white placeholder:text-neutral-500 border-none outline-none text-sm"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="h-12 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium text-sm transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}