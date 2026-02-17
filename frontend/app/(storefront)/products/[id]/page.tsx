'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { StarRating } from '@/components/ui/StarRating';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductCard } from '@/components/products/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { useCart } from '@/hooks/useCart';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const product = MOCK_PRODUCTS.find(p => p.id === params.id) || MOCK_PRODUCTS[0];
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const relatedProducts = MOCK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Productos', href: '/products' },
            { label: product.name },
          ]}
        />
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden h-96 md:h-[500px] flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <StarRating rating={product.rating} reviews={product.reviews} />
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-slate-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 mb-8 leading-relaxed">
              Producto de alta calidad con excelentes características. Perfecto para quienes buscan
              la mejor experiencia. Disponible en varias opciones y colores.
            </p>

            {/* Options */}
            <div className="space-y-6 mb-8">
              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-3">Color</label>
                <div className="flex gap-3">
                  {['Negro', 'Plata', 'Azul'].map((color) => (
                    <button
                      key={color}
                      className="px-4 py-2 border-2 border-slate-200 rounded-lg hover:border-primary transition-colors"
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-3">Tamaño</label>
                <div className="flex gap-3">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <button
                      key={size}
                      className="px-4 py-2 border-2 border-slate-200 rounded-lg hover:border-primary transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-3">Cantidad</label>
                <div className="flex items-center border border-slate-200 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-slate-50"
                  >
                    <MaterialIcon name="remove" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="px-4 py-2 text-center w-12 border-none focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-slate-50"
                  >
                    <MaterialIcon name="add" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <MaterialIcon name="shopping_bag" />
                {addedToCart ? 'Agregado al carrito!' : 'Agregar al carrito'}
              </button>
              <button className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors">
                <MaterialIcon name="favorite_border" />
              </button>
            </div>

            {/* Info */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex gap-3 text-sm">
                <MaterialIcon name="local_shipping" className="text-primary" />
                <span className="text-slate-600">Envío gratis en compras mayores a $100</span>
              </div>
              <div className="flex gap-3 text-sm">
                <MaterialIcon name="verified_user" className="text-primary" />
                <span className="text-slate-600">Garantía de 2 años incluida</span>
              </div>
              <div className="flex gap-3 text-sm">
                <MaterialIcon name="assignment_return" className="text-primary" />
                <span className="text-slate-600">Devuelve en 30 días sin preguntas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Productos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
