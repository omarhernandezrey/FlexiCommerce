import prisma from '../../database/prisma.js';

export class ReviewsService {
  async getByProduct(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);
    return { reviews, total, page, limit };
  }

  async getStats(productId: string) {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    for (const r of reviews) {
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
    }
    return { count, average: Math.round(average * 10) / 10, distribution };
  }

  async checkUserReview(productId: string, userId: string) {
    const review = await prisma.review.findFirst({
      where: { productId, userId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    return { has_review: !!review, review: review ?? null };
  }

  async create(userId: string, data: { productId: string; rating: number; comment?: string }) {
    return prisma.review.create({
      data: { userId, ...data },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async update(id: string, userId: string, data: { rating?: number; comment?: string }) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      throw new Error('No tienes permisos para editar esta reseña');
    }
    return prisma.review.update({
      where: { id },
      data,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
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
