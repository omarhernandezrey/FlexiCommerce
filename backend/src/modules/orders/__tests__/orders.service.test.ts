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
      update: jest.fn(),
    },
  },
}));

import prisma from '../../../database/prisma';

const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  status: 'PENDING',
  total: 1999.98,
  createdAt: new Date(),
  items: [
    { productId: 'prod-1', quantity: 2, price: 999.99 },
  ],
};

const mockProducts = [
  { id: 'prod-1', name: 'Laptop Pro', price: 999.99, stock: 10 },
  { id: 'prod-2', name: 'Mouse', price: 499.99, stock: 10 },
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
    it('calcula el total con IVA (19%) basado en precios del producto y descuenta stock', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.product.update as jest.Mock).mockResolvedValue({});

      const items = [
        { productId: 'prod-1', quantity: 2 }, // 999.99 * 2 = 1999.98
        { productId: 'prod-2', quantity: 1 }, // 499.99 * 1 = 499.99
      ];

      await ordersService.create('user-1', items);

      const itemsTotal = 999.99 * 2 + 499.99 * 1;
      const expectedTotal = itemsTotal + itemsTotal * 0.19; // subtotal + IVA 19%
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: expectedTotal,
            userId: 'user-1',
          }),
        })
      );

      // Descuenta stock de cada producto del pedido
      expect(prisma.product.update).toHaveBeenCalledTimes(2);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { decrement: 2 } },
      });
    });

    it('lanza error si un producto del pedido no existe', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'prod-1', name: 'Laptop Pro', price: 999.99, stock: 10 },
      ]);

      const items = [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'no-existe', quantity: 1 },
      ];

      await expect(ordersService.create('user-1', items)).rejects.toThrow(
        'Producto no-existe no encontrado'
      );
    });

    it('lanza error si no hay stock suficiente', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'prod-1', name: 'Laptop Pro', price: 999.99, stock: 1 },
      ]);

      const items = [{ productId: 'prod-1', quantity: 5 }];

      await expect(ordersService.create('user-1', items)).rejects.toThrow(
        'Stock insuficiente'
      );
    });
  });

  describe('updateStatus', () => {
    it('actualiza el estado cuando la transición es válida (PENDING → PROCESSING)', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({ status: 'PENDING' });
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      });

      await ordersService.updateStatus('order-1', 'processing');

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
          data: { status: 'PROCESSING' },
        })
      );
    });

    it('rechaza transiciones inválidas (PENDING → SHIPPED)', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({ status: 'PENDING' });

      await expect(ordersService.updateStatus('order-1', 'shipped')).rejects.toThrow(
        'No se puede cambiar de PENDING a SHIPPED'
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('rechaza estados inválidos', async () => {
      await expect(ordersService.updateStatus('order-1', 'volando')).rejects.toThrow(
        'Estado inválido'
      );
    });
  });
});
