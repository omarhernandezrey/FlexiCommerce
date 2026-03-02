import { renderHook, act } from '@testing-library/react';
import { useOrders } from '@/hooks/useOrders';

// Mock completo de api.service para evitar llamadas HTTP reales
jest.mock('@/lib/api.service', () => ({
  ordersAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

// Importar después del mock para obtener las versiones mockeadas
import { ordersAPI } from '@/lib/api.service';

const mockOrdersAPI = ordersAPI as jest.Mocked<typeof ordersAPI>;

const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  items: [{ productId: 'prod-1', quantity: 2, price: 50.0 }],
  total: 100.0,
  status: 'pending' as const,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tiene estado inicial correcto', () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.orders).toEqual([]);
    expect(result.current.currentOrder).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('fetchAll', () => {
    it('carga las órdenes del usuario correctamente', async () => {
      mockOrdersAPI.getAll.mockResolvedValueOnce({
        data: { data: [mockOrder] },
      } as any);

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await result.current.fetchAll();
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].id).toBe('order-1');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('maneja errores de API sin crash', async () => {
      mockOrdersAPI.getAll.mockRejectedValueOnce(new Error('Error de red'));

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        try {
          await result.current.fetchAll();
        } catch {
          // error esperado
        }
      });

      expect(result.current.error).toBe('Error de red');
      expect(result.current.loading).toBe(false);
      expect(result.current.orders).toEqual([]);
    });

    it('llama a la API con los parámetros correctos', async () => {
      mockOrdersAPI.getAll.mockResolvedValueOnce({
        data: { data: [] },
      } as any);

      const { result } = renderHook(() => useOrders());
      const params = { page: 1, limit: 10 };

      await act(async () => {
        await result.current.fetchAll(params);
      });

      expect(mockOrdersAPI.getAll).toHaveBeenCalledWith(params);
    });
  });

  describe('fetchById', () => {
    it('carga una orden por ID correctamente', async () => {
      mockOrdersAPI.getById.mockResolvedValueOnce({
        data: { data: mockOrder },
      } as any);

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await result.current.fetchById('order-1');
      });

      expect(result.current.currentOrder?.id).toBe('order-1');
      expect(result.current.loading).toBe(false);
    });

    it('almacena el error si la orden no existe', async () => {
      mockOrdersAPI.getById.mockRejectedValueOnce(new Error('Order not found'));

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        try {
          await result.current.fetchById('no-existe');
        } catch {
          // error esperado
        }
      });

      expect(result.current.error).toBe('Order not found');
    });
  });

  describe('create', () => {
    it('crea una orden y la guarda en currentOrder', async () => {
      const newOrder = { ...mockOrder, id: 'order-new' };
      mockOrdersAPI.create.mockResolvedValueOnce({
        data: { data: newOrder },
      } as any);

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await result.current.create({ total: 100, status: 'pending' });
      });

      expect(result.current.currentOrder?.id).toBe('order-new');
      expect(result.current.loading).toBe(false);
    });
  });
});
