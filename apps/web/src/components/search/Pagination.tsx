'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side
    const range: (number | 'ellipsis')[] = [];
    const rangeWithDots: (number | 'ellipsis')[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, 'ellipsis');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('ellipsis', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  // Calculate showing range
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results info */}
      <p className="text-sm text-white/50">
        Showing <span className="font-medium text-white">{startResult}</span>
        {' - '}
        <span className="font-medium text-white">{endResult}</span>
        {' of '}
        <span className="font-medium text-white">{totalResults.toLocaleString()}</span>
        {' results'}
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex w-10 h-10 rounded-lg items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex w-10 h-10 rounded-lg items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-10 h-10 flex items-center justify-center text-white/30"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex w-10 h-10 rounded-lg items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex w-10 h-10 rounded-lg items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/* Quick jump (desktop only) */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-sm text-white/40">Go to:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          defaultValue={currentPage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = parseInt((e.target as HTMLInputElement).value);
              if (value >= 1 && value <= totalPages) {
                onPageChange(value);
              }
            }
          }}
          className="w-16 h-8 px-2 text-center text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>
    </div>
  );
}
