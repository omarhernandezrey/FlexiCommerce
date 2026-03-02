/**
 * Tests de accesibilidad WCAG 2.1 — F4-04
 * Verifica que los componentes críticos no tienen errores de axe-core
 */
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ─── Mocks globales ────────────────────────────────────────────────────────────

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/ui/MaterialIcon', () => ({
  MaterialIcon: ({ name, 'aria-hidden': ariaHidden }: { name: string; 'aria-hidden'?: boolean }) =>
    ariaHidden ? null : <span>{name}</span>,
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    items: [],
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getTotalItems: () => 0,
    getTotalPrice: () => 0,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock('@/hooks/useAuthAPI', () => ({
  useAuthAPI: () => ({ logout: jest.fn() }),
}));

jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  }),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Accesibilidad WCAG 2.1 — Componentes críticos', () => {
  it('ProductCard no tiene violaciones de accesibilidad', async () => {
    const { ProductCard } = await import('@/components/products/ProductCard');
    const mockProduct = {
      id: 'prod-1',
      name: 'Laptop Pro',
      price: 999.99,
      image: '/laptop.jpg',
      category: 'Electronics',
      rating: 4.5,
      reviews: 10,
      description: 'Laptop description',
      stock: 5,
    };
    const { container } = render(<ProductCard product={mockProduct} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Página 404 no tiene violaciones de accesibilidad', async () => {
    const { default: NotFound } = await import('@/app/not-found');
    const { container } = render(<NotFound />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Página de Error no tiene violaciones de accesibilidad', async () => {
    const { default: ErrorPage } = await import('@/app/error');
    const mockError = new Error('Test error');
    const { container } = render(<ErrorPage error={mockError} reset={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CartPage vacío no tiene violaciones de accesibilidad', async () => {
    jest.spyOn(require('@/hooks/useCart'), 'useCart').mockReturnValue({
      items: [],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotalPrice: () => 0,
      getTotalItems: () => 0,
      addItem: jest.fn(),
    });

    // Mock adicional de Breadcrumbs para este test
    jest.mock('@/components/ui/Breadcrumbs', () => ({
      Breadcrumbs: () => (
        <nav aria-label="breadcrumb">
          <ol>
            <li><a href="/">Inicio</a></li>
            <li aria-current="page">Carrito</li>
          </ol>
        </nav>
      ),
    }));

    const { default: CartPage } = await import('@/app/cart/page');
    const { container } = render(<CartPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
