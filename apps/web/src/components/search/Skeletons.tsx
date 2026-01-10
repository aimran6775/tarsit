'use client';

// Skeleton Components for Loading States
export function SearchBarSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3 p-2 md:p-3 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 animate-pulse">
        <div className="flex-1 h-14 bg-white/10 rounded-xl" />
        <div className="w-full md:w-72 h-14 bg-white/10 rounded-xl" />
        <div className="h-14 w-32 bg-purple-500/30 rounded-xl" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-32 h-36 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function BusinessCardSkeleton({
  viewMode = 'grid',
}: {
  viewMode?: 'grid' | 'list' | 'compact';
}) {
  if (viewMode === 'compact') {
    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="w-16 h-16 rounded-lg bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-white/10 rounded" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="flex bg-white/5 rounded-2xl border border-white/10 overflow-hidden animate-pulse">
        <div className="w-48 md:w-64 h-48 bg-white/10" />
        <div className="flex-1 p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-4 w-12 bg-white/10 rounded" />
          </div>
          <div className="h-6 w-3/4 bg-white/10 rounded" />
          <div className="h-4 w-1/3 bg-white/10 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-2/3 bg-white/10 rounded" />
          </div>
          <div className="flex justify-between pt-4 border-t border-white/10">
            <div className="h-6 w-24 bg-white/10 rounded-lg" />
            <div className="h-4 w-20 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="h-48 bg-white/10" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-white/10 rounded" />
          <div className="h-4 w-12 bg-white/10 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-white/10 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-3/4 bg-white/10 rounded" />
        </div>
        <div className="flex justify-between pt-4 border-t border-white/10">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ResultsGridSkeleton({
  count = 6,
  viewMode = 'grid',
}: {
  count?: number;
  viewMode?: 'grid' | 'list' | 'compact';
}) {
  const gridClass =
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'flex flex-col gap-4';

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 75}ms` }}>
          <BusinessCardSkeleton viewMode={viewMode} />
        </div>
      ))}
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="h-8 w-16 bg-white/10 rounded mb-2" />
          <div className="h-3 w-20 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

export function FilterChipsSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="h-8 w-24 bg-white/10 rounded-full" />
      <div className="h-8 w-32 bg-white/10 rounded-full" />
      <div className="h-8 w-20 bg-white/10 rounded-full" />
    </div>
  );
}

// Page-level loading skeleton
export function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-12 w-96 bg-white/10 rounded-lg mx-auto mb-3" />
            <div className="h-5 w-64 bg-white/10 rounded mx-auto" />
          </div>
          <SearchBarSkeleton />
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <CategorySkeleton />
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between mb-6 animate-pulse">
          <div>
            <div className="h-6 w-48 bg-white/10 rounded mb-2" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-white/10 rounded-lg" />
            <div className="h-10 w-32 bg-white/10 rounded-lg" />
            <div className="h-10 w-24 bg-white/10 rounded-lg" />
          </div>
        </div>

        {/* Insights */}
        <div className="mb-6">
          <InsightsSkeleton />
        </div>

        {/* Grid */}
        <ResultsGridSkeleton count={6} />
      </div>
    </div>
  );
}
