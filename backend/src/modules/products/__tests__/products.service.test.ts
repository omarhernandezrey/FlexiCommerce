import { ProductsService } from '../products.service';

// Mock Prisma (sin .js para que el moduleNameMapper lo resuelva correctamente)
jest.mock('../../../database/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import prisma from '../../../database/prisma';

const mockProduct = {
  id: 'prod-1',
  name: 'Laptop Pro',
  slug: 'laptop-pro',
  description: 'High performance laptop',
  price: 999.99,
  stock: 10,
  images: ['/laptop.jpg'],
  categoryId: 'cat-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { id: 'cat-1', name: 'Electronics' },
};

describe('ProductsService', () => {
  let productsService: ProductsService;

  beforeEach(() => {
    productsService = new ProductsService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('retorna lista paginada de productos activos', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      const result = await productsService.getAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } })
      );
    });

    it('aplica filtro por slug de categoría cuando se provee', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      await productsService.getAll(1, 10, 'cat-1');

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: { slug: 'cat-1' }, isActive: true },
        })
      );
    });
  });

  describe('getById', () => {
    it('retorna producto con categoría y reviews', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        ...mockProduct,
        reviews: [],
      });

      await productsService.getById('prod-1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: { category: true, reviews: true },
      });
    });

    it('retorna null si el producto no existe', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await productsService.getById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('hace hard delete en transacción, limpiando wishlists y reviews primero', async () => {
      const tx = {
        wishlist: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
        review: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
        product: { delete: jest.fn().mockResolvedValue(mockProduct) },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn) => fn(tx));

      const result = await productsService.remove('prod-1');

      expect(tx.wishlist.deleteMany).toHaveBeenCalledWith({ where: { productId: 'prod-1' } });
      expect(tx.review.deleteMany).toHaveBeenCalledWith({ where: { productId: 'prod-1' } });
      expect(tx.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
      expect(result).toEqual(mockProduct);
    });
  });
});
