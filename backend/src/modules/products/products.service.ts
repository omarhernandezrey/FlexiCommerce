import prisma from '../../database/prisma.js';
import { Prisma } from '@prisma/client';

export class ProductsService {
  async getAll(
    page: number,
    limit: number,
    categoryId?: string,
    adminMode = false,
    status?: 'active' | 'inactive' | 'all',
    stockFilter?: 'in' | 'low' | 'out',
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    search?: string,
  ) {
    const safePage = Math.min(10000, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1));
    const maxLimit = adminMode ? 10000 : 100;
    const safeLimit = Math.min(maxLimit, Math.max(1, Number.isFinite(limit) ? Math.floor(limit) : 10));
    const skip = (safePage - 1) * safeLimit;
    const where: Prisma.ProductWhereInput = {};

    // Filtro isActive
    if (!adminMode) {
      // Público: solo activos, siempre
      where.isActive = true;
    } else {
      // Admin: por defecto muestra solo activos salvo que pida explícitamente otro estado
      if (!status || status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
      // status === 'all' → sin filtro
    }

    if (categoryId) where.category = { slug: categoryId };

    if (stockFilter === 'out') where.stock = 0;
    else if (stockFilter === 'low') where.stock = { gt: 0, lte: 10 };
    else if (stockFilter === 'in') where.stock = { gt: 10 };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const validSortFields: Record<string, boolean> = {
      name: true, price: true, stock: true, createdAt: true, updatedAt: true,
    };
    const orderField = validSortFields[sortBy] ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: safeLimit,
        include: { category: true },
        orderBy: { [orderField]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: true },
    });
  }

  async create(data: {
    name: string; slug: string; description: string;
    price: number; stock: number; images: string[];
    categoryId: string; isActive?: boolean;
  }) {
    return prisma.product.create({ data, include: { category: true } });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  /**
   * Eliminar producto — siempre hard delete.
   * OrderItem.productId queda NULL por onDelete: SetNull (preserva historial de órdenes).
   */
  async remove(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.wishlist.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  }

  async toggleStatus(id: string) {
    const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
    if (!product) throw new Error('Producto no encontrado');
    return prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: { category: true },
    });
  }

  async duplicate(id: string) {
    const original = await prisma.product.findUnique({ where: { id } });
    if (!original) throw new Error('Producto no encontrado');

    const timestamp = Date.now().toString(36);
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = original;

    return prisma.product.create({
      data: { ...rest, name: `${original.name} (Copia)`, slug: `${original.slug}-copia-${timestamp}`, isActive: false },
      include: { category: true },
    });
  }

  /**
   * Eliminar masivo — siempre hard delete.
   * OrderItem.productId queda NULL por onDelete: SetNull.
   */
  async bulkDelete(ids: string[]) {
    if (ids.length === 0) return { count: 0 };
    let deletedCount = 0;
    await prisma.$transaction(async (tx) => {
      await tx.wishlist.deleteMany({ where: { productId: { in: ids } } });
      await tx.review.deleteMany({ where: { productId: { in: ids } } });
      const result = await tx.product.deleteMany({ where: { id: { in: ids } } });
      deletedCount = result.count;
    });
    return { count: deletedCount };
  }

  async bulkToggleStatus(ids: string[], isActive: boolean) {
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
    return { count: result.count };
  }

  /**
   * Purgar definitivamente TODOS los productos inactivos.
   * OrderItem.productId queda NULL por onDelete: SetNull.
   */
  async purgeInactive() {
    const inactive = await prisma.product.findMany({
      where: { isActive: false },
      select: { id: true },
    });
    const ids = inactive.map((p) => p.id);
    if (ids.length === 0) return { purged: 0 };

    await prisma.$transaction(async (tx) => {
      await tx.wishlist.deleteMany({ where: { productId: { in: ids } } });
      await tx.review.deleteMany({ where: { productId: { in: ids } } });
      await tx.product.deleteMany({ where: { id: { in: ids } } });
    });

    return { purged: ids.length };
  }

  async getStats() {
    const [total, active, inactive, outOfStock, lowStock] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
      prisma.product.count({ where: { stock: 0, isActive: true } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 }, isActive: true } }),
    ]);
    // Valor total del inventario: precio × stock de productos activos
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: { price: true, stock: true },
    });
    const totalValue = activeProducts.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
    return { total, active, inactive, outOfStock, lowStock, totalValue };
  }

  async search(query: string, page = 1, limit = 10) {
    const safePage = Math.min(10000, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1));
    const safeLimit = Math.min(100, Math.max(1, Number.isFinite(limit) ? Math.floor(limit) : 10));
    const skip = (safePage - 1) * safeLimit;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ],
    };
    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: safeLimit, include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);
    return { data, pagination: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) } };
  }
}
