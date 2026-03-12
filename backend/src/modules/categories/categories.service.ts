import prisma from '../../database/prisma.js';

export class CategoriesService {
  async getAll() {
    return prisma.category.findMany({
      include: {
        children: {
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: { _count: { select: { products: true } } },
        },
        products: true,
        _count: { select: { products: true } },
      },
    });
  }

  async create(data: { name: string; slug: string; description?: string; image?: string; parentId?: string; isActive?: boolean }) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    // Verificar productos asociados
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new Error(`No se puede eliminar: la categoría tiene ${productCount} producto(s) asociado(s). Reasígnalos primero.`);
    }

    // Reasignar subcategorías huérfanas a raíz
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    return prisma.category.delete({ where: { id } });
  }
}
