'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
  rating,
  onRatingChange,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${sizes[size]} transition-colors ${
            readOnly ? 'cursor-default' : 'cursor-pointer'
          } ${
            star <= displayRating
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => {
            if (!readOnly && onRatingChange) {
              onRatingChange(star);
            }
          }}
          onMouseEnter={() => {
            if (!readOnly) {
              setHoverRating(star);
            }
          }}
          onMouseLeave={() => {
            if (!readOnly) {
              setHoverRating(0);
            }
          }}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-gray-600 font-semibold">
        {displayRating.toFixed(1)}
      </span>
    </div>
  );
}
