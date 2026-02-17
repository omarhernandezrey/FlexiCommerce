import prisma from '../../database/prisma.js';

export class CategoriesService {
  async getAll() {
    return prisma.category.findMany({
      include: { children: true },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { children: true, products: true },
    });
  }

  async create(data: { name: string; slug: string; description?: string; parentId?: string }) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}
