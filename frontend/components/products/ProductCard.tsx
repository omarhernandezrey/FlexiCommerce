'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { StarRating } from '@/components/ui/StarRating';
import { type MockProduct } from '@/lib/constants';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';

interface ProductCardProps {
  product: MockProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
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
    <div className="group bg-white rounded-xl border border-primary/5 p-4 shadow-sm hover:shadow-xl transition-all">
      <Link href={`/products/${product.id}`}>
        <div className="relative rounded-lg overflow-hidden aspect-square mb-4 bg-gray-50">
          <img
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            src={product.image}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              handleToggleFavorite();
            }}
            className={`absolute top-2 right-2 size-8 rounded-full backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
              isFav ? 'bg-red-100 text-red-500' : 'bg-white/80 text-primary hover:text-red-500'
            }`}
          >
            <MaterialIcon name="favorite" className="text-xl" filled={isFav} />
          </button>
          {product.badge && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
              {product.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold">
          {product.category}
        </p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-primary group-hover:text-primary/70 transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} reviews={product.reviews} />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-primary/40 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`size-9 rounded-lg flex items-center justify-center transition-all font-bold text-sm ${
              addedToCart
                ? 'bg-success text-white'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
            title={addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
          >
            <MaterialIcon name={addedToCart ? 'check' : 'add_shopping_cart'} />
          </button>
        </div>
      </div>
    </div>
  );
}
