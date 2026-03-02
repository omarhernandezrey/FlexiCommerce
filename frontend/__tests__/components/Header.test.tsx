import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

// Mock MaterialIcon para evitar ruido en el texto
jest.mock('@/components/ui/MaterialIcon', () => ({
  MaterialIcon: () => null,
}));

// Mock hooks
jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    getTotalItems: () => 3,
    items: [],
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getTotalPrice: () => 0,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock('@/hooks/useAuthAPI', () => ({
  useAuthAPI: () => ({ logout: jest.fn() }),
}));

describe('Header', () => {
  it('renderiza el logo de FlexiCommerce con link a /', () => {
    render(<Header />);
    // El logo es "Flexi" + <span>"Commerce"</span> — buscar el link al home
    const logoLink = screen.getByRole('link', { name: /flexi/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('muestra el badge del carrito con la cantidad de ítems', () => {
    render(<Header />);
    // El badge debe mostrar 3 (del mock getTotalItems: () => 3)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renderiza el input de búsqueda', () => {
    render(<Header />);
    const searchInput = screen.getByLabelText('Buscar productos');
    expect(searchInput).toBeInTheDocument();
  });

  it('el input de búsqueda actualiza su valor al escribir', () => {
    render(<Header />);
    const searchInput = screen.getByLabelText('Buscar productos') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'laptop' } });
    expect(searchInput.value).toBe('laptop');
  });

  it('tiene el skip-to-content link de accesibilidad', () => {
    render(<Header />);
    const skipLink = screen.getByText('Ir al contenido principal');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.closest('a')).toHaveAttribute('href', '#main-content');
  });

  it('el botón del menú móvil tiene aria-label', () => {
    render(<Header />);
    const menuBtn = screen.getByLabelText(/Abrir menú de navegación/i);
    expect(menuBtn).toBeInTheDocument();
  });
});
