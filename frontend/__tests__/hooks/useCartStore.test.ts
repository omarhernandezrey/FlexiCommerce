import { act } from '@testing-library/react';
import { useCartStore } from '@/store/cart';

// Reset el store entre tests para evitar estado compartido
beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [] });
  });
});

const mockItem = {
  id: 'prod-1',
  name: 'Laptop Pro',
  price: 999.99,
  image: '/laptop.jpg',
  quantity: 1,
};

describe('useCartStore', () => {
  describe('addItem', () => {
    it('agrega un item nuevo al carrito', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
      });
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].name).toBe('Laptop Pro');
    });

    it('incrementa la cantidad si el item ya existe', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().addItem({ ...mockItem, quantity: 2 });
      });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it('agrega items diferentes como entradas separadas', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().addItem({ ...mockItem, id: 'prod-2', name: 'Mouse' });
      });
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('elimina el item correcto del carrito', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().addItem({ ...mockItem, id: 'prod-2', name: 'Mouse' });
        useCartStore.getState().removeItem('prod-1');
      });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('prod-2');
    });

    it('no falla si el item no existe', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().removeItem('no-existe');
      });
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('actualiza la cantidad del item', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().updateQuantity('prod-1', 5);
      });
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('elimina el item si la cantidad es 0', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().updateQuantity('prod-1', 0);
      });
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('elimina el item si la cantidad es negativa', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().updateQuantity('prod-1', -1);
      });
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('vacía completamente el carrito', () => {
      act(() => {
        useCartStore.getState().addItem(mockItem);
        useCartStore.getState().addItem({ ...mockItem, id: 'prod-2' });
        useCartStore.getState().clearCart();
      });
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('getTotalPrice', () => {
    it('calcula el precio total correctamente', () => {
      act(() => {
        useCartStore.getState().addItem({ ...mockItem, price: 10.00, quantity: 2 });
        useCartStore.getState().addItem({ ...mockItem, id: 'prod-2', price: 5.50, quantity: 3 });
      });
      const total = useCartStore.getState().getTotalPrice();
      expect(total).toBe(36.50); // 10*2 + 5.5*3
    });

    it('retorna 0 si el carrito está vacío', () => {
      expect(useCartStore.getState().getTotalPrice()).toBe(0);
    });
  });

  describe('getTotalItems', () => {
    it('cuenta el total de unidades (no productos únicos)', () => {
      act(() => {
        useCartStore.getState().addItem({ ...mockItem, quantity: 3 });
        useCartStore.getState().addItem({ ...mockItem, id: 'prod-2', quantity: 2 });
      });
      expect(useCartStore.getState().getTotalItems()).toBe(5);
    });
  });
});
