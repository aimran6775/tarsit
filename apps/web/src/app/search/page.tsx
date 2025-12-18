'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, Building2, Check, Filter, Grid3X3, List, SlidersHorizontal, X, ChevronDown, Heart, TrendingUp, Navigation, DollarSign, Award, Map as MapIcon, Crosshair } from 'lucide-react';
import { BusinessMap } from '@/components/map';
import { useGeolocation } from '@/hooks/use-geolocation';
import { EmptySearchIllustration, ErrorIllustration } from '@/components/illustrations';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: { id: string; name: string; slug: string };
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
  verified: boolean;
  featured: boolean;
  primaryPhoto: { id: string; url: string; featured: boolean } | null;
  distance?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { businesses: number };
}

interface SearchResponse {
  businesses: Business[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  filters?: { hasLocation: boolean; radius: number | null };
}

const PRICE_OPTIONS = [
  { value: '', label: 'Any Price' },
  { value: 'BUDGET', label: 'Budget ($)' },
  { value: 'MODERATE', label: 'Moderate ($$)' },
  { value: 'EXPENSIVE', label: 'Premium ($$$)' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4.5', label: '4.5+ Stars' },
  { value: '4', label: '4+ Stars' },
  { value: '3.5', label: '3.5+ Stars' },
  { value: '3', label: '3+ Stars' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'distance', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('priceRange') || '');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Geolocation
  const { latitude, longitude, loading: geoLoading, getCurrentPosition } = useGeolocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(apiUrl + '/categories');
        if (res.ok) setCategories(await res.json());
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Update map center when geolocation is available
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([longitude, latitude]);
    }
  }, [latitude, longitude]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const q = searchParams.get('q');
      const category = searchParams.get('category');
      const loc = searchParams.get('location');
      const price = searchParams.get('priceRange');
      const rating = searchParams.get('rating');
      const page = searchParams.get('page');

      if (q) params.set('q', q);
      if (category) params.set('categorySlug', category); // Use slug-based filtering
      if (loc) params.set('location', loc);
      // Use geolocation if available
      if (latitude && longitude) {
        params.set('latitude', latitude.toString());
        params.set('longitude', longitude.toString());
        params.set('radius', '25'); // 25km radius
      }
      if (price) params.set('priceRange', price);
      if (rating) params.set('minRating', rating);
      if (page) params.set('page', page);
      params.set('limit', '12');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(apiUrl + '/search?' + params.toString());

