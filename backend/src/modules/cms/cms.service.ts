import prisma from '../../database/prisma.js';

export class CmsService {
  async getAll() {
    return prisma.cmsPage.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBySlug(slug: string) {
    return prisma.cmsPage.findUnique({ where: { slug } });
  }

  async create(data: { title: string; slug: string; content: string; isPublished?: boolean }) {
    return prisma.cmsPage.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.cmsPage.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.cmsPage.delete({ where: { id } });
  }
}
