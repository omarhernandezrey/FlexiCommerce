import { prisma } from '../../database/prisma.js';
import { OrderStatus, Prisma } from '@prisma/client';

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
}

export interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

export interface ProductSales {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  trend: number;
}

export class AnalyticsService {
  /**
   * Get sales metrics for a date range
   */
  static async getMetrics(startDate: Date, endDate: Date): Promise<SalesMetrics> {
    try {
      // Get total sales and order count
      const orderStats = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          total: true,
        },
        _count: true,
      });

      const totalSales = Number(orderStats._sum.total || 0);
      const totalOrders = orderStats._count;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Get unique customers in this period
      const uniqueCustomers = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });

      const totalCustomers = uniqueCustomers.length;

      // Calculate conversion rate (orders from unique visitors)
      // In a real system, this would need visitor tracking
      const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

      return {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalCustomers,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      throw error;
    }
  }

  /**
   * Get daily sales data
   */
  static async getDailySales(startDate: Date, endDate: Date, limit = 30): Promise<DailySales[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true,
          total: true,
        },
      });

      // Group by date
      const dailyMap = new Map<string, { sales: number; orders: number }>();

      orders.forEach((order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        const existing = dailyMap.get(date) || { sales: 0, orders: 0 };
        dailyMap.set(date, {
          sales: existing.sales + Number(order.total),
          orders: existing.orders + 1,
        });
      });

      // Convert to array and limit results
      const result = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          sales: Math.round(data.sales * 100) / 100,
          orders: data.orders,
        }))
        .slice(-limit);

      return result;
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      throw error;
    }
  }

  /**
   * Get top products by sales
   */
  static async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit = 10
  ): Promise<ProductSales[]> {
    try {
      const orderItems = await prisma.orderItem.findMany({
        where: {
          productId: { not: null },
          order: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        include: {
          product: { select: { name: true } },
          order: { select: { createdAt: true } },
        },
      });

      // Group by product and calculate stats
      const productMap = new Map<string, any>();

      orderItems.forEach((item: any) => {
        const productId = item.productId;
        if (!productId) return; // producto eliminado (SetNull)
        const existing = productMap.get(productId) || {
          productId,
          productName: item.product?.name || item.productName || `Producto ${productId.substring(0, 8)}`,
          unitsSold: 0,
          revenue: 0,
          prices: [],
        };

        existing.unitsSold += item.quantity;
        existing.revenue += item.price * item.quantity;
        existing.prices.push(item.price);

        productMap.set(productId, existing);
      });

      // Calculate trends and convert to results
      const result = Array.from(productMap.values())
        .map((item: any) => {
          return {
            productId: item.productId,
            productName: item.productName,
            unitsSold: item.unitsSold,
            revenue: Math.round(item.revenue * 100) / 100,
            trend: 0, // Will calculate from previous period in enhanced version
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

      return result;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }

  /**
   * Get orders with pagination
   */
  static async getOrdersWithPagination(
    page = 1,
    limit = 10,
    status?: string
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.OrderWhereInput = status
        ? { status: status as OrderStatus }
        : {};

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      return {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching orders with pagination:', error);
      throw error;
    }
  }

  /**
   * Get products with pagination and search
   */
  static async getProductsWithPagination(
    page = 1,
    limit = 10,
    search?: string,
    category?: string
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.ProductWhereInput = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ];
      }

      if (category) {
        where.categoryId = category;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching products with pagination:', error);
      throw error;
    }
  }

  /**
   * Get revenue by category
   */
  static async getRevenueByCategory(startDate: Date, endDate: Date) {
    try {
      const result = await prisma.$queryRaw`
        SELECT
          c.name as category,
          COUNT(DISTINCT o.id)::int as "orderCount",
          COALESCE(SUM(oi.quantity), 0)::int as "totalUnits",
          COALESCE(SUM(oi.price * oi.quantity), 0)::float as revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE o.created_at >= ${startDate}
        AND o.created_at <= ${endDate}
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
      `;

      return result;
    } catch (error) {
      console.error('Error fetching revenue by category:', error);
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(startDate: Date, endDate: Date) {
    try {
      const stats = await prisma.$queryRaw`
        SELECT
          COUNT(DISTINCT u.id)::int as "totalCustomers",
          COUNT(DISTINCT CASE WHEN o.created_at >= ${startDate} THEN o.user_id END)::int as "newCustomers",
          COALESCE(AVG(oc.cnt), 0)::float as "avgOrdersPerCustomer",
          COALESCE(MAX(oc.cnt), 0)::int as "maxOrdersPerCustomer"
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*)::int as cnt
          FROM orders
          WHERE created_at >= ${startDate}
          AND created_at <= ${endDate}
          GROUP BY user_id
        ) oc ON u.id = oc.user_id
      `;

      return (stats as any[])[0] || {};
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }
}
