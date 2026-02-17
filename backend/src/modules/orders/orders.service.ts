import prisma from '../../database/prisma.js';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export class OrdersService {
  async getByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, payment: true },
    });
  }

  async create(userId: string, items: OrderItemInput[]) {
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
      return sum + Number(product.price) * item.quantity;
    }, 0);

    return prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: Number(product.price),
            };
          }),
        },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
