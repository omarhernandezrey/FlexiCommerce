'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { StarRating } from '@/components/ui/StarRating';
import { ProductCard } from '@/components/products/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { useCart } from '@/hooks/useCart';

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Silver', hex: '#9ca3af' },
  { name: 'Navy Blue', hex: '#1e3a5f' },
  { name: 'Rose Gold', hex: '#f4a4a4' },
];

const TABS = ['Description', 'Specifications', 'Reviews'] as const;
type Tab = typeof TABS[number];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const product = MOCK_PRODUCTS.find((p) => p.id === params.id) || MOCK_PRODUCTS[0];
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].name);
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  const [inWishlist, setInWishlist] = useState(false);

  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

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

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Use the same image for all thumbnails (mock gallery)
  const galleryImages = [product.image, product.image, product.image, product.image];

  return (
    <div className="space-y-12 pb-20 md:pb-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-primary/40">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="text-primary font-medium truncate max-w-48">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative bg-primary/5 rounded-2xl overflow-hidden aspect-square">
            <img
              src={galleryImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-2 py-1 rounded-lg">
                -{discountPercent}%
              </div>
            )}
            <button
              onClick={() => setInWishlist(!inWishlist)}
              className="absolute top-4 right-4 size-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <MaterialIcon
                name="favorite"
                filled={inWishlist}
                className={inWishlist ? 'text-red-500' : 'text-primary/40'}
              />
            </button>
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? 'border-primary shadow-md' : 'border-primary/10 hover:border-primary/30'
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary/40">{product.category}</span>
            <h1 className="text-3xl font-extrabold text-primary mt-1 leading-tight">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} reviews={product.reviews} />
            <span className="text-xs text-primary/40">|</span>
            <span className="text-xs text-primary/60 font-medium">In Stock</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-primary/40 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="text-sm font-bold text-red-500">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
              </>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <p className="text-sm font-bold text-primary mb-3">
              Color: <span className="font-normal text-primary/60">{selectedColor}</span>
            </p>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{ backgroundColor: c.hex }}
                  className={`size-8 rounded-full transition-all ${
                    selectedColor === c.name
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'ring-1 ring-primary/10 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-sm font-bold text-primary mb-3">Quantity</p>
            <div className="flex items-center gap-3 bg-primary/5 rounded-xl p-1 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-primary"
              >
                <MaterialIcon name="remove" className="text-base" />
              </button>
              <span className="w-8 text-center font-extrabold text-primary text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-primary"
              >
                <MaterialIcon name="add" className="text-base" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <MaterialIcon name={addedToCart ? 'check' : 'shopping_bag'} className="text-base" />
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </button>
            <button
              onClick={() => setInWishlist(!inWishlist)}
              className="px-4 py-3.5 border-2 border-primary/10 text-primary rounded-xl hover:bg-primary/5 transition-colors"
            >
              <MaterialIcon
                name="favorite"
                filled={inWishlist}
                className={inWishlist ? 'text-red-500' : ''}
              />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="border border-primary/10 rounded-xl p-4 space-y-3">
            {[
              { icon: 'local_shipping', text: 'Free shipping on orders over $100' },
              { icon: 'verified_user', text: '2-year warranty included' },
              { icon: 'assignment_return', text: '30-day easy returns' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm">
                <MaterialIcon name={item.icon} className="text-primary text-base" />
                <span className="text-primary/60">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-2xl border border-primary/10 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-primary/10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/40 hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'Description' && (
            <p className="text-primary/60 leading-relaxed">
              {product.name} is a high-quality product crafted with premium materials.
              It offers exceptional performance and durability, perfect for everyday use.
              Available in multiple colors and sizes to suit your preferences.
            </p>
          )}

          {activeTab === 'Specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Category', value: product.category },
                { label: 'Price', value: `$${product.price.toFixed(2)}` },
                { label: 'Rating', value: `${product.rating} / 5` },
                { label: 'Reviews', value: `${product.reviews} reviews` },
                { label: 'SKU', value: `FC-${product.id}` },
                { label: 'Availability', value: 'In Stock' },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between py-3 border-b border-primary/5">
                  <span className="text-sm font-bold text-primary/40">{spec.label}</span>
                  <span className="text-sm font-semibold text-primary">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-4">
              {[
                { name: 'John D.', rating: 5, comment: 'Excellent product! Exceeded my expectations.' },
                { name: 'Maria S.', rating: 4, comment: 'Great quality, fast shipping. Would buy again.' },
                { name: 'Carlos M.', rating: 5, comment: 'Perfect for daily use. Highly recommended!' },
              ].map((review) => (
                <div key={review.name} className="bg-primary/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-primary text-sm">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MaterialIcon
                          key={i}
                          name="star"
                          filled={i < review.rating}
                          className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-primary/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-primary/60 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-primary">Related Products</h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline"
            >
              View All <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
