'use client';

import { useState, useMemo, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useSearch } from '@/hooks/useSearch';
import { useFavorites } from '@/hooks/useFavorites';
import { useProducts } from '@/hooks/useProducts';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { ProductsLoader } from '@/components/products/ProductsLoader';

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  
  const { products, loading, error, fetchAll } = useProducts();
  const { favorites } = useFavorites();

  // Try to fetch from backend, fallback to MOCK_PRODUCTS
  useEffect(() => {
    fetchAll().catch(() => {
      // Fallback to mock data if backend fails
      console.warn('Using mock data - backend unavailable');
    });
  }, [fetchAll]);

  // Use backend products if available, fallback to mock products
  const dataSource = products.length > 0 ? products : MOCK_PRODUCTS;

  const { searchTerm, setSearchTerm, results: searchResults } = useSearch(
    dataSource,
    ['name', 'category']
  );

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let products = searchResults;

    // Filter by price
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by categories
    if (selectedCategories.length > 0) {
      products = products.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    // Filter by rating
    if (minRating > 0) {
      products = products.filter((p) => (p.rating || 0) >= minRating);
    }

    // Sort
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [searchResults, priceRange, selectedCategories, minRating, sortBy]);

  const hasActiveFilters =
    priceRange[1] < 500 ||
    selectedCategories.length > 0 ||
    minRating > 0 ||
    searchTerm !== '';

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setMinRating(0);
  };

  return (
    <div className="pb-20 md:pb-0">
      {loading && <ProductsLoader />}
      {!loading && (
        <>
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
            <Breadcrumbs
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Productos' },
              ]}
            />
          </div>

          {/* Search Bar */}
          <div className="bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="relative">
                <MaterialIcon
                  name="search"
                  className="absolute left-4 top-3.5 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold text-primary">Catálogo de Productos</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MaterialIcon name="tune" className="text-slate-400" />
                <span>{filteredProducts.length} resultados</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-6 text-primary">Filtros</h3>

                  {/* Price Range */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-primary mb-4">
                      Rango de Precio
                    </label>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="range"
                          min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-primary mb-4">
                  Categoría
                </label>
                <div className="space-y-2">
                  {['Electrónica', 'Moda', 'Hogar', 'Gadgets'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(
                              selectedCategories.filter((c) => c !== cat)
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-4">
                  Calificación
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                      className="rounded-full"
                    />
                    <span className="text-sm text-slate-600">Todas</span>
                  </label>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <label
                      key={stars}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === stars}
                        onChange={() => setMinRating(stars)}
                        className="rounded-full"
                      />
                      <div className="flex gap-1">
                        {Array.from({ length: stars }).map((_, i) => (
                          <MaterialIcon
                            key={i}
                            name="star"
                            filled
                            className="text-yellow-400 text-sm"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        {stars === 5 ? '5 estrellas' : `${stars}+ estrellas`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-8 w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort */}
            <div className="flex justify-between items-center mb-6">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="popular">Más Popular</option>
                <option value="price-low">Menor Precio</option>
                <option value="price-high">Mayor Precio</option>
                <option value="rating">Mejor Calificación</option>
              </select>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <MaterialIcon
                    name="manage_search"
                    className="mx-auto mb-4 text-slate-400 !text-5xl"
                  />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Intenta ajustar tus filtros o términos de búsqueda
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
