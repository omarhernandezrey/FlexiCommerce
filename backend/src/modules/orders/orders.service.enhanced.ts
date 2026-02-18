/**
 * Enhanced Orders Service with validation, error handling, and batch operations
 */

import prisma from '../../database/prisma';
import { Cache, cacheKeys } from '../../utils/cache';
import { retryWithBackoff } from '../../utils/retry';

const ordersCache = new Cache(300000); // 5 min TTL

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface OrderValidationError {
  field: string;
  message: string;
}

export class OrdersServiceEnhanced {
  /**
   * Get user orders with pagination
   */
  async getByUser(userId: string, page: number = 1, limit: number = 10) {
    const cacheKey = cacheKeys.orders(userId, page);

    return ordersCache.getOrCompute(cacheKey, async () => {
      const skip = (page - 1) * limit;

      try {
        const [data, total] = await Promise.all([
          retryWithBackoff(() =>
            prisma.order.findMany({
              where: { userId },
              include: {
                items: { include: { product: true } },
                payment: true,
              },
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            })
          ),
          retryWithBackoff(() => prisma.order.count({ where: { userId } })),
        ]);

        return {
          data: data.map((order: any) => ({
            ...order,
            itemCount: order.items.length,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch user orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Get order by ID
   */
  async getById(id: string) {
    const cacheKey = cacheKeys.order(id);

    return ordersCache.getOrCompute(cacheKey, async () => {
      try {
        const order = await retryWithBackoff(() =>
          prisma.order.findUnique({
            where: { id },
            include: {
              items: {
                include: {
                  product: { include: { category: true } },
                },
              },
              payment: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          })
        );

        if (!order) {
          throw new Error('Pedido no encontrado');
        }

        return {
          ...order,
          summary: {
            itemCount: order.items.length,
            subtotal: order.items.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0),
            tax: (Number(order.total) * 0.16) || 0, // Assuming 16% tax
            total: order.total,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Create order with validation
   */
  async create(userId: string, items: OrderItemInput[], _shippingAddress?: any) {
    const errors: OrderValidationError[] = [];

    // Validate input
    if (!userId?.trim()) errors.push({ field: 'userId', message: 'ID de usuario requerido' });
    if (!Array.isArray(items) || items.length === 0) {
      errors.push({ field: 'items', message: 'Al menos 1 producto requerido' });
    } else {
      items.forEach((item, idx) => {
        if (!item.productId?.trim()) {
          errors.push({ field: `items[${idx}].productId`, message: 'ID de producto requerido' });
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          errors.push({ field: `items[${idx}].quantity`, message: 'Cantidad debe ser 1 o mayor' });
        }
      });
    }

    if (errors.length > 0) {
      const errorMsg = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`Validation error: ${errorMsg}`);
    }

    try {
      // Fetch products with retry
      const products = await retryWithBackoff(() =>
        prisma.product.findMany({
          where: { id: { in: items.map((i) => i.productId) } },
        })
      );

      // Validate all products exist
      const missingIds = items
        .map((item) => item.productId)
        .filter((id) => !products.find((p: any) => p.id === id));

      if (missingIds.length > 0) {
        throw new Error(`Productos no encontrados: ${missingIds.join(', ')}`);
      }

      // Validate stock
      const insufficientStock = items.filter((item) => {
        const product = products.find((p: any) => p.id === item.productId);
        return product && product.stock < item.quantity;
      });

      if (insufficientStock.length > 0) {
        throw new Error(`Stock insuficiente para: ${insufficientStock.map((i) => i.productId).join(', ')}`);
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => {
        const product = products.find((p: any) => p.id === item.productId)!;
        return sum + Number(product.price) * item.quantity;
      }, 0);

      // Create order
      const order = await retryWithBackoff(() =>
        prisma.order.create({
          data: {
            userId,
            total,
            status: 'PENDING' as any,
            items: {
              create: items.map((item) => {
                const product = products.find((p: any) => p.id === item.productId)!;
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  price: Number(product.price),
                };
              }),
            },
          },
          include: {
            items: { include: { product: true } },
          },
        })
      );

      // Reduce product stock
      await Promise.all(
        items.map((item) =>
          retryWithBackoff(() =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        )
      );

      // Invalidate cache
      ordersCache.delete(cacheKeys.orders(userId, 1));

      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update order status with validation
   */
  async updateStatus(id: string, status: string) {
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    try {
      const order = await retryWithBackoff(() =>
        prisma.order.update({
          where: { id },
          data: { status: status as any },
          include: { items: true },
        })
      );

      // Invalidate cache
      ordersCache.delete(cacheKeys.order(id));

      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel order with refund logic
   */
  async cancel(id: string) {
    try {
      const order = await retryWithBackoff(() =>
        prisma.order.findUnique({
          where: { id },
          include: { items: true },
        })
      );

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
        throw new Error(`No se puede cancelar pedido con estado ${order.status}`);
      }

      // Update order status
      const updated = await retryWithBackoff(() =>
        prisma.order.update({
          where: { id },
          data: { status: 'CANCELLED' },
        })
      );

      // Restore stock
      await Promise.all(
        order.items.map((item) =>
          retryWithBackoff(() =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          )
        )
      );

      // Invalidate cache
      ordersCache.delete(cacheKeys.order(id));

      return updated;
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get orders by status
   */
  async getByStatus(status: string, limit: number = 50) {
    try {
      return await retryWithBackoff(() =>
        prisma.order.findMany({
          where: { status: status as any },
          include: { items: true, user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
      );
    } catch (error) {
      throw new Error(`Failed to fetch orders by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get order statistics
   */
  async getStats(startDate?: Date, endDate?: Date) {
    try {
      const where = {
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { ...(startDate && { gte: startDate }), lte: endDate } }),
      };

      const [totalOrders, totalRevenue, byStatus] = await Promise.all([
        retryWithBackoff(() => prisma.order.count({ where })),
        retryWithBackoff(() =>
          prisma.order.aggregate({
            where,
            _sum: { total: true },
          })
        ),
        retryWithBackoff(() =>
          prisma.order.groupBy({
            by: ['status'],
            where,
            _count: true,
          })
        ),
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        byStatus: Object.fromEntries(byStatus.map((s: any) => [s.status, s._count])),
      };
    } catch (error) {
      throw new Error(`Failed to fetch order statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    ordersCache.clear();
  }
}

export default new OrdersServiceEnhanced();
