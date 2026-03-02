// Mock AsyncStorage before imports
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useCartStore } from '../../store/cart';

const mockItem = {
  id: 'item-1',
  productId: 'prod-1',
  name: 'Laptop Pro',
  price: 999.99,
  quantity: 1,
  image: '/laptop.jpg',
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], total: 0 });
  });

  describe('addItem', () => {
    it('agrega un item nuevo al carrito', () => {
      useCartStore.getState().addItem(mockItem);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('prod-1');
    });

    it('incrementa la cantidad si el producto ya está en el carrito', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem({ ...mockItem, quantity: 2 });
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });
  });

  describe('removeItem', () => {
    it('elimina un item del carrito', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().removeItem('prod-1');
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('actualiza la cantidad de un item', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('prod-1', 5);
      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
    });

    it('elimina el item si la cantidad es 0', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('prod-1', 0);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('vacía todo el carrito', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem({ ...mockItem, productId: 'prod-2', id: 'item-2' });
      useCartStore.getState().clearCart();
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(total).toBe(0);
    });
  });

  describe('getTotal', () => {
    it('calcula el total correctamente', () => {
      useCartStore.getState().addItem({ ...mockItem, price: 100, quantity: 2 });
      useCartStore.getState().addItem({
        ...mockItem,
        id: 'item-2',
        productId: 'prod-2',
        price: 50,
        quantity: 3,
      });
      const total = useCartStore.getState().getTotal();
      expect(total).toBe(350); // 100*2 + 50*3
    });
  });
});
