'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { StarRating } from '@/components/ui/StarRating';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCOP } from '@/lib/format';
import { Product } from '@/lib/api.service';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [addedToCart, setAddedToCart] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  useEffect(() => setMounted(true), []);
  const isFav = mounted && isFavorite(product.id);
  const price = Number(product.price) || 0;
  const originalPrice = product.originalPrice != null ? Number(product.originalPrice) : undefined;
  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price,
      image: product.image,
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
  };

  return (
    <div className="group bg-white rounded-lg sm:rounded-xl border border-primary/5 p-2 sm:p-4 shadow-sm hover:shadow-xl transition-all">
      <div className="relative rounded-lg overflow-hidden aspect-square mb-2 sm:mb-4 bg-gray-50">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <img
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            src={product.image}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/product-placeholder.svg';
            }}
          />
        </Link>
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-1 right-1 sm:top-2 sm:right-2 size-7 sm:size-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
            isFav ? 'bg-red-100 text-red-500' : 'bg-white/80 text-primary hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <MaterialIcon name="favorite" className="text-base sm:text-xl" filled={isFav} />
        </button>
        {isOutOfStock && (
          <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-slate-700 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded uppercase tracking-wider">
            Agotado
          </span>
        )}
        {!isOutOfStock && isLowStock && (
          <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-amber-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded uppercase tracking-wider">
            ¡Últimas {stock} uds!
          </span>
        )}
        {!isOutOfStock && !isLowStock && product.badge && (
          product.badge.toLowerCase().includes('sale') ? (
            <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded uppercase tracking-wider">
              {product.badge}
            </span>
          ) : (
            <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-primary text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded uppercase tracking-wider">
              {product.badge}
            </span>
          )
        )}
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-primary/40 font-bold truncate">
          {product.category}
        </p>
        <Link href={`/products/${product.id}`} className="block font-bold text-xs sm:text-sm text-primary group-hover:text-primary/70 transition-colors line-clamp-2">
          {product.name}
        </Link>
        <StarRating rating={product.rating ?? 0} reviews={product.reviews} />
        <div className="flex items-center justify-between pt-1 sm:pt-2 gap-1">
          <div className="flex items-center gap-1">
            <span className="text-base sm:text-lg md:text-xl font-extrabold text-primary">
              {formatCOP(price)}
            </span>
            {originalPrice != null && originalPrice > price && (
              <span className="text-xs text-primary/40 line-through">
                {formatCOP(originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`size-7 sm:size-9 rounded-lg flex items-center justify-center transition-all font-bold text-xs sm:text-sm flex-shrink-0 ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-primary text-white hover:bg-primary/90'
            }`}
            aria-label={isOutOfStock ? 'Producto agotado' : addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
          >
            <MaterialIcon name={isOutOfStock ? 'block' : addedToCart ? 'check' : 'add_shopping_cart'} />
          </button>
        </div>
      </div>
    </div>
  );
}
