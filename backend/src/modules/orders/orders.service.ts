import prisma from '../../database/prisma.js';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderOptions {
  shippingAddress?: object;
  shippingMethod?: string;
  shippingCost?: number;
  discount?: number;
  currency?: string;
}

export class OrdersService {
  async getAll() {
    return prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { email: true, firstName: true, lastName: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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

  async create(
    userId: string,
    items: OrderItemInput[],
    options: CreateOrderOptions = {},
  ) {
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    // Validar existencia y stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`);
      }
    }

    const itemsTotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const shippingCost = options.shippingCost ?? 0;
    // El descuento se aplica al subtotal antes de calcular el IVA
    const discount = Math.min(options.discount ?? 0, itemsTotal);
    const taxableAmount = itemsTotal - discount;
    const tax = taxableAmount * 0.19;
    const total = taxableAmount + shippingCost + tax;

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        shippingAddress: options.shippingAddress ?? undefined,
        shippingMethod: options.shippingMethod ?? 'standard',
        shippingCost,
        currency: options.currency ?? 'COP',
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
      include: { items: { include: { product: true } } },
    });

    // Reducir stock de cada producto
    await Promise.all(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    return order;
  }

  private static VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

  private static ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  async updateStatus(id: string, status: string) {
    const upperStatus = status.toUpperCase();
    if (!OrdersService.VALID_STATUSES.includes(upperStatus as any)) {
      throw new Error(`Estado inválido: ${status}. Valores válidos: ${OrdersService.VALID_STATUSES.join(', ')}`);
    }

    const current = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!current) throw new Error('Orden no encontrada');

    const allowed = OrdersService.ALLOWED_TRANSITIONS[current.status] || [];
    if (!allowed.includes(upperStatus)) {
      throw new Error(`No se puede cambiar de ${current.status} a ${upperStatus}. Transiciones permitidas: ${allowed.join(', ') || 'ninguna'}`);
    }

    return prisma.order.update({
      where: { id },
      data: { status: upperStatus as any },
      include: { items: { include: { product: true } }, payment: true, user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }
}
