import { prisma } from '../../database/prisma.js';

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

      const totalSales = orderStats._sum.total || 0;
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
          sales: existing.sales + order.total,
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
          order: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        include: {
          order: {
            select: {
              createdAt: true,
            },
          },
        },
      });

      // Group by product and calculate stats
      const productMap = new Map<string, any>();

      orderItems.forEach((item: any) => {
        const productId = item.productId;
        const existing = productMap.get(productId) || {
          productId,
          productName: `Product ${productId.substring(0, 8)}`,
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
          const avgPrice = item.prices.length > 0
            ? item.prices.reduce((a: number, b: number) => a + b, 0) / item.prices.length
            : 0;

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

      const where = status ? { status } : {};

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

      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
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
          COUNT(DISTINCT o.id) as orderCount,
          SUM(oi.quantity) as totalUnits,
          SUM(oi.price * oi.quantity) as revenue
        FROM "Order" o
        JOIN "OrderItem" oi ON o.id = oi.orderId
        JOIN "Product" p ON oi.productId = p.id
        JOIN "Category" c ON p.categoryId = c.id
        WHERE o."createdAt" >= ${startDate}
        AND o."createdAt" <= ${endDate}
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
          COUNT(DISTINCT u.id) as totalCustomers,
          COUNT(DISTINCT CASE WHEN o."createdAt" >= ${startDate} THEN o."userId" END) as newCustomers,
          AVG(orderCounts.count) as avgOrdersPerCustomer,
          MAX(orderCounts.count) as maxOrdersPerCustomer
        FROM "User" u
        LEFT JOIN "Order" o ON u.id = o."userId"
        LEFT JOIN (
          SELECT "userId", COUNT(*) as count
          FROM "Order"
          WHERE "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
          GROUP BY "userId"
        ) orderCounts ON u.id = orderCounts."userId"
      `;

      return stats[0] || {};
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }
}
