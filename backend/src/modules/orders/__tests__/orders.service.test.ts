import { OrdersService } from '../orders.service';

// Mock Prisma (sin .js para que el moduleNameMapper lo resuelva correctamente)
jest.mock('../../../database/prisma', () => ({
  __esModule: true,
  default: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  },
}));

import prisma from '../../../database/prisma';

const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  status: 'pending',
  total: 1999.98,
  createdAt: new Date(),
  items: [
    { productId: 'prod-1', quantity: 2, price: 999.99 },
  ],
};

const mockProducts = [
  { id: 'prod-1', price: 999.99 },
  { id: 'prod-2', price: 499.99 },
];

describe('OrdersService', () => {
  let ordersService: OrdersService;

  beforeEach(() => {
    ordersService = new OrdersService();
    jest.clearAllMocks();
  });

  describe('getByUser', () => {
    it('retorna solo las órdenes del usuario autenticado', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      const result = await ordersService.getByUser('user-1');

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } })
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('retorna la orden con items y payment', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        payment: null,
      });

      await ordersService.getById('order-1');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: { items: { include: { product: true } }, payment: true },
      });
    });
  });

  describe('create', () => {
    it('calcula el total correctamente basado en precios del producto', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const items = [
        { productId: 'prod-1', quantity: 2 }, // 999.99 * 2 = 1999.98
        { productId: 'prod-2', quantity: 1 }, // 499.99 * 1 = 499.99
      ];

      await ordersService.create('user-1', items);

      const expectedTotal = 999.99 * 2 + 499.99 * 1;
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: expectedTotal,
            userId: 'user-1',
          }),
        })
      );
    });

    it('lanza error si un producto del pedido no existe', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'prod-1', price: 999.99 },
      ]);

      const items = [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'no-existe', quantity: 1 },
      ];

      await expect(ordersService.create('user-1', items)).rejects.toThrow(
        'Producto no-existe no encontrado'
      );
    });
  });

  describe('updateStatus', () => {
    it('actualiza el estado de la orden', async () => {
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'shipped',
      });

      await ordersService.updateStatus('order-1', 'shipped');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'shipped' },
      });
    });
  });
});
