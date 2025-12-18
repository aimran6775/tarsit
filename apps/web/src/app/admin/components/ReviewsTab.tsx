'use client';

import { 
  Star, Trash2, Eye, Flag, Search, 
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import type { ReviewsResponse } from '../types';

interface ReviewsTabProps {
  reviewsData: ReviewsResponse | null;
  reviewSearch: string;
  setReviewSearch: (search: string) => void;
  reviewRatingFilter: string;
  setReviewRatingFilter: (rating: string) => void;
  reviewPage: number;
  setReviewPage: (page: number) => void;
  onDeleteReview: (reviewId: string) => void;
}

export function ReviewsTab({
  reviewsData,
  reviewSearch,
  setReviewSearch,
  reviewRatingFilter,
  setReviewRatingFilter,
  reviewPage,
  setReviewPage,
  onDeleteReview,
}: ReviewsTabProps) {
  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              {renderStars(rating)}
            </div>
            <p className="text-xl font-bold text-white">
              {reviews.filter(r => r.rating === rating).length}
            </p>
            <p className="text-xs text-white/50">{rating} star reviews</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={reviewSearch}
            onChange={(e) => setReviewSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <select
          value={reviewRatingFilter}
          onChange={(e) => setReviewRatingFilter(e.target.value)}
          className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="" className="bg-neutral-900">All Ratings</option>
          <option value="5" className="bg-neutral-900">5 Stars</option>
          <option value="4" className="bg-neutral-900">4 Stars</option>
          <option value="3" className="bg-neutral-900">3 Stars</option>
          <option value="2" className="bg-neutral-900">2 Stars</option>
          <option value="1" className="bg-neutral-900">1 Star</option>
        </select>
        <button className="h-12 px-6 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-all flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Flagged Only
        </button>
      </div>

      {/* Reviews List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <Star className="h-16 w-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/50">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reviews.map(review => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {review.user.firstName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <p className="text-sm text-white/50">{review.user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-white/40">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.reported && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-16">
                  <p className="text-sm text-white/50 mb-1">
                    Review for <span className="text-purple-400 font-medium">{review.business.name}</span>
                  </p>
                  {review.title && (
                    <p className="font-medium text-white mb-2">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-white/70 mb-4">{review.comment}</p>
                  )}

                  {review.response && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                      <p className="text-xs text-purple-400 font-medium mb-2">Business Response</p>
                      <p className="text-sm text-white/70">{review.response}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.open(`/business/${review.business.slug}`, '_blank')}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Business
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this review? This cannot be undone.')) {
                          onDeleteReview(review.id);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <p className="text-sm text-white/50">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReviewPage(Math.max(1, reviewPage - 1))}
                disabled={reviewPage === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white/70" />
              </button>
              <button
                onClick={() => setReviewPage(Math.min(pagination.totalPages, reviewPage + 1))}
                disabled={reviewPage === pagination.totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white/70" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
