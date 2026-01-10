'use client';

import { Loader2, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AddressSuggestion {
  displayLines: string[];
  formattedAddressLine: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  locality?: string;
  administrativeArea?: string;
  postCode?: string;
  country?: string;
  subLocality?: string;
  thoroughfare?: string;
  subThoroughfare?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Start typing your address...',
  error,
  className = '',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Apple Maps Token
  const appleToken = process.env.NEXT_PUBLIC_APPLE_MAPS_TOKEN;

  // Search for addresses using Apple Maps API
  const searchAddresses = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !appleToken) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Using Apple Maps Search API
      const response = await fetch(
        `https://maps-api.apple.com/v1/searchAutocomplete?q=${encodeURIComponent(query)}&lang=en-US&resultTypeFilter=Address`,
        {
          headers: {
            Authorization: `Bearer ${appleToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results) {
          setSuggestions(data.results.slice(0, 5));
        }
      } else {
        // Fallback: use a simple geocoding approach
        console.warn('Apple Maps API failed, using fallback');
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Address search error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [appleToken]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, searchAddresses]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const addressLine1 = suggestion.thoroughfare
      ? `${suggestion.subThoroughfare || ''} ${suggestion.thoroughfare}`.trim()
      : suggestion.formattedAddressLine?.split(',')[0] || '';

    onChange(addressLine1);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (onAddressSelect) {
      onAddressSelect({
        addressLine1,
        addressLine2: suggestion.subLocality || '',
        city: suggestion.locality || '',
        state: suggestion.administrativeArea || '',
        zipCode: suggestion.postCode || '',
        country: suggestion.country || 'USA',
      });
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative group">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-teal-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full h-12 pl-12 pr-10 bg-neutral-900/50 border ${
            error ? 'border-red-500' : 'border-neutral-800'
          } rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-neutral-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-neutral-500" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                index === selectedIndex
                  ? 'bg-teal-500/20 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <MapPin className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {suggestion.displayLines?.[0] || suggestion.formattedAddressLine}
                </p>
                {suggestion.displayLines?.[1] && (
                  <p className="text-xs text-neutral-500 truncate">
                    {suggestion.displayLines[1]}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
