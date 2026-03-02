import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/products/ProductCard';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock hooks
jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: jest.fn(),
    items: [],
    getTotalItems: () => 0,
    getTotalPrice: () => 0,
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
  }),
}));

jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  }),
}));

const mockProduct = {
  id: 'prod-1',
  name: 'Laptop Pro 15"',
  price: 1299.99,
  originalPrice: 1499.99,
  image: '/images/laptop.jpg',
  category: 'Electronics',
  rating: 4.5,
  reviews: 128,
  badge: 'New',
  description: 'A powerful laptop for professionals.',
  stock: 10,
};

describe('ProductCard', () => {
  it('renderiza el nombre del producto', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getAllByText('Laptop Pro 15"').length).toBeGreaterThan(0);
  });

  it('renderiza el precio actual', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$1299.99')).toBeInTheDocument();
  });

  it('renderiza el precio original tachado', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$1499.99')).toBeInTheDocument();
  });

  it('renderiza el badge del producto', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('el botón "Agregar al carrito" llama a addItem', () => {
    const addItem = jest.fn();
    jest.spyOn(require('@/hooks/useCart'), 'useCart').mockReturnValue({
      addItem,
      items: [],
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    });

    render(<ProductCard product={mockProduct} />);
    const addBtn = screen.getByTitle('Agregar al carrito');
    fireEvent.click(addBtn);
    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'prod-1', name: 'Laptop Pro 15"' })
    );
  });

  it('el link del producto apunta a /products/[id]', () => {
    render(<ProductCard product={mockProduct} />);
    const links = screen.getAllByRole('link');
    const productLinks = links.filter((l) => l.getAttribute('href') === '/products/prod-1');
    expect(productLinks.length).toBeGreaterThan(0);
  });
});
