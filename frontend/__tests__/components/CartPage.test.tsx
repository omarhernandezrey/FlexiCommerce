import { render, screen, fireEvent } from '@testing-library/react';
import CartPage from '@/app/cart/page';
import { formatCOP } from '@/lib/format';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/navigation (CartPage usa useRouter)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/cart',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock useAuth (CartPage muestra CTA de login si no hay usuario)
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

// Mock de Breadcrumbs para simplificar
jest.mock('@/components/ui/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav aria-label="breadcrumb" />,
}));

// Mock de MaterialIcon
jest.mock('@/components/ui/MaterialIcon', () => ({
  MaterialIcon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

const mockRemoveItem = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockClearCart = jest.fn();

const mockCartItems = [
  {
    id: 'prod-1',
    name: 'Laptop Pro 15"',
    price: 999.99,
    image: '/laptop.jpg',
    quantity: 2,
  },
  {
    id: 'prod-2',
    name: 'Mouse Inalámbrico',
    price: 29.99,
    image: '/mouse.jpg',
    quantity: 1,
  },
];

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    items: mockCartItems,
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
    getTotalPrice: () => 2029.97, // 999.99*2 + 29.99
    getTotalItems: () => 3,
    addItem: jest.fn(),
  }),
}));

describe('CartPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los items del carrito', () => {
    render(<CartPage />);
    expect(screen.getByText('Laptop Pro 15"')).toBeInTheDocument();
    expect(screen.getByText('Mouse Inalámbrico')).toBeInTheDocument();
  });

  it('muestra el total calculado correctamente', () => {
    render(<CartPage />);
    // subtotal = 2029.97, envío gratis → total = subtotal, formateado como COP.
    // Intl usa espacios no separables (NBSP); testing-library normaliza el DOM
    // a espacio común, así que el esperado también se normaliza.
    // (aparece en Subtotal y Total, por eso getAllByText)
    const expected = formatCOP(2029.97).replace(/\s/g, ' ');
    expect(screen.getAllByText(expected).length).toBeGreaterThanOrEqual(1);
  });

  it('el botón de eliminar llama a removeItem con el id correcto', () => {
    render(<CartPage />);
    const deleteButtons = screen.getAllByTestId('icon-delete');
    fireEvent.click(deleteButtons[0].closest('button')!);
    expect(mockRemoveItem).toHaveBeenCalledWith('prod-1');
  });

  it('el botón "+" incrementa la cantidad', () => {
    render(<CartPage />);
    const addButtons = screen.getAllByTestId('icon-add');
    fireEvent.click(addButtons[0].closest('button')!);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 3);
  });

  it('el botón "-" decrementa la cantidad (mínimo 1)', () => {
    render(<CartPage />);
    const removeButtons = screen.getAllByTestId('icon-remove');
    // El primer item tiene quantity=2, debería reducirse a 1
    fireEvent.click(removeButtons[0].closest('button')!);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 1);
  });

  it('muestra el número de artículos en el header', () => {
    render(<CartPage />);
    expect(screen.getByText('2 artículos en tu carrito')).toBeInTheDocument();
  });
});

describe('CartPage — carrito vacío', () => {
  beforeEach(() => {
    jest.spyOn(require('@/hooks/useCart'), 'useCart').mockReturnValue({
      items: [],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotalPrice: () => 0,
      getTotalItems: () => 0,
      addItem: jest.fn(),
    });
  });

  it('muestra "0 artículos" cuando el carrito está vacío', () => {
    render(<CartPage />);
    expect(screen.getByText('0 artículos en tu carrito')).toBeInTheDocument();
  });
});
