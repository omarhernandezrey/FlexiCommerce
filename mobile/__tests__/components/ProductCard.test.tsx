import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '../../components/ProductCard';

const mockProduct = {
  id: 'prod-1',
  name: 'Laptop Pro 15"',
  price: 999.99,
  image: 'https://example.com/laptop.jpg',
  avgRating: 4.5,
  reviewCount: 128,
};

describe('ProductCard', () => {
  it('muestra el nombre del producto', () => {
    const { getByText } = render(<ProductCard product={mockProduct} />);
    expect(getByText('Laptop Pro 15"')).toBeTruthy();
  });

  it('muestra el precio formateado', () => {
    const { getByText } = render(<ProductCard product={mockProduct} />);
    expect(getByText('$999.99')).toBeTruthy();
  });

  it('muestra el rating del producto', () => {
    const { getByText } = render(<ProductCard product={mockProduct} />);
    expect(getByText(/4.5/)).toBeTruthy();
  });

  it('llama a onPress cuando se hace tap', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <ProductCard product={mockProduct} onPress={mockPress} />
    );
    fireEvent.press(getByText('Laptop Pro 15"'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('muestra placeholder cuando no hay imagen', () => {
    const productWithoutImage = { ...mockProduct, image: undefined };
    const { getByText } = render(<ProductCard product={productWithoutImage} />);
    expect(getByText('No Image')).toBeTruthy();
  });
});
