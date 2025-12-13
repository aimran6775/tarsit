'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, User, PenSquare, MessageSquare, ThumbsUp, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { ReviewModal } from '@/components/shared/ReviewModal';
import { ReviewResponseModal } from '@/components/shared/ReviewResponseModal';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  helpful?: number;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  response?: string;
  respondedAt?: string;
}

interface ReviewsListProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
  businessId: string;
  businessName: string;
  businessOwnerId?: string;
  onReviewAdded?: () => void;
}

// Rating breakdown component
function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-2">
      {counts.map(({ star, count, percentage }) => (
        <div key={star} className="flex items-center gap-2">
          <span className="text-xs text-white/50 w-3">{star}</span>
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-white/40 w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

export function ReviewsList({ 
  reviews, 
  rating, 
  reviewCount, 
  businessId, 
  businessName, 
  businessOwnerId,
  onReviewAdded,
}: ReviewsListProps) {
  const { user, isAuthenticated } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Check if current user is the business owner
  const isOwner = user?.id === businessOwnerId;

  // Check if current user has already reviewed
  const hasReviewed = reviews.some((r) => r.user.id === user?.id);

  // Display limited reviews unless "show all" is clicked
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  const handleRespondClick = (review: Review) => {
    setSelectedReview(review);
    setShowResponseModal(true);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Reviews</h2>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full hover:bg-amber-500/30 transition-colors"
          >
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-amber-400/70 text-sm">({reviewCount})</span>
            {showBreakdown ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Write Review Button */}
        {isAuthenticated && !isOwner && !hasReviewed && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all"
          >
            <PenSquare className="h-4 w-4" />
            Write a Review
          </button>
        )}
        
        {!isAuthenticated && (
          <a
            href="/auth/login"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 font-medium rounded-xl hover:bg-white/20 transition-all"
          >
            <PenSquare className="h-4 w-4" />
            Login to Review
          </a>
        )}

        {hasReviewed && !isOwner && (
          <span className="text-sm text-white/50 flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            You've reviewed this business
          </span>
        )}
      </div>

      {/* Rating Breakdown */}
      {showBreakdown && reviews.length > 0 && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <RatingBreakdown reviews={reviews} />
        </div>
      )}
      
      {/* Reviews List */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-white/10 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  {review.user.avatar ? (
                    <Image
                      src={review.user.avatar}
                      alt={review.user.firstName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white/50" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-medium text-white">
                      {review.user.firstName} {review.user.lastName.charAt(0)}.
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3.5 w-3.5 ${
                            i < review.rating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-white/20'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/40">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  {review.title && (
                    <h4 className="font-medium text-white mb-1">{review.title}</h4>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-white/60 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Review Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {review.photos.map((photo, index) => (
                        <Image
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover border border-white/10"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Helpful {review.helpful && review.helpful > 0 && `(${review.helpful})`}
                    </button>
                    
                    {/* Owner Respond Button */}
                    {isOwner && !review.response && (
                      <button
                        onClick={() => handleRespondClick(review)}
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Respond
                      </button>
                    )}
                  </div>
                  
                  {/* Business Response */}
                  {review.response && (
                    <div className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Building2 className="h-3 w-3 text-purple-400" />
                        </div>
                        <span className="text-xs font-medium text-purple-400">
                          Response from {businessName}
                        </span>
                        {review.respondedAt && (
                          <span className="text-xs text-white/30">
                            {new Date(review.respondedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/70">{review.response}</p>
                      
                      {/* Edit Response Button for Owner */}
                      {isOwner && (
                        <button
                          onClick={() => handleRespondClick(review)}
                          className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Edit Response
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Show More Button */}
          {reviews.length > 5 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full py-3 text-center text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-2">No reviews yet</p>
          <p className="text-sm text-white/40 mb-4">Be the first to share your experience!</p>
          {isAuthenticated && !isOwner && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all"
            >
              <PenSquare className="h-4 w-4" />
              Write the First Review
            </button>
          )}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        businessId={businessId}
        businessName={businessName}
        onReviewSubmitted={() => {
          setShowReviewModal(false);
          onReviewAdded?.();
        }}
      />

      {/* Response Modal for Business Owners */}
      {selectedReview && (
        <ReviewResponseModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedReview(null);
          }}
          reviewId={selectedReview.id}
          reviewerName={`${selectedReview.user.firstName} ${selectedReview.user.lastName.charAt(0)}.`}
          reviewRating={selectedReview.rating}
          reviewComment={selectedReview.comment}
          existingResponse={selectedReview.response}
          onResponseSubmitted={() => {
            setShowResponseModal(false);
            setSelectedReview(null);
            onReviewAdded?.();
          }}
        />
      )}
    </div>
  );
}
