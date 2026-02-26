'use client';

import { useState, useEffect } from 'react';
import { useReviews } from '@/hooks/useReviews';
import type { Review } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { StarRating } from '@/components/ui/StarRating';
import { ProductCard } from '@/components/products/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useProducts } from '@/hooks/useProducts';

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Silver', hex: '#9ca3af' },
  { name: 'Navy Blue', hex: '#1e3a5f' },
  { name: 'Rose Gold', hex: '#f4a4a4' },
];

const TABS = ['Description', 'Specifications', 'Reviews', 'Shipping & Returns'] as const;
type Tab = typeof TABS[number];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { fetchById } = useProducts();
  const { fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist, items: wishlistItems } = useWishlist();

  const [productData, setProductData] = useState(
    MOCK_PRODUCTS.find((p) => p.id === params.id) || MOCK_PRODUCTS[0]
  );

  // Load product from backend, fallback to mock
  useEffect(() => {
    fetchById(params.id)
      .then((data) => { if (data) setProductData(data); })
      .catch(() => {/* keep mock */});
    fetchWishlist().catch(() => {/* ignore */});
  }, [params.id, fetchById, fetchWishlist]);

  const product = productData;

  const {
    reviews,
    stats,
    loading: reviewsLoading,
    hasUserReview,
    userReview,
    createReview,
    updateReview,
    deleteReview,
    fetchReviews,
  } = useReviews(product.id);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewLimit, setReviewLimit] = useState(10);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  // Helpers
  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Review handlers
  const handleLoadMoreReviews = async () => {
    const newLimit = reviewLimit + 10;
    setReviewLimit(newLimit);
    await fetchReviews(1, newLimit);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      if (isEditingReview && userReview) {
        await updateReview(userReview.id, reviewRating, reviewComment);
      } else {
        await createReview(reviewRating, reviewComment);
      }
      setReviewRating(0);
      setReviewComment('');
      setIsEditingReview(false);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setReviewRating(userReview.rating);
      setReviewComment(userReview.comment || '');
      setIsEditingReview(true);
    }
  };

  const handleDeleteReview = async () => {
    if (userReview && confirm('¿Estás seguro de eliminar tu reseña?')) {
      await deleteReview(userReview.id);
    }
  };

  const handleToggleWishlist = async () => {
    if (inWishlist && wishlistItem) {
      await removeFromWishlist(wishlistItem.id, product.name);
    } else {
      await addToWishlist(product.id, product.name, product.price, product.image, product.category);
    }
  };
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].name);
  const [activeTab, setActiveTab] = useState<Tab>('Description');

  const inWishlist = isInWishlist(product.id);
  const wishlistItem = wishlistItems.find((i) => i.productId === product.id);

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

  // Use product.images[] array when available, fallback to repeating the main image
  const galleryImages = product.images?.length
    ? product.images
    : [product.image, product.image, product.image, product.image];

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 sm:pb-20 md:pb-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary/40 overflow-x-auto">
        <Link href="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
        <MaterialIcon name="chevron_right" className="text-base flex-shrink-0" />
        <Link href="/products" className="hover:text-primary transition-colors whitespace-nowrap">Products</Link>
        <MaterialIcon name="chevron_right" className="text-base flex-shrink-0" />
        <span className="text-primary font-medium truncate">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
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
              onClick={handleToggleWishlist}
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
        <div className="space-y-4 sm:space-y-6">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary/40">{product.category}</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary mt-1 leading-tight">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 sm:gap-3">
            <StarRating rating={product.rating} reviews={product.reviews} />
            <span className="text-xs text-primary/40">|</span>
            <span className="text-xs text-primary/60 font-medium">In Stock</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-extrabold text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-base sm:text-lg text-primary/40 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="text-xs sm:text-sm font-bold text-red-500">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
              </>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <p className="text-xs sm:text-sm font-bold text-primary mb-2 sm:mb-3">
              Color: <span className="font-normal text-primary/60">{selectedColor}</span>
            </p>
            <div className="flex gap-2 sm:gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{ backgroundColor: c.hex }}
                  className={`size-7 sm:size-8 rounded-full transition-all ${
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
            <p className="text-xs sm:text-sm font-bold text-primary mb-2 sm:mb-3">Quantity</p>
            <div className="flex items-center gap-2 sm:gap-3 bg-primary/5 rounded-xl p-1 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="size-7 sm:size-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-primary"
              >
                <MaterialIcon name="remove" className="text-base" />
              </button>
              <span className="w-7 sm:w-8 text-center font-extrabold text-primary text-base sm:text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="size-7 sm:size-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-primary"
              >
                <MaterialIcon name="add" className="text-base" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              <MaterialIcon name={addedToCart ? 'check' : 'shopping_bag'} className="text-base" />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </button>
            <button
              onClick={handleToggleWishlist}
              className="px-3 sm:px-4 py-2.5 sm:py-3.5 border-2 border-primary/10 text-primary rounded-lg sm:rounded-xl hover:bg-primary/5 transition-colors"
            >
              <MaterialIcon
                name="favorite"
                filled={inWishlist}
                className={inWishlist ? 'text-red-500 text-lg sm:text-2xl' : 'text-lg sm:text-2xl'}
              />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="border border-primary/10 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 text-xs sm:text-sm">
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
      <div className="bg-white rounded-lg sm:rounded-2xl border border-primary/10 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-primary/10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
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
            <div className="space-y-6">
              <p className="text-primary/60 leading-relaxed">
                {product.name} is a high-quality product crafted with premium materials.
                It offers exceptional performance and durability, perfect for everyday use.
                Available in multiple colors and sizes to suit your preferences.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: 'battery_charging_full', title: '40-Hour Battery Life', desc: 'Listen all week long with a single charge. 10 minutes of fast charging gives you 5 hours of playback.' },
                  { icon: 'spatial_audio', title: 'Spatial Soundscape', desc: 'Immersive 3D audio that places you at the center of your music, movies, and games.' },
                  { icon: 'noise_aware', title: 'Active Noise Cancellation', desc: 'Industry-leading ANC technology blocks out unwanted background noise for pure focus.' },
                  { icon: 'devices', title: 'Multi-Device Pairing', desc: 'Seamlessly switch between up to 3 devices simultaneously with instant connection.' },
                ].map((feat) => (
                  <div key={feat.title} className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                    <MaterialIcon name={feat.icon} className="text-primary text-3xl mb-4" />
                    <h3 className="font-bold text-primary mb-2 text-lg">{feat.title}</h3>
                    <p className="text-sm text-primary/60">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="space-y-6">
              {/* Rating Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 rounded-xl">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-6xl font-extrabold text-primary">
                    {stats.count > 0 ? stats.average.toFixed(1) : product.rating}
                  </span>
                  <div className="flex my-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avg = stats.count > 0 ? stats.average : product.rating;
                      return (
                        <MaterialIcon
                          key={i}
                          name="star"
                          filled={i < Math.round(avg)}
                          className={`text-base ${i < Math.round(avg) ? 'text-yellow-400' : 'text-primary/20'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm text-primary/60 font-medium">
                    Based on {stats.count > 0 ? stats.count : product.reviews} reviews
                  </span>
                </div>
                <div className="space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((stars) => {
                    const count = stats.distribution[stars] ?? 0;
                    const total = stats.count || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-primary/60 w-4">{stars}</span>
                        <MaterialIcon name="star" filled className="text-yellow-400 text-sm" />
                        <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-primary/40 font-medium w-8">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2">
                {['Great Quality', 'Fast Shipping', 'Good Value', 'Durable', 'Highly Recommended'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Write a Review / User's Review */}
              {user ? (
                hasUserReview && !isEditingReview ? (
                  /* User already reviewed — show their review with edit/delete */
                  <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-primary">Your Review</span>
                      <div className="flex gap-3">
                        <button
                          onClick={handleEditReview}
                          className="text-xs font-bold text-primary hover:text-primary/70 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={handleDeleteReview}
                          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MaterialIcon
                          key={i}
                          name="star"
                          filled={i < (userReview?.rating ?? 0)}
                          className={`text-sm ${i < (userReview?.rating ?? 0) ? 'text-yellow-400' : 'text-primary/20'}`}
                        />
                      ))}
                    </div>
                    {userReview?.comment && (
                      <p className="text-sm text-primary/70 italic">&ldquo;{userReview.comment}&rdquo;</p>
                    )}
                  </div>
                ) : (
                  /* Write / Edit review form */
                  <form onSubmit={handleSubmitReview} className="bg-white rounded-xl p-5 border border-primary/10 space-y-4">
                    <h3 className="font-bold text-primary text-sm">
                      {isEditingReview ? 'Edit Your Review' : 'Write a Review'}
                    </h3>
                    {/* Interactive Stars */}
                    <div>
                      <p className="text-xs font-bold text-primary/60 mb-2">Your Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverStar(star)}
                            onMouseLeave={() => setHoverStar(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <MaterialIcon
                              name="star"
                              filled={star <= (hoverStar || reviewRating)}
                              className={`text-2xl ${star <= (hoverStar || reviewRating) ? 'text-yellow-400' : 'text-primary/20'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Comment */}
                    <div>
                      <p className="text-xs font-bold text-primary/60 mb-2">Comment (optional)</p>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={3}
                        maxLength={500}
                        className="w-full border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <p className="text-xs text-primary/30 text-right">{reviewComment.length}/500</p>
                    </div>
                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={reviewRating === 0 || reviewSubmitting}
                        className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {reviewSubmitting ? 'Submitting...' : isEditingReview ? 'Save Changes' : 'Publish Review'}
                      </button>
                      {isEditingReview && (
                        <button
                          type="button"
                          onClick={() => { setIsEditingReview(false); setReviewRating(0); setReviewComment(''); }}
                          className="px-4 py-2.5 border border-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/5 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )
              ) : (
                /* Not logged in — prompt to login */
                <div className="bg-primary/5 rounded-xl p-6 text-center border border-primary/10">
                  <MaterialIcon name="rate_review" className="text-3xl text-primary/30 mb-2" />
                  <p className="text-sm text-primary/60 mb-3">Sign in to leave a review</p>
                  <Link href="/auth" className="inline-block bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Review Cards */}
              {reviewsLoading && reviews.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-primary/10 animate-pulse">
                      <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-primary/10 rounded w-24" />
                          <div className="h-3 bg-primary/10 rounded w-16" />
                        </div>
                      </div>
                      <div className="h-3 bg-primary/10 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {reviews.map((review: Review) => (
                      <div key={review.id} className="bg-white rounded-xl p-6 border border-primary/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                              {getInitials(review.user.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-primary">{review.user.name}</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                  <MaterialIcon name="verified" className="text-[10px]" />
                                  Verified
                                </span>
                              </div>
                              <div className="flex mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <MaterialIcon
                                    key={i}
                                    name="star"
                                    filled={i < review.rating}
                                    className={`text-xs ${i < review.rating ? 'text-yellow-500' : 'text-primary/20'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-primary/40">{formatDate(review.createdAt)}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-primary/70 leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {reviews.length >= reviewLimit && (
                    <button
                      onClick={handleLoadMoreReviews}
                      disabled={reviewsLoading}
                      className="w-full py-4 border border-primary/10 rounded-xl font-bold text-primary/60 hover:bg-primary hover:text-white transition-all disabled:opacity-40"
                    >
                      {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <MaterialIcon name="rate_review" className="text-4xl text-primary/20 mb-2" />
                  <p className="text-sm text-primary/40">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Shipping & Returns' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: 'local_shipping', title: 'Free Standard Shipping', desc: 'Free shipping on all orders over $100. Estimated delivery 5-7 business days.' },
                  { icon: 'bolt', title: 'Express Delivery', desc: 'Get it in 2-3 business days with Express shipping for $15. Order before 2pm for same-day dispatch.' },
                  { icon: 'assignment_return', title: '30-Day Free Returns', desc: 'Not satisfied? Return your item within 30 days of delivery, no questions asked.' },
                  { icon: 'verified_user', title: '2-Year Warranty', desc: 'Every product comes with a full 2-year manufacturer warranty covering all defects.' },
                ].map((item) => (
                  <div key={item.title} className="bg-primary/5 p-5 rounded-xl border border-primary/10 flex gap-4">
                    <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <MaterialIcon name={item.icon} className="text-primary text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-1">{item.title}</h4>
                      <p className="text-sm text-primary/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                  <MaterialIcon name="info" className="text-base" />
                  Return Policy Details
                </h4>
                <ul className="space-y-2 text-sm text-primary/60">
                  <li className="flex items-start gap-2"><MaterialIcon name="check_circle" className="text-green-500 text-base mt-0.5 shrink-0" />Items must be unused and in original packaging.</li>
                  <li className="flex items-start gap-2"><MaterialIcon name="check_circle" className="text-green-500 text-base mt-0.5 shrink-0" />Include all original accessories and documentation.</li>
                  <li className="flex items-start gap-2"><MaterialIcon name="check_circle" className="text-green-500 text-base mt-0.5 shrink-0" />Returns processed within 3-5 business days of receipt.</li>
                  <li className="flex items-start gap-2"><MaterialIcon name="check_circle" className="text-green-500 text-base mt-0.5 shrink-0" />Refund issued to original payment method.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="spacing-section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-primary">Related Products</h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline"
            >
              View All <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-gap-standard">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
