export function ProductsLoader() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Breadcrumbs Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
              <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-6" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-8 space-y-3">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="lg:col-span-3">
            <div className="mb-6 h-10 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-slate-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
