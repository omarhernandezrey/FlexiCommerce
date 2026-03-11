import bcrypt from 'bcrypt';
import prisma from '../../database/prisma.js';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatar: true,
  role: true,
  isActive: true,
  createdAt: true,
};

interface AddressInput {
  label?: string;
  firstName: string;
  lastName?: string;
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export class UsersService {
  async getAll() {
    return prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string }) {
    return prisma.user.update({ where: { id }, data, select: userSelect });
  }

  async updateAvatar(id: string, avatarDataUrl: string) {
    return prisma.user.update({ where: { id }, data: { avatar: avatarDataUrl }, select: userSelect });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('Usuario no encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error('Contraseña actual incorrecta');

    if (newPassword.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    return { success: true };
  }

  async getStats(id: string) {
    const [orderAgg, reviewCount, deliveredCount] = await Promise.all([
      prisma.order.aggregate({
        where: { userId: id },
        _count: { id: true },
        _sum: { total: true },
      }),
      prisma.review.count({ where: { userId: id } }),
      prisma.order.count({ where: { userId: id, status: 'DELIVERED' } }),
    ]);

    const totalSpent = Number(orderAgg._sum.total) || 0;
    const totalOrders = orderAgg._count.id;
    const points = Math.floor(totalSpent / 1000);

    // Loyalty tiers based on total spent (COP)
    let loyaltyLevel = 'Bronce';
    let loyaltyNext: string | null = 'Plata';
    let loyaltyProgress = 0;
    let loyaltyNextThreshold = 100000;

    if (totalSpent >= 5000000) {
      loyaltyLevel = 'Diamante';
      loyaltyNext = null;
      loyaltyProgress = 100;
      loyaltyNextThreshold = 0;
    } else if (totalSpent >= 2000000) {
      loyaltyLevel = 'Platino';
      loyaltyNext = 'Diamante';
      loyaltyProgress = Math.round(((totalSpent - 2000000) / 3000000) * 100);
      loyaltyNextThreshold = 5000000;
    } else if (totalSpent >= 500000) {
      loyaltyLevel = 'Oro';
      loyaltyNext = 'Platino';
      loyaltyProgress = Math.round(((totalSpent - 500000) / 1500000) * 100);
      loyaltyNextThreshold = 2000000;
    } else if (totalSpent >= 100000) {
      loyaltyLevel = 'Plata';
      loyaltyNext = 'Oro';
      loyaltyProgress = Math.round(((totalSpent - 100000) / 400000) * 100);
      loyaltyNextThreshold = 500000;
    } else {
      loyaltyLevel = 'Bronce';
      loyaltyNext = 'Plata';
      loyaltyProgress = Math.round((totalSpent / 100000) * 100);
      loyaltyNextThreshold = 100000;
    }

    return {
      totalOrders,
      deliveredOrders: deliveredCount,
      totalSpent,
      reviewCount,
      points,
      loyaltyLevel,
      loyaltyNext,
      loyaltyProgress: Math.min(100, loyaltyProgress),
      loyaltyNextThreshold,
    };
  }

  // ── Addresses ──────────────────────────────────────────────────────────────

  async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, data: AddressInput) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...data, userId } });
  }

  async updateAddress(userId: string, addressId: string, data: Partial<AddressInput>) {
    const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) throw new Error('Dirección no encontrada');
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.update({ where: { id: addressId }, data });
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) throw new Error('Dirección no encontrada');
    return prisma.address.delete({ where: { id: addressId } });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) throw new Error('Dirección no encontrada');
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return prisma.address.update({ where: { id: addressId }, data: { isDefault: true } });
  }
}