      if (!response.ok) throw new Error('HTTP error! status: ' + response.status);
      setSearchResults(await response.json());
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const updateSearch = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!updates.page) params.delete('page');
    router.push('/search?' + params.toString());
  }, [searchParams, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch({ q: query, location });
  };

  const applyFilters = () => {
    updateSearch({ category: selectedCategory, priceRange: selectedPrice, rating: selectedRating, sort: sortBy });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPrice('');
    setSelectedRating('');
    setSortBy('relevance');
    router.push('/search' + (query ? '?q=' + query : ''));
    setShowFilters(false);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getPriceDisplay = (priceRange: string) => {
    switch (priceRange) {
      case 'BUDGET': return { text: '$', color: 'text-emerald-400' };
      case 'MODERATE': return { text: '$$', color: 'text-amber-400' };
      case 'EXPENSIVE': return { text: '$$$', color: 'text-rose-400' };
      default: return { text: '$$', color: 'text-white/50' };
    }
  };

  const activeFiltersCount = [selectedCategory, selectedPrice, selectedRating].filter(Boolean).length + (sortBy !== 'relevance' ? 1 : 0);
  const currentQ = searchParams.get('q');
  const currentCat = searchParams.get('category');

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Find Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Businesses</span>
            </h1>
            <p className="text-white/60 text-lg">Discover the best services in your area</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 p-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 text-base transition-all"
                />
              </div>
              <div className="w-full md:w-64 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="City or ZIP code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 text-base transition-all"
                />
                <button
                  type="button"
                  onClick={getCurrentPosition}
                  disabled={geoLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Use my location"
                >
                  <Crosshair className={`h-4 w-4 text-white/50 ${geoLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <button
                type="submit"
                className="h-14 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
              >
                <Search className="h-5 w-5" />Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="border-b border-white/10 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => updateSearch({ category: '' })}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
              >
                All Categories
              </button>
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); updateSearch({ category: cat.slug }); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.slug
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {currentQ ? `Results for "${currentQ}"` : currentCat ? `${categories.find(c => c.slug === currentCat)?.name || 'Category'} Businesses` : 'All Businesses'}
            </h2>
            {searchResults && (
              <p className="text-white/50 text-sm mt-1">
                {searchResults.pagination.total} businesses found{searchResults.filters?.hasLocation ? ' near you' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="hidden md:flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                title="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                title="Map view"
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); updateSearch({ sort: e.target.value }); }}
                className="appearance-none h-10 pl-4 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer transition-all"
              >
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-neutral-900">{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
            </div>
            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 flex items-center gap-2 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-white/50">Active filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-sm text-white border border-white/10">
                {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <button onClick={() => updateSearch({ category: '' })} className="hover:text-purple-400 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-sm text-white border border-white/10">
                {PRICE_OPTIONS.find(p => p.value === selectedPrice)?.label}
                <button onClick={() => updateSearch({ priceRange: '' })} className="hover:text-purple-400 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedRating && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-sm text-white border border-white/10">
                {selectedRating}+ Stars
                <button onClick={() => updateSearch({ rating: '' })} className="hover:text-purple-400 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Clear all
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-white/10"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-white/50">Searching businesses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <ErrorIllustration className="w-48 h-36 mx-auto mb-6" />
            <h3 className="text-lg font-medium text-white mb-2">Something went wrong</h3>
            <p className="text-white/50 text-sm mb-6">{error}</p>
            <button onClick={fetchResults} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && searchResults?.businesses.length === 0 && (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <EmptySearchIllustration className="w-56 h-40 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">No businesses found</h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">We couldn't find any businesses matching your criteria. Try adjusting your filters or search terms.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={clearFilters} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25">
                Clear Filters
              </button>
              <Link href="/categories" className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-all">
                Browse Categories
              </Link>
            </div>
          </div>
        )}

        {/* Map View */}
        {!loading && !error && searchResults && searchResults.businesses.length > 0 && viewMode === 'map' && (
          <div className="mb-6">
            <BusinessMap
              businesses={searchResults.businesses
                .filter(b => b.latitude && b.longitude)
                .map(b => ({
                  id: b.id,
                  name: b.name,
                  slug: b.slug,
                  latitude: b.latitude!,
                  longitude: b.longitude!,
                  rating: b.rating,
                  reviewCount: b.reviewCount,
                  category: b.category,
                  primaryPhoto: b.primaryPhoto,
                  verified: b.verified,
                }))}
              center={mapCenter || (latitude && longitude ? [longitude, latitude] : undefined)}
              height="600px"
              onMarkerClick={(business) => {
                router.push(`/business/${business.slug}`);
              }}
            />
            {searchResults.businesses.filter(b => !b.latitude || !b.longitude).length > 0 && (
              <p className="text-sm text-white/50 mt-4 text-center">
                {searchResults.businesses.filter(b => !b.latitude || !b.longitude).length} business(es) without location data not shown on map
              </p>
            )}
          </div>
        )}

        {/* Business Results Grid/List */}
        {!loading && !error && searchResults && searchResults.businesses.length > 0 && viewMode !== 'map' && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {searchResults.businesses.map((business) => (
              <Link key={business.id} href={'/business/' + business.slug} className="group">
                <div className={`bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm${viewMode === 'list' ? ' flex' : ''}`}>
                  {/* Image Section */}
                  <div className={`relative bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden${viewMode === 'grid' ? ' h-48' : ' w-48 md:w-64 flex-shrink-0'}`}>
                    {business.primaryPhoto ? (
                      <Image src={business.primaryPhoto.url} alt={business.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {business.featured && (
                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <TrendingUp className="h-3 w-3" />Featured
                        </span>
                      )}
                      {business.verified && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <Check className="h-3 w-3" />Verified
                        </span>
                      )}
                    </div>
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(business.id); }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${favorites.has(business.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-rose-400 border border-white/10'}`}
                    >
                      <Heart className={`h-4 w-4${favorites.has(business.id) ? ' fill-current' : ''}`} />
                    </button>
                    {/* Price Badge */}
                    {viewMode === 'grid' && (
                      <div className="absolute bottom-3 right-3">
                        <span className={`px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-sm font-semibold border border-white/10 ${getPriceDisplay(business.priceRange).color}`}>
                          {getPriceDisplay(business.priceRange).text}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Content Section */}
                  <div className={viewMode === 'grid' ? 'p-5' : 'flex-1 p-5'}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">{business.category.name}</span>
                      {business.distance && (
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Navigation className="h-3 w-3" />{business.distance.toFixed(1)} mi
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">{business.name}</h3>
                    <p className="text-sm text-white/40 flex items-center gap-1.5 mb-3">
                      <MapPin className="h-3.5 w-3.5" />{business.city}, {business.state}
                    </p>
                    <p className="text-sm text-white/60 line-clamp-2 mb-4">{business.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-amber-400">{business.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-white/40">({business.reviewCount} reviews)</span>
                      </div>
                      {viewMode === 'list' && (
                        <span className={`font-semibold ${getPriceDisplay(business.priceRange).color}`}>
                          {getPriceDisplay(business.priceRange).text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {searchResults && searchResults.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={searchResults.pagination.page <= 1}
              onClick={() => updateSearch({ page: String(searchResults.pagination.page - 1) })}
              className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, searchResults.pagination.totalPages) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => updateSearch({ page: String(i + 1) })}
                  className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${searchResults.pagination.page === i + 1
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                >
                  {i + 1}
                </button>
              ))}
              {searchResults.pagination.totalPages > 5 && (
                <>
                  <span className="px-2 text-white/40">...</span>
                  <button
                    onClick={() => updateSearch({ page: String(searchResults.pagination.totalPages) })}
                    className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all"
                  >
                    {searchResults.pagination.totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              disabled={searchResults.pagination.page >= searchResults.pagination.totalPages}
              onClick={() => updateSearch({ page: String(searchResults.pagination.page + 1) })}
              className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Filter Slide-out Panel */}
      {showFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-neutral-900 border-l border-white/10 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>
              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Category Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-purple-400" />Category
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input type="radio" name="category" checked={!selectedCategory} onChange={() => setSelectedCategory('')} className="w-4 h-4 text-purple-500 border-white/30 bg-transparent focus:ring-purple-500" />
                      <span className="text-sm text-white">All Categories</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="radio" name="category" checked={selectedCategory === cat.slug} onChange={() => setSelectedCategory(cat.slug)} className="w-4 h-4 text-purple-500 border-white/30 bg-transparent focus:ring-purple-500" />
                        <span className="text-sm text-white">{cat.name}</span>
                        {cat._count && <span className="text-xs text-white/40 ml-auto">{cat._count.businesses}</span>}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Price Range Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-400" />Price Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICE_OPTIONS.map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${selectedPrice === opt.value
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500 text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                      >
                        <input type="radio" name="price" checked={selectedPrice === opt.value} onChange={() => setSelectedPrice(opt.value)} className="sr-only" />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Rating Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-400" />Minimum Rating
                  </h4>
                  <div className="space-y-2">
                    {RATING_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="radio" name="rating" checked={selectedRating === opt.value} onChange={() => setSelectedRating(opt.value)} className="w-4 h-4 text-purple-500 border-white/30 bg-transparent focus:ring-purple-500" />
                        <span className="text-sm text-white">{opt.label}</span>
                        {opt.value && (
                          <div className="flex items-center gap-0.5 ml-auto">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(parseFloat(opt.value)) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                            ))}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Sort By Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-400" />Sort By
                  </h4>
                  <div className="space-y-2">
                    {SORT_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="radio" name="sort" checked={sortBy === opt.value} onChange={() => setSortBy(opt.value)} className="w-4 h-4 text-purple-500 border-white/30 bg-transparent focus:ring-purple-500" />
                        <span className="text-sm text-white">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {/* Panel Footer */}
              <div className="border-t border-white/10 p-6 space-y-3">
                <button onClick={applyFilters} className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25">
                  Apply Filters
                </button>
                <button onClick={clearFilters} className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all">
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-white/10"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-white/50">Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
