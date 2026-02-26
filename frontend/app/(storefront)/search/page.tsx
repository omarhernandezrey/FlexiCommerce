'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { MOCK_PRODUCTS, type MockProduct } from '@/lib/constants';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

const RATING_OPTIONS = [4, 3, 2, 1];

const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 – $200', min: 50, max: 200 },
  { label: '$200 – $500', min: 200, max: 500 },
  { label: '$500 – $1,000', min: 500, max: 1000 },
  { label: '$1,000+', min: 1000, max: 999999 },
];

const POPULAR_SEARCHES = [
  'Wireless Headphones', 'Smart Watch', 'Laptop Stand', 'USB-C Hub',
  'Mechanical Keyboard', 'Noise Cancelling', 'Gaming Mouse', 'LED Desk Lamp',
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { products, loading, search, fetchAll } = useProducts();
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [sort, setSort] = useState('relevance');
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Run initial search from URL
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
    inputRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q.trim());
    setHasSearched(true);
    try {
      await search(q.trim());
    } catch {
      // Fallback: filter mock products
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    router.replace(`/search?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
    doSearch(inputValue.trim());
  };

  const handlePopularSearch = (term: string) => {
    setInputValue(term);
    router.replace(`/search?q=${encodeURIComponent(term)}`, { scroll: false });
    doSearch(term);
  };

  // Use mock fallback when backend not connected
  const mockResults = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const rawResults: MockProduct[] =
    products.length > 0
      ? (products as unknown as MockProduct[])
      : (hasSearched ? mockResults : []);

  // Apply filters
  let filtered = rawResults;
  if (minRating > 0) {
    filtered = filtered.filter((p) => (p.rating ?? 0) >= minRating);
  }
  if (priceRange) {
    filtered = filtered.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  const clearFilters = () => {
    setMinRating(0);
    setPriceRange(null);
    setSort('relevance');
  };

  const hasFilters = minRating > 0 || priceRange !== null || sort !== 'relevance';

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-primary/40">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="text-primary font-medium">Search</span>
        {query && (
          <>
            <MaterialIcon name="chevron_right" className="text-base" />
            <span className="text-primary/60">&ldquo;{query}&rdquo;</span>
          </>
        )}
      </nav>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-white border-2 border-primary/10 rounded-2xl overflow-hidden focus-within:border-primary/30 transition-colors shadow-sm">
            <MaterialIcon name="search" className="text-primary/40 text-2xl ml-5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="flex-1 px-4 py-4 text-primary text-base placeholder:text-primary/30 focus:outline-none bg-transparent"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => { setInputValue(''); setHasSearched(false); }}
                className="mr-2 size-8 flex items-center justify-center rounded-full hover:bg-primary/5 transition-colors"
              >
                <MaterialIcon name="close" className="text-primary/40 text-base" />
              </button>
            )}
            <button
              type="submit"
              className="m-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Searches (shown before first search) */}
        {!hasSearched && (
          <div className="mt-4">
            <p className="text-xs font-bold text-primary/40 mb-3 uppercase tracking-wider">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularSearch(term)}
                  className="px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary/70 text-xs font-semibold rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-primary/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-primary text-sm">Filters</h3>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-primary/50 hover:text-primary transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="mb-6">
                <p className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Sort By</p>
                <div className="space-y-1.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        sort === opt.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-primary/50 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {opt.label}
                      {sort === opt.value && <MaterialIcon name="check" className="text-sm text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <p className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Price Range</p>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((range) => {
                    const isActive = priceRange?.min === range.min && priceRange?.max === range.max;
                    return (
                      <button
                        key={range.label}
                        onClick={() => setPriceRange(isActive ? null : { min: range.min, max: range.max })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-primary/50 hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {range.label}
                        {isActive && <MaterialIcon name="check" className="text-sm text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <p className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Min Rating</p>
                <div className="space-y-1.5">
                  {RATING_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? 0 : r)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        minRating === r
                          ? 'bg-primary/10 text-primary'
                          : 'text-primary/50 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <MaterialIcon
                            key={i}
                            name="star"
                            filled={i < r}
                            className={`text-xs ${i < r ? 'text-yellow-400' : 'text-primary/20'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold">& up</span>
                      {minRating === r && <MaterialIcon name="check" className="text-sm text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-primary text-lg">
                  {loading ? 'Searching...' : `${sorted.length} results`}
                  {query && <span className="font-normal text-primary/50"> for &ldquo;{query}&rdquo;</span>}
                </h2>
                {hasFilters && (
                  <p className="text-xs text-primary/40 mt-0.5">Filters applied</p>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-primary/5 rounded-2xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white rounded-2xl border border-primary/10 p-16 text-center">
                <MaterialIcon name="search_off" className="text-5xl text-primary/20 mb-4" />
                <h3 className="font-extrabold text-primary text-xl mb-2">No results found</h3>
                <p className="text-sm text-primary/50 mb-2">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;
                </p>
                {hasFilters && (
                  <p className="text-xs text-primary/40 mb-6">Try clearing your filters</p>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-5 py-2.5 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                  <Link
                    href="/products"
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors"
                  >
                    Browse All Products
                  </Link>
                </div>

                {/* Suggestions */}
                <div className="mt-8 text-left">
                  <p className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Try searching for</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {POPULAR_SEARCHES.slice(0, 6).map((term) => (
                      <button
                        key={term}
                        onClick={() => handlePopularSearch(term)}
                        className="px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary/70 text-xs font-semibold rounded-full hover:bg-primary/10 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sorted.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Load More */}
                {sorted.length >= 12 && (
                  <div className="text-center pt-4">
                    <button className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-sm">
                      Load More Results
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Empty state — not searched yet */}
      {!hasSearched && (
        <div className="text-center py-12">
          <MaterialIcon name="manage_search" className="text-6xl text-primary/15 mb-4" />
          <h2 className="text-2xl font-extrabold text-primary mb-2">Search FlexiCommerce</h2>
          <p className="text-primary/50 text-base">Find products, brands, and categories</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
