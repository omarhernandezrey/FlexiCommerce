'use client';

import { Review } from '@/hooks/useReviews';
import StarRating from './StarRating';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface ReviewListProps {
  reviews: Review[];
  onDelete?: (reviewId: string) => Promise<void>;
  onEdit?: (review: Review) => void;
  isLoading?: boolean;
}

export default function ReviewList({
  reviews,
  onDelete,
  onEdit,
  isLoading = false,
}: ReviewListProps) {
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!onDelete) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      setDeletingId(reviewId);
      try {
        await onDelete(reviewId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay reseñas aún. ¡Sé el primero en dejar una!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwnReview = user?.id === review.user.id;
        const createdDate = new Date(review.createdAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                <p className="text-xs text-gray-500">{createdDate}</p>
              </div>
              {isOwnReview && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(review)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isLoading || deletingId === review.id}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold disabled:text-gray-400"
                    >
                      {deletingId === review.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="mb-3">
              <StarRating rating={review.rating} readOnly />
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                {review.comment}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
