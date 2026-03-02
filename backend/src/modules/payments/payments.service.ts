import prisma from '../../database/prisma.js';

export class PaymentsService {
  async create(data: {
    orderId: string;
    amount: number;
    method: string;
    transactionId?: string;
  }) {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        method: data.method as any,
        status: 'PENDING',
        transactionId: data.transactionId ?? null,
      },
    });
  }

  async getByOrder(orderId: string) {
    return prisma.payment.findUnique({ where: { orderId } });
  }

  async updateByTransactionId(
    transactionId: string,
    status: 'COMPLETED' | 'FAILED' | 'REFUNDED',
  ) {
    return prisma.payment.updateMany({
      where: { transactionId },
      data: { status },
    });
  }

  async updateByOrderId(
    orderId: string,
    data: { status?: string; transactionId?: string },
  ) {
    return prisma.payment.update({
      where: { orderId },
      data: data as any,
    });
  }
}
