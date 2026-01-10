'use client';

import {
  AlertTriangle,
  Compass,
  Filter,
  HelpCircle,
  RefreshCw,
  SearchX,
  ServerOff,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  query?: string;
  category?: string;
  categoryName?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  onRetry?: () => void;
}

export function EmptyState({
  query,
  category: _category,
  categoryName,
  hasFilters,
  onClearFilters,
  onRetry: _onRetry,
}: EmptyStateProps) {
  return (
    <div className="relative py-16 px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <SearchX className="h-96 w-96" />
      </div>

      <div className="relative max-w-lg mx-auto text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-neutral-900 flex items-center justify-center">
            <SearchX className="h-10 w-10 text-white/30" />
          </div>
          {/* Decorative rings */}
          <div
            className="absolute inset-0 rounded-full border border-white/10 animate-ping"
            style={{ animationDuration: '2s' }}
          />
          <div className="absolute -inset-2 rounded-full border border-white/5" />
        </div>

        {/* Message */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {query ? `No results for "${query}"` : 'No businesses found'}
        </h3>
        <p className="text-white/50 mb-8 leading-relaxed">
          {query ? (
            <>
              We couldn&apos;t find any businesses matching your search. Try different keywords or
              explore our categories.
            </>
          ) : categoryName ? (
            <>
              There are no businesses in <span className="text-purple-400">{categoryName}</span>{' '}
              matching your criteria. Try adjusting your filters.
            </>
          ) : (
            <>
              We couldn&apos;t find any businesses matching your criteria. Try adjusting your
              filters or explore different categories.
            </>
          )}
        </p>

        {/* Suggestions */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h4 className="text-sm font-semibold text-white/70 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Suggestions
          </h4>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3 text-sm text-white/60">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs">1</span>
              </div>
              Check your spelling or try more general terms
            </li>
            <li className="flex items-start gap-3 text-sm text-white/60">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs">2</span>
              </div>
              Remove some filters to see more results
            </li>
            <li className="flex items-start gap-3 text-sm text-white/60">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs">3</span>
              </div>
              Try searching in a different location
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </button>
          )}
          <Link
            href="/categories"
            className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="h-4 w-4" />
            Browse Categories
          </Link>
        </div>

        {/* Popular Searches */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">Popular searches</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Restaurants', 'Auto Repair', 'Hair Salons', 'Coffee Shops', 'Gyms'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  // Determine error type
  const isNetworkError =
    error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch');
  const isServerError =
    error.toLowerCase().includes('server') || error.toLowerCase().includes('500');

  const Icon = isNetworkError ? WifiOff : isServerError ? ServerOff : AlertTriangle;

  return (
    <div className="py-16 px-6">
      <div className="max-w-lg mx-auto text-center">
        {/* Error Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-pulse" />
          <div className="absolute inset-1 rounded-xl bg-neutral-900 flex items-center justify-center">
            <Icon className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {isNetworkError
            ? 'Connection Problem'
            : isServerError
              ? 'Server Error'
              : 'Something went wrong'}
        </h3>
        <p className="text-white/50 mb-6">
          {isNetworkError
            ? 'Please check your internet connection and try again.'
            : isServerError
              ? 'Our servers are having trouble. Please try again in a moment.'
              : error}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            Go Home
          </Link>
        </div>

        {/* Help */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/50 flex items-center justify-center gap-2">
            <HelpCircle className="h-4 w-4" />
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
