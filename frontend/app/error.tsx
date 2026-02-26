'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-24 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <MaterialIcon name="error_outline" className="text-red-400 text-5xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-primary mb-2">Algo salió mal</h1>
        <p className="text-slate-500 text-base mb-8">
          Ocurrió un error inesperado. Por favor intenta de nuevo o vuelve al inicio.
        </p>

        {/* Error detail (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left">
            <p className="text-xs font-mono text-red-600 break-all">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs text-red-400 mt-1">Digest: {error.digest}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MaterialIcon name="refresh" className="text-base" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary/20 text-primary font-semibold px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <MaterialIcon name="home" className="text-base" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
