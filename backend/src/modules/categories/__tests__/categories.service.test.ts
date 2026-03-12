import { CategoriesService } from '../categories.service';

jest.mock('../../../database/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
  },
}));

import prisma from '../../../database/prisma';

const mockCategory = {
  id: 'cat-1',
  name: 'Electrónica',
  slug: 'electronica',
  description: 'Dispositivos electrónicos',
  image: null,
  parentId: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  children: [],
  _count: { products: 5 },
};

const mockChild = {
  id: 'cat-2',
  name: 'Celulares',
  slug: 'celulares',
  description: null,
  image: null,
  parentId: 'cat-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { products: 3 },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(() => {
    service = new CategoriesService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('retorna categorías raíz con children y _count', async () => {
      const catWithChildren = { ...mockCategory, children: [mockChild] };
      (prisma.category.findMany as jest.Mock).mockResolvedValue([catWithChildren]);

      const result = await service.getAll();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: {
          children: { include: { _count: { select: { products: true } } } },
          _count: { select: { products: true } },
        },
        where: { parentId: null },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('retorna categoría con children, products y _count', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.getById('cat-1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: {
          children: { include: { _count: { select: { products: true } } } },
          products: true,
          _count: { select: { products: true } },
        },
      });
      expect(result).toEqual(mockCategory);
    });

    it('retorna null si no existe', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.getById('no-existe');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('crea una categoría nueva', async () => {
      const data = { name: 'Nueva', slug: 'nueva', description: 'Test' };
      (prisma.category.create as jest.Mock).mockResolvedValue({ id: 'new-1', ...data });

      const result = await service.create(data);

      expect(prisma.category.create).toHaveBeenCalledWith({ data });
      expect(result.name).toBe('Nueva');
    });
  });

  describe('update', () => {
    it('actualiza campos de la categoría', async () => {
      const data = { name: 'Actualizada' };
      (prisma.category.update as jest.Mock).mockResolvedValue({ ...mockCategory, ...data });

      const result = await service.update('cat-1', data);

      expect(prisma.category.update).toHaveBeenCalledWith({ where: { id: 'cat-1' }, data });
      expect(result.name).toBe('Actualizada');
    });
  });

  describe('remove', () => {
    it('elimina categoría sin productos', async () => {
      (prisma.product.count as jest.Mock).mockResolvedValue(0);
      (prisma.category.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.remove('cat-1');

      expect(prisma.product.count).toHaveBeenCalledWith({ where: { categoryId: 'cat-1' } });
      expect(prisma.category.updateMany).toHaveBeenCalledWith({
        where: { parentId: 'cat-1' },
        data: { parentId: null },
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
      expect(result).toEqual(mockCategory);
    });

    it('lanza error si tiene productos asociados', async () => {
      (prisma.product.count as jest.Mock).mockResolvedValue(3);

      await expect(service.remove('cat-1')).rejects.toThrow(
        'No se puede eliminar: la categoría tiene 3 producto(s) asociado(s)'
      );
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('reasigna subcategorías antes de eliminar', async () => {
      (prisma.product.count as jest.Mock).mockResolvedValue(0);
      (prisma.category.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory);

      await service.remove('cat-1');

      expect(prisma.category.updateMany).toHaveBeenCalledWith({
        where: { parentId: 'cat-1' },
        data: { parentId: null },
      });
    });
  });
});
