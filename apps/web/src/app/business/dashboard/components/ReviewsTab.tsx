'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  User,
  MessageSquare,
  TrendingUp,
  Clock,
  Filter,
  Search,
  ChevronDown,
} from 'lucide-react';
import { ReviewResponseModal } from '@/components/shared/ReviewResponseModal';
import type { Review } from '../types';

interface ReviewsTabProps {
  reviews: Review[];
  businessName: string;
  onReviewUpdated?: () => void;
}

export function ReviewsTab({ reviews, businessName: _businessName, onReviewUpdated }: ReviewsTabProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'responded' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const respondedCount = reviews.filter((r) => r.response).length;
  const pendingCount = totalReviews - respondedCount;
  const responseRate = totalReviews > 0 ? (respondedCount / totalReviews) * 100 : 0;

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    // Filter by rating
    if (filterRating !== 'all' && review.rating !== filterRating) return false;
    
    // Filter by response status
    if (filterStatus === 'responded' && !review.response) return false;
    if (filterStatus === 'pending' && review.response) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = `${review.user.firstName} ${review.user.lastName}`.toLowerCase().includes(query);
      const matchesComment = review.comment?.toLowerCase().includes(query);
      const matchesTitle = review.title?.toLowerCase().includes(query);
      if (!matchesName && !matchesComment && !matchesTitle) return false;
    }
    
    return true;
  });

  const handleRespondClick = (review: Review) => {
    setSelectedReview(review);
    setShowResponseModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-white/50">Average Rating</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalReviews}</p>
              <p className="text-xs text-white/50">Total Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{responseRate.toFixed(0)}%</p>
              <p className="text-xs text-white/50">Response Rate</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-xs text-white/50">Awaiting Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-xs text-white/50 mb-2">Rating</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRating('all')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterRating === 'all'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                      filterRating === rating
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {rating} <Star className="h-3 w-3 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs text-white/50 mb-2">Response Status</label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'responded', label: 'Responded' },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setFilterStatus(status.value as typeof filterStatus)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filterStatus === status.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  {review.user.avatar ? (
                    <Image
                      src={review.user.avatar}
                      alt={review.user.firstName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-white/50" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {review.user.firstName} {review.user.lastName}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-white/40">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-white mb-1">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-white/60 text-sm">{review.comment}</p>
                  )}

                  {/* Response Section */}
                  {review.response ? (
                    <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-400">Your Response</span>
                        <button
                          onClick={() => handleRespondClick(review)}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-white/70">{review.response}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRespondClick(review)}
                      className="mt-3 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Respond to this review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <Star className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-2">
              {searchQuery || filterRating !== 'all' || filterStatus !== 'all'
                ? 'No reviews match your filters'
                : 'No reviews yet'}
            </p>
            <p className="text-sm text-white/40">
              {searchQuery || filterRating !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Reviews from customers will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <ReviewResponseModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedReview(null);
          }}
          reviewId={selectedReview.id}
          reviewerName={`${selectedReview.user.firstName} ${selectedReview.user.lastName}`}
          reviewRating={selectedReview.rating}
          reviewComment={selectedReview.comment}
          existingResponse={selectedReview.response}
          onResponseSubmitted={() => {
            setShowResponseModal(false);
            setSelectedReview(null);
            onReviewUpdated?.();
          }}
        />
      )}
    </div>
  );
}

export default ReviewsTab;
