import prisma from '../../database/prisma.js';

export class ReviewsService {
  async getByProduct(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, data: { productId: string; rating: number; comment?: string }) {
    return prisma.review.create({
      data: { userId, ...data },
    });
  }

  async remove(id: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      throw new Error('No tienes permisos para eliminar esta reseña');
    }
    return prisma.review.delete({ where: { id } });
  }
}
