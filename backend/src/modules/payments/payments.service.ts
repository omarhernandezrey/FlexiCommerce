import prisma from '../../database/prisma.js';

export class PaymentsService {
  async create(data: { orderId: string; amount: number; method: string }) {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        method: data.method as any,
        status: 'PENDING',
      },
    });
  }

  async getByOrder(orderId: string) {
    return prisma.payment.findUnique({ where: { orderId } });
  }
}
