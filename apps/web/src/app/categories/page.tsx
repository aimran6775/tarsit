'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingUp,
  ChevronRight,
  Star,
  Grid,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useCategories } from '@/hooks';
import { getCategoryIcon } from '@/lib/category-icons';

export default function CategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories from API
  const { data: categories = [], isLoading, error } = useCategories();

  // Filter top categories by business count
  const topCategories = [...categories]
    .filter(cat => cat._count && cat._count.businesses > 0)
    .sort((a, b) => (b._count?.businesses || 0) - (a._count?.businesses || 0))
    .slice(0, 6);

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? categories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : categories;

  const handleCategoryClick = (slug: string) => {
    router.push(`/search?category=${slug}`);
  };

  const totalBusinesses = categories.reduce((sum, cat) => sum + (cat._count?.businesses || 0), 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-white/10"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-white/50">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Failed to load categories</h2>
          <p className="text-neutral-400 mb-6">
            We couldn't fetch the categories. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-neutral-950 rounded-full font-medium hover:bg-neutral-100 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Grid className="h-10 w-10 text-white/40" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No categories available</h2>
          <p className="text-neutral-400 mb-6">
            There are no categories to display at the moment.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-950 rounded-full font-medium hover:bg-neutral-100 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Categories</span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-8">
              Discover local businesses across {categories.length}+ categories.
              From beauty to tech, find exactly what you need.
            </p>

            {/* Search Input */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">{categories.length}</div>
              <div className="text-sm text-neutral-500">Categories</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">{totalBusinesses.toLocaleString()}</div>
              <div className="text-sm text-neutral-500">Businesses</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">{topCategories.length}</div>
              <div className="text-sm text-neutral-500">Top Categories</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-neutral-500">Availability</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {/* Top Categories */}
        {!searchQuery && topCategories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Top Categories</h2>
                <p className="text-neutral-500">Most popular categories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCategories.map((category) => {
                const CategoryIcon = getCategoryIcon(category.slug);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.08] transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center">
                        <CategoryIcon className="h-7 w-7 text-purple-400" />
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Top
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      {category.description || 'Explore businesses in this category'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">
                        <span className="text-white font-medium">{(category._count?.businesses || 0).toLocaleString()}</span> businesses
                      </span>
                      <ChevronRight className="h-5 w-5 text-neutral-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* All Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Grid className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {searchQuery ? 'Search Results' : 'All Categories'}
                </h2>
                <p className="text-neutral-500">
                  {searchQuery
                    ? `${filteredCategories.length} categories found`
                    : 'Browse through all available categories'}
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white">
              {filteredCategories.length} total
            </span>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">No categories found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredCategories.map((category) => {
                const CategoryIcon = getCategoryIcon(category.slug);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.08] transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          {(category._count?.businesses || 0).toLocaleString()} listings
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-16">
          <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
              Try our search to find businesses by name, service, or location
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Search Businesses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/business/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-all"
              >
                List Your Business
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
