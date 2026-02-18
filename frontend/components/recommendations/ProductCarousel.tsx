'use client';

import Link from 'next/link';
import { RecommendedProduct } from '@/hooks/useRecommendations';
import { useState } from 'react';

interface ProductCarouselProps {
  title: string;
  description?: string;
  products: RecommendedProduct[];
  loading?: boolean;
}

export default function ProductCarousel({
  title,
  description,
  products,
  loading = false,
}: ProductCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition((e.currentTarget as HTMLElement).scrollLeft);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`carousel-${title}`);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-64 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition"
        >
          ←
        </button>

        {/* Products */}
        <div
          id={`carousel-${title}`}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex-shrink-0 w-48 group"
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Image */}
                <div className="relative bg-gray-100 h-40 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Category */}
                  <p className="text-xs text-gray-500 mb-1 truncate">
                    {product.category.name}
                  </p>

                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {product.avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <p className="text-lg font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition"
        >
          →
        </button>
      </div>
    </div>
  );
}
