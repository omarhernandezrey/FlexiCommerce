import prisma from '../../database/prisma.js';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
};

export class UsersService {
  async getAll() {
    return prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string }) {
    return prisma.user.update({ where: { id }, data, select: userSelect });
  }
}
