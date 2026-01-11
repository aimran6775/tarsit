'use client';

import { DynamicBusinessMap } from '@/components/map';
import {
    ActiveFiltersBar,
    AdvancedFilters,
    Business,
    BusinessCard,
    Category,
    CategoryDiscovery,
    EmptyState,
    ErrorState,
    Pagination,
    QuickViewModal,
    ResultsGridSkeleton,
    ResultsHeader,
    SearchPageSkeleton,
    SearchResponse,
    SmartSearchBar,
    ViewMode,
} from '@/components/search';
import { useRegion } from '@/contexts/region-context';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { region } = useRegion();

  // Search State
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Input State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: searchParams.get('priceRange') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sort') || 'relevance',
    amenities: [] as string[],
    openNow: false,
    verified: false,
  });

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [quickViewBusiness, setQuickViewBusiness] = useState<Business | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Geolocation
  const { latitude, longitude, loading: geoLoading, getCurrentPosition } = useGeolocation();

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('tarsit_favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('tarsit_favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          'https://improved-memory-p6vxppj655p37pgw-4001.app.github.dev/api';
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

  // Fetch results
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
      const sort = searchParams.get('sort');

      if (q) params.set('q', q);
      if (category) params.set('categorySlug', category);
      if (loc) params.set('location', loc);
      if (latitude && longitude) {
        params.set('latitude', latitude.toString());
        params.set('longitude', longitude.toString());
        params.set('radius', '25');
      }
      if (price) params.set('priceRange', price);
      if (rating) params.set('minRating', rating);
      if (page) params.set('page', page);
      if (sort) params.set('sort', sort);
      // Add region filter for regional search
      if (region?.code) {
        params.set('regionCode', region.code);
      }
      params.set('limit', '12');

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://improved-memory-p6vxppj655p37pgw-4001.app.github.dev/api';
      const response = await fetch(apiUrl + '/search?' + params.toString());

      if (!response.ok) throw new Error('HTTP error! status: ' + response.status);
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, latitude, longitude, region?.code]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Sync filters from URL
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      priceRange: searchParams.get('priceRange') || '',
      rating: searchParams.get('rating') || '',
      sortBy: searchParams.get('sort') || 'relevance',
    }));
    setQuery(searchParams.get('q') || '');
    setLocation(searchParams.get('location') || '');
  }, [searchParams]);

  // URL update helper
  const updateSearch = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!updates.page) params.delete('page');
      router.push('/search?' + params.toString());
    },
    [searchParams, router]
  );

  // Handlers
  const handleSearch = (newQuery: string, newLocation: string) => {
    updateSearch({ q: newQuery, location: newLocation });
  };

  const handleCategorySelect = (slug: string) => {
    setFilters((prev) => ({ ...prev, category: slug }));
    updateSearch({ category: slug });
  };

  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({ ...prev, sortBy: sort }));
    updateSearch({ sort });
  };

  const handleFiltersApply = () => {
    updateSearch({
      category: filters.category,
      priceRange: filters.priceRange,
      rating: filters.rating,
      sort: filters.sortBy,
    });
  };

  const handleFiltersClear = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: '',
      sortBy: 'relevance',
      amenities: [],
      openNow: false,
      verified: false,
    });
    const q = searchParams.get('q');
    router.push('/search' + (q ? '?q=' + q : ''));
  };

  const handleRemoveFilter = (key: string) => {
    if (key === 'sortBy') {
      handleSortChange('relevance');
    } else if (key === 'openNow' || key === 'verified') {
      setFilters((prev) => ({ ...prev, [key]: false }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: '' }));
      updateSearch({ [key]: '' });
    }
  };

  const handlePageChange = (page: number) => {
    updateSearch({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Computed values
  const currentQ = searchParams.get('q');
  const currentCategory = searchParams.get('category');
  const categoryName = useMemo(() => {
    return categories.find((c) => c.slug === currentCategory)?.name;
  }, [categories, currentCategory]);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.category,
      filters.priceRange,
      filters.rating,
      filters.sortBy !== 'relevance' ? filters.sortBy : '',
      filters.openNow ? 'openNow' : '',
      filters.verified ? 'verified' : '',
    ].filter(Boolean).length;
  }, [filters]);

  const hasLocation = !!(latitude && longitude) || !!searchResults?.filters?.hasLocation;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Minimal Header */}
          <h1 className="text-xl font-medium text-white mb-6">Search</h1>

          {/* Smart Search Bar */}
          <SmartSearchBar
            query={query}
            location={location}
            onQueryChange={setQuery}
            onLocationChange={setLocation}
            onSearch={handleSearch}
            onUseLocation={getCurrentPosition}
            geoLoading={geoLoading}
            categories={categories}
            className=""
          />

          {/* Category Pills - inline */}
          {categories.length > 0 && (
            <div className="mt-4">
              <CategoryDiscovery
                categories={categories}
                selectedCategory={filters.category}
                onSelectCategory={handleCategorySelect}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Results Header */}
        {!loading && !error && searchResults && (
          <>
            <ResultsHeader
              query={currentQ || undefined}
              categoryName={categoryName}
              totalResults={searchResults.pagination.total}
              hasLocation={hasLocation}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
              activeFiltersCount={activeFiltersCount}
              onOpenFilters={() => setShowFilters(true)}
              className="mb-4"
            />

            {/* Active Filters */}
            <ActiveFiltersBar
              filters={{
                ...filters,
                categoryName,
              }}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleFiltersClear}
              className="mb-4"
            />
          </>
        )}

        {/* Loading State */}
        {loading && (
          <ResultsGridSkeleton count={6} viewMode={viewMode === 'map' ? 'grid' : viewMode} />
        )}

        {/* Error State */}
        {!loading && error && <ErrorState error={error} onRetry={fetchResults} />}

        {/* Empty State */}
        {!loading && !error && searchResults?.businesses.length === 0 && (
          <EmptyState
            query={currentQ || undefined}
            category={currentCategory || undefined}
            categoryName={categoryName}
            hasFilters={activeFiltersCount > 0}
            onClearFilters={handleFiltersClear}
            onRetry={fetchResults}
          />
        )}

        {/* Map View */}
        {!loading &&
          !error &&
          searchResults &&
          searchResults.businesses.length > 0 &&
          viewMode === 'map' && (
            <div className="mb-6">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <DynamicBusinessMap
                  businesses={searchResults.businesses
                    .filter((b) => b.latitude && b.longitude)
                    .map((b) => ({
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
                  onMarkerClick={(business) => router.push('/business/' + business.slug)}
                />
              </div>
              {searchResults.businesses.filter((b) => !b.latitude || !b.longitude).length > 0 && (
                <p className="text-sm text-white/40 mt-3 text-center">
                  {searchResults.businesses.filter((b) => !b.latitude || !b.longitude).length}{' '}
                  business(es) without location data not shown on map
                </p>
              )}
            </div>
          )}

        {/* Business Results Grid/List - Mobile optimized */}
        {!loading &&
          !error &&
          searchResults &&
          searchResults.businesses.length > 0 &&
          viewMode !== 'map' && (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'
                  : viewMode === 'list'
                    ? 'flex flex-col gap-3 sm:gap-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'
              }
            >
              {searchResults.businesses.map((business, index) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  viewMode={viewMode === 'compact' ? 'compact' : viewMode}
                  isFavorite={favorites.has(business.id)}
                  onToggleFavorite={toggleFavorite}
                  onQuickView={setQuickViewBusiness}
                  index={index}
                />
              ))}
            </div>
          )}

        {/* Pagination */}
        {searchResults && searchResults.pagination.totalPages > 1 && (
          <Pagination
            currentPage={searchResults.pagination.page}
            totalPages={searchResults.pagination.totalPages}
            totalResults={searchResults.pagination.total}
            resultsPerPage={searchResults.pagination.limit}
            onPageChange={handlePageChange}
            className="mt-12"
          />
        )}

        {/* TARS AI Helper */}
        {!loading && !error && searchResults && searchResults.businesses.length > 0 && (
          <Link
            href="/?openTars=true"
            className="mt-8 flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Bot className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-white/70">Need help? Ask TARS for recommendations</span>
          </Link>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        business={quickViewBusiness}
        isOpen={!!quickViewBusiness}
        onClose={() => setQuickViewBusiness(null)}
        isFavorite={quickViewBusiness ? favorites.has(quickViewBusiness.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
