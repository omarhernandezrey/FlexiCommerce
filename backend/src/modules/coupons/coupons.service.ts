import prisma from '../../database/prisma.js';
import { Prisma } from '@prisma/client';

export class CouponsService {
  async getAll(params?: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 50));
    const skip = (page - 1) * limit;

    const where: Prisma.CouponWhereInput = {};

    if (params?.search) {
      where.OR = [
        { code: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getByCode(code: string) {
    return prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  }

  async getById(id: string) {
    return prisma.coupon.findUnique({ where: { id } });
  }

  async create(data: {
    code: string;
    type: string;
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    expiresAt?: string;
    isActive?: boolean;
    description?: string;
  }) {
    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount ?? null,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive ?? true,
        description: data.description ?? null,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = {};
    const allowed = ['code', 'type', 'value', 'minOrderAmount', 'maxUses', 'expiresAt', 'isActive', 'description'];

    for (const key of allowed) {
      if (key in data) {
        if (key === 'code' && typeof data[key] === 'string') {
          updateData[key] = (data[key] as string).toUpperCase();
        } else if (key === 'expiresAt') {
          updateData[key] = data[key] ? new Date(data[key] as string) : null;
        } else {
          updateData[key] = data[key];
        }
      }
    }

    return prisma.coupon.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    return prisma.coupon.delete({ where: { id } });
  }

  async incrementUsage(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }

  /**
   * Valida un cupón para uso en checkout.
   * Retorna el cupón si es válido, o lanza error con mensaje descriptivo.
   */
  async validateForCheckout(code: string, orderTotal: number) {
    const coupon = await this.getByCode(code);

    if (!coupon) throw new Error('Cupón no encontrado');
    if (!coupon.isActive) throw new Error('Este cupón no está activo');
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new Error('Este cupón ha expirado');
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error('Este cupón ha alcanzado su límite de usos');
    }
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      throw new Error(`El pedido debe ser de al menos $${coupon.minOrderAmount} para usar este cupón`);
    }

    return coupon;
  }

  /**
   * Calcula el descuento real según tipo y valor del cupón.
   */
  calculateDiscount(coupon: { type: string; value: number }, orderTotal: number): number {
    if (coupon.type === 'percentage') {
      return Math.round(orderTotal * (coupon.value / 100));
    }
    return Math.min(coupon.value, orderTotal);
  }
}
