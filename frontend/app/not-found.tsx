import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg w-full">
        {/* 404 visual */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <span className="text-[120px] font-black text-primary/5 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MaterialIcon name="search_off" className="text-primary text-4xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-primary mb-2">Página no encontrada</h1>
        <p className="text-slate-500 text-base mb-10">
          La página que buscas no existe o fue movida a otra dirección.
        </p>

        {/* Primary action */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors mb-8"
        >
          <MaterialIcon name="home" className="text-base" />
          Volver al inicio
        </Link>

        {/* Quick links */}
        <div className="border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wide">
            Links rápidos
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <MaterialIcon name="storefront" className="text-base" />
              Productos
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <MaterialIcon name="receipt_long" className="text-base" />
              Mis órdenes
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <MaterialIcon name="shopping_cart" className="text-base" />
              Carrito
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <MaterialIcon name="person" className="text-base" />
              Mi cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
