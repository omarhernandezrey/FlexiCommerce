'use client';

import { useState } from 'react';
import { useCompare } from '@/hooks/useCompare';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import Link from 'next/link';

const SPEC_GROUPS = [
  {
    label: 'General Info',
    rows: [
      { label: 'Price', key: 'price', format: (v: unknown) => typeof v === 'number' ? `$${v.toFixed(2)}` : '—' },
      { label: 'Category', key: 'category', format: (v: unknown) => String(v ?? '—') },
      { label: 'Rating', key: 'rating', format: (v: unknown) => typeof v === 'number' ? `${v} / 5` : '—' },
    ],
  },
  {
    label: 'Availability',
    rows: [
      { label: 'In Stock', key: 'stock', format: (v: unknown) => typeof v === 'number' && v > 0 ? 'Yes' : 'No' },
    ],
  },
];

export default function ComparePage() {
  const { products, removeFromCompare, clearCompare } = useCompare();
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-primary/10">
        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <MaterialIcon name="compare_arrows" className="text-primary text-4xl" />
        </div>
        <h2 className="text-xl font-extrabold text-primary mb-2">Nothing to Compare</h2>
        <p className="text-primary/60 text-sm mb-8 text-center max-w-xs">
          Add products to comparison from the wishlist or product pages
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

  return (
    <div className="spacing-section">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Product Comparison</h1>
          <p className="text-primary/60 text-sm mt-1">{products.length} of 4 products selected</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowOnlyDiff(!showOnlyDiff)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${
              showOnlyDiff
                ? 'bg-primary text-white border-primary'
                : 'border-primary/10 text-primary hover:bg-primary/5'
            }`}
          >
            <MaterialIcon name="compare" className="text-base" />
            {showOnlyDiff ? 'Show All Specs' : 'Only Differences'}
          </button>
          <button
            onClick={() => clearCompare()}
            className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            <MaterialIcon name="delete_sweep" className="text-base" />
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header: Product Cards */}
            <thead>
              <tr className="border-b border-primary/10">
                <th className="text-left p-4 bg-primary/5 w-40 shrink-0">
                  <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">Specifications</span>
                </th>
                {products.map((product) => (
                  <th key={product.compareId} className="p-4 text-center min-w-[200px] bg-primary/5">
                    <div className="relative flex flex-col items-center gap-3">
                      <button
                        onClick={() => removeFromCompare(product.compareId, product.name)}
                        className="absolute -top-1 -right-1 size-7 rounded-full bg-white border border-primary/10 flex items-center justify-center text-primary/40 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                      >
                        <MaterialIcon name="close" className="text-sm" />
                      </button>
                      <div className="size-20 rounded-xl overflow-hidden bg-primary/5 border border-primary/10">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MaterialIcon name="image_not_supported" className="text-primary/20 text-2xl" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1">
                          {product.category}
                        </p>
                        <h3 className="font-bold text-primary text-sm line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-lg font-extrabold text-primary mt-1">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
                {/* Empty slots */}
                {products.length < 4 &&
                  Array.from({ length: 4 - products.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-4 text-center min-w-[200px] bg-primary/5">
                      <Link
                        href="/products"
                        className="flex flex-col items-center gap-3 text-primary/30 hover:text-primary/60 transition-colors"
                      >
                        <div className="size-20 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center">
                          <MaterialIcon name="add" className="text-2xl" />
                        </div>
                        <span className="text-xs font-bold">Add Product</span>
                      </Link>
                    </th>
                  ))}
              </tr>
            </thead>

            {/* Specification Rows */}
            <tbody>
              {SPEC_GROUPS.map((group) => (
                <>
                  {/* Group Header */}
                  <tr key={`group-${group.label}`} className="bg-primary/5">
                    <td
                      colSpan={5}
                      className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-primary/60"
                    >
                      {group.label}
                    </td>
                  </tr>
                  {/* Group Rows */}
                  {group.rows.map((row) => {
                    const values = products.map((p) => row.format(p[row.key as keyof typeof p]));
                    const allSame = values.every((v) => v === values[0]);
                    if (showOnlyDiff && allSame) return null;

                    return (
                      <tr key={row.label} className="border-b border-primary/5 hover:bg-primary/[0.02]">
                        <td className="p-4 text-sm font-bold text-primary/60 bg-primary/[0.02]">
                          {row.label}
                        </td>
                        {products.map((product) => {
                          const val = row.format(product[row.key as keyof typeof product]);
                          return (
                            <td key={product.compareId} className="p-4 text-center text-sm font-bold text-primary">
                              {val}
                            </td>
                          );
                        })}
                        {products.length < 4 &&
                          Array.from({ length: 4 - products.length }).map((_, i) => (
                            <td key={`empty-val-${i}`} className="p-4 text-center text-primary/20">—</td>
                          ))}
                      </tr>
                    );
                  })}
                </>
              ))}

              {/* Buy Now Row */}
              <tr>
                <td className="p-4 bg-primary/[0.02]"></td>
                {products.map((product) => (
                  <td key={product.compareId} className="p-4 text-center">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-block w-full bg-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      Buy Now
                    </Link>
                  </td>
                ))}
                {products.length < 4 &&
                  Array.from({ length: 4 - products.length }).map((_, i) => (
                    <td key={`empty-buy-${i}`} className="p-4 text-center">
                      <div className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-primary/10 text-primary/20 text-sm font-bold text-center">
                        —
                      </div>
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
