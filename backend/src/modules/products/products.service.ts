import prisma from '../../database/prisma.js';
import { Prisma } from '@prisma/client';

export class ProductsService {
  async getAll(page: number, limit: number, categoryId?: string) {
    const skip = (page - 1) * limit;
    const where = categoryId ? { categoryId, isActive: true } : { isActive: true };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: true },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
  }) {
    return prisma.product.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { category: { name: { contains: query, mode: 'insensitive' as const } } },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
