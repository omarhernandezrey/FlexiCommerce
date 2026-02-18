'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface ReviewFormProps {
  productId: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  initialRating?: number;
  initialComment?: string;
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function ReviewForm({
  productId,
  onSubmit,
  initialRating = 0,
  initialComment = '',
  isEditing = false,
  isLoading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!comment.trim() && comment.trim().length < 10) {
      alert('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">
          Inicia sesión para dejar una reseña
        </p>
        <Link 
          href="/auth" 
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isEditing ? 'Editar Reseña' : 'Dejar una Reseña'}
      </h3>

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Calificación
        </label>
        <StarRating 
          rating={rating} 
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
          Comentario (opcional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia con este producto..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 caracteres
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || isSubmitting || rating === 0}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
        >
          {isLoading || isSubmitting ? 'Enviando...' : (isEditing ? 'Guardar Cambios' : 'Publicar Reseña')}
        </button>
      </div>
    </form>
  );
}
