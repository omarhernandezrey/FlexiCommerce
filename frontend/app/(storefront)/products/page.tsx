'use client';

import { useState, useMemo, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { useSearch } from '@/hooks/useSearch';
import { useFavorites } from '@/hooks/useFavorites';
import { useProducts } from '@/hooks/useProducts';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { ProductsLoader } from '@/components/products/ProductsLoader';

const CATEGORY_FILTERS = [
  { name: 'Electronics', icon: 'devices', count: 1200 },
  { name: 'Fashion', icon: 'checkroom', count: 3500 },
  { name: 'Home Decor', icon: 'home', count: 800 },
  { name: 'Smart Gadgets', icon: 'developer_mode', count: 450 },
];

const COLOR_SWATCHES = [
  { name: 'Black', bg: 'bg-black' },
  { name: 'Silver', bg: 'bg-gray-400' },
  { name: 'Midnight Blue', bg: 'bg-blue-900' },
  { name: 'Rose Gold', bg: 'bg-pink-200' },
];

const SCREEN_SIZES = ['13-inch', '14-inch', '15-inch', '16-inch'];

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedScreenSize, setSelectedScreenSize] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const { products, loading, fetchAll } = useProducts();
  const { favorites } = useFavorites();

  useEffect(() => {
    fetchAll().catch(() => {
      console.warn('Using mock data - backend unavailable');
    });
  }, [fetchAll]);

  const dataSource = products.length > 0 ? products : MOCK_PRODUCTS;

  const { searchTerm, setSearchTerm, results: searchResults } = useSearch(
    dataSource,
    ['name', 'category']
  );

  const filteredProducts = useMemo(() => {
    let filtered = searchResults;

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }

    if (minRating > 0) {
      filtered = filtered.filter((p) => (p.rating || 0) >= minRating);
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) => {
        const pColor = (p as Record<string, unknown>).color as string | undefined;
        return pColor ? selectedColors.includes(pColor) : false;
      });
    }

    if (selectedScreenSize) {
      filtered = filtered.filter((p) => {
        const pSize = (p as Record<string, unknown>).screenSize as string | undefined;
        return pSize === selectedScreenSize;
      });
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
      case 'rating': sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }

    return sorted;
  }, [searchResults, priceRange, selectedCategories, minRating, selectedColors, selectedScreenSize, sortBy]);

  const hasActiveFilters =
    priceRange[1] < 500 ||
    selectedCategories.length > 0 ||
    minRating > 0 ||
    searchTerm !== '' ||
    selectedColors.length > 0 ||
    selectedScreenSize !== '';

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setMinRating(0);
    setSelectedColors([]);
    setSelectedScreenSize('');
    setCurrentPage(1);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  if (loading) return <ProductsLoader />;

  const FilterSidebar = () => (
    <div className="bg-white rounded-xl border border-primary/10 p-6 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-primary">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-primary/60 hover:text-primary transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <MaterialIcon name="search" className="absolute left-3 top-2.5 text-primary/40 text-base" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-9 pr-3 py-2 border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-primary/5"
        />
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Categories</h4>
        <div className="space-y-1">
          {CATEGORY_FILTERS.map((cat) => (
            <label key={cat.name} className="flex items-center gap-3 cursor-pointer group py-1.5">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
                className="rounded border-primary/20 text-primary focus:ring-primary/20 size-3.5"
              />
              <MaterialIcon name={cat.icon} className="text-primary/40 text-base group-hover:text-primary transition-colors" />
              <span className="text-sm text-primary/60 group-hover:text-primary transition-colors flex-1">{cat.name}</span>
              <span className="text-xs text-primary/30 font-medium">{cat.count.toLocaleString()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Price Range</h4>
        <input
          type="range"
          min="0"
          max="500"
          value={priceRange[1]}
          onChange={(e) => { setPriceRange([priceRange[0], parseInt(e.target.value)]); setCurrentPage(1); }}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs font-bold text-primary mt-2">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => { setMinRating(minRating === stars ? 0 : stars); setCurrentPage(1); }}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors ${
                minRating === stars ? 'bg-primary/10 text-primary font-bold' : 'text-primary/60 hover:bg-primary/5'
              }`}
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialIcon
                    key={i}
                    name="star"
                    filled={i < stars}
                    className={`text-sm ${i < stars ? 'text-yellow-400' : 'text-primary/20'}`}
                  />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h4 className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MaterialIcon name="palette" className="text-base" />
          Color
        </h4>
        <div className="flex flex-wrap gap-3">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color.name}
              title={color.name}
              onClick={() => toggleColor(color.name)}
              className={`w-6 h-6 rounded-full border-2 border-white ring-1 transition-all ${color.bg} ${
                selectedColors.includes(color.name) ? 'ring-primary scale-110' : 'ring-gray-200 hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Screen Size */}
      <div>
        <h4 className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MaterialIcon name="straighten" className="text-base" />
          Screen Size
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {SCREEN_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedScreenSize(selectedScreenSize === size ? '' : size)}
              className={`px-2 py-1.5 border rounded text-xs font-medium transition-all ${
                selectedScreenSize === size
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/20 text-primary/60 hover:border-primary hover:text-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="spacing-section pb-20 md:pb-0">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center gap-3">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
        >
          <MaterialIcon name="tune" className="text-base" />
          Filters
          {hasActiveFilters && (
            <span className="size-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {selectedCategories.length + (minRating > 0 ? 1 : 0) + (priceRange[1] < 500 ? 1 : 0) + selectedColors.length + (selectedScreenSize ? 1 : 0)}
            </span>
          )}
        </button>
        {mobileFiltersOpen && (
          <button onClick={() => setMobileFiltersOpen(false)} className="text-primary/60 text-sm">
            Close
          </button>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden">
          <FilterSidebar />
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between spacing-header">
            <p className="text-sm text-primary/60">
              Showing <span className="font-bold text-primary">{filteredProducts.length}</span> products
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-white border border-primary/10 rounded-lg pl-4 pr-8 py-2 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="popular">Sort: Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rating</option>
              </select>
              <MaterialIcon name="expand_more" className="absolute right-2 top-2.5 text-primary/40 pointer-events-none text-base" />
            </div>
          </div>

          {/* Product Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-primary/10">
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <MaterialIcon name="manage_search" className="text-primary text-4xl" />
              </div>
              <h3 className="text-xl font-extrabold text-primary mb-2">No products found</h3>
              <p className="text-primary/60 text-sm mb-6 text-center max-w-xs">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <MaterialIcon name="chevron_left" className="text-base" />
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`size-9 rounded-lg text-sm font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-primary/10 text-primary hover:bg-primary/5'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <MaterialIcon name="chevron_right" className="text-base" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
