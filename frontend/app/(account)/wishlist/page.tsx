'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function WishlistPage() {
  const { items, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'wishlist' | 'compare'>('wishlist');
  const [compareItems, setCompareItems] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
    }
  }, [isAuthenticated, user, router]);

  const toggleCompare = (id: string) => {
    setCompareItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-primary/10 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-64 border border-primary/10"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-primary/10">
        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <MaterialIcon name="heart_broken" className="text-primary text-4xl" />
        </div>
        <h2 className="text-xl font-extrabold text-primary mb-2">Your wishlist is empty</h2>
        <p className="text-primary/60 text-sm mb-8 text-center max-w-xs">
          Save your favorite products to access them easily later
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MaterialIcon name="storefront" className="text-base" />
          Explore Products
        </Link>
      </div>
    );
  }

  const stats = {
    total: items.length,
    minPrice: Math.min(...items.map(item => item.price)),
    maxPrice: Math.max(...items.map(item => item.price)),
    totalValue: items.reduce((sum, item) => sum + item.price, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">My Collections</h1>
          <p className="text-primary/60 text-sm mt-1">{items.length} items saved</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary hover:bg-primary/5 transition-colors">
            <MaterialIcon name="share" className="text-base" />
            Share List
          </button>
          {compareItems.length > 0 && (
            <button
              onClick={() => setActiveTab('compare')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <MaterialIcon name="compare" className="text-base" />
              Compare ({compareItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: stats.total, icon: 'favorite' },
          { label: 'Min Price', value: `$${stats.minPrice.toFixed(2)}`, icon: 'arrow_downward' },
          { label: 'Max Price', value: `$${stats.maxPrice.toFixed(2)}`, icon: 'arrow_upward' },
          { label: 'Total Value', value: `$${stats.totalValue.toFixed(2)}`, icon: 'account_balance_wallet' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name={stat.icon} className="text-primary/40 text-base" />
              <p className="text-xs text-primary/40 font-medium">{stat.label}</p>
            </div>
            <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/10">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'wishlist'
              ? 'border-primary text-primary'
              : 'border-transparent text-primary/40 hover:text-primary'
          }`}
        >
          Wishlist Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'compare'
              ? 'border-primary text-primary'
              : 'border-transparent text-primary/40 hover:text-primary'
          }`}
        >
          Comparison ({compareItems.length})
        </button>
      </div>

      {/* Wishlist Grid */}
      {activeTab === 'wishlist' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-primary/10 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative bg-primary/5 h-48 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MaterialIcon name="image_not_supported" className="text-primary/20 text-4xl" />
                    </div>
                  )}
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id, item.productName)}
                    className="absolute top-3 right-3 size-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MaterialIcon name="close" className="text-base" />
                  </button>
                  {/* Compare Checkbox */}
                  <div className="absolute bottom-3 left-3">
                    <label className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compareItems.includes(item.id)}
                        onChange={() => toggleCompare(item.id)}
                        className="rounded border-primary/20 text-primary focus:ring-primary/20 size-3"
                      />
                      <span className="text-[10px] font-bold text-primary">Compare</span>
                    </label>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary/40 mb-1">
                    {item.category}
                  </p>
                  <h3 className="font-bold text-primary mb-2 line-clamp-2 text-sm">
                    {item.productName}
                  </h3>
                  <p className="text-xl font-extrabold text-primary mb-4">
                    ${item.price.toFixed(2)}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${item.productId}`}
                      className="flex-1 text-center bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      View Product
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id, item.productName)}
                      className="px-3 py-2 border border-primary/10 text-primary/60 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
                      title="Remove from wishlist"
                    >
                      <MaterialIcon name="delete" className="text-base" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clear All */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => clearWishlist()}
              className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              <MaterialIcon name="delete_sweep" className="text-base" />
              Clear Wishlist
            </button>
          </div>
        </>
      )}

      {/* Comparison Tab */}
      {activeTab === 'compare' && (
        <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
          {compareItems.length === 0 ? (
            <div className="py-16 text-center">
              <MaterialIcon name="compare" className="text-primary/20 text-5xl mb-4" />
              <p className="font-bold text-primary mb-2">No items to compare</p>
              <p className="text-primary/60 text-sm mb-6">
                Select items from your wishlist to compare
              </p>
              <button
                onClick={() => setActiveTab('wishlist')}
                className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Go to Wishlist
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left p-4 text-xs font-bold text-primary/40 uppercase tracking-wider w-36">
                      Feature
                    </th>
                    {items
                      .filter((item) => compareItems.includes(item.id))
                      .map((item) => (
                        <th key={item.id} className="p-4 text-center min-w-[160px]">
                          <div className="flex flex-col items-center gap-2">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <span className="text-xs font-bold text-primary line-clamp-2">
                              {item.productName}
                            </span>
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Price', key: 'price' as const, format: (v: number | string) => typeof v === 'number' ? `$${v.toFixed(2)}` : v },
                    { label: 'Category', key: 'category' as const, format: (v: number | string) => String(v) },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-primary/10">
                      <td className="p-4 text-sm font-bold text-primary/60">{row.label}</td>
                      {items
                        .filter((item) => compareItems.includes(item.id))
                        .map((item) => (
                          <td key={item.id} className="p-4 text-center text-sm font-bold text-primary">
                            {row.format(item[row.key as keyof typeof item] as number | string)}
                          </td>
                        ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4"></td>
                    {items
                      .filter((item) => compareItems.includes(item.id))
                      .map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <Link
                            href={`/products/${item.productId}`}
                            className="block bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                          >
                            Buy Now
                          </Link>
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mobile Compare Drawer */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary/10 p-4 flex items-center justify-between shadow-xl z-40 lg:hidden">
          <div className="flex items-center gap-2">
            {items
              .filter((item) => compareItems.includes(item.id))
              .map((item) => (
                <div key={item.id} className="size-10 rounded-lg overflow-hidden border border-primary/10">
                  <img src={item.image || ''} alt={item.productName} className="w-full h-full object-cover" />
                </div>
              ))}
            <span className="text-sm font-bold text-primary">{compareItems.length} selected</span>
          </div>
          <button
            onClick={() => setActiveTab('compare')}
            className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Compare
          </button>
        </div>
      )}
    </div>
  );
}
