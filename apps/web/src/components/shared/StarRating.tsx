'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

const gapClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
};

export function StarRating({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showValue = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex items-center ${gapClasses[size]} ${className}`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= displayRating;
        const isHalfFilled = !isFilled && value - 0.5 <= displayRating;
        
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`transition-all duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`Rate ${value} stars`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalfFilled
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-white/20'
              }`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-white/70">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Interactive rating component with labels
interface InteractiveRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  className?: string;
}

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export function InteractiveRating({
  rating,
  onRatingChange,
  className = '',
}: InteractiveRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRatingChange(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-all duration-150 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
            aria-label={`Rate ${value} stars - ${ratingLabels[value]}`}
          >
            <Star
              className={`h-8 w-8 transition-all duration-150 ${
                value <= displayRating
                  ? 'text-amber-400 fill-amber-400 drop-shadow-lg'
                  : 'text-white/20 hover:text-amber-400/50'
              }`}
            />
          </button>
        ))}
      </div>
      <p className={`text-sm font-medium transition-all duration-200 h-5 ${
        displayRating > 0 ? 'text-amber-400' : 'text-white/40'
      }`}>
        {displayRating > 0 ? ratingLabels[displayRating] : 'Select a rating'}
      </p>
    </div>
  );
}

export default StarRating;
