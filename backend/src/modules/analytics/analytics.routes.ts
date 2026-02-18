import { Router, Request, Response } from 'express';
import { verifyToken } from '../../middlewares/auth';
import { AnalyticsService } from './analytics.service.js';

const router = Router();

// Middleware para verificar que es admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Helper to get date range from query params
const getDateRange = (req: Request): { startDate: Date; endDate: Date } => {
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : new Date();

  return { startDate, endDate };
};

// Metrics endpoint
router.get('/metrics', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const metrics = await AnalyticsService.getMetrics(startDate, endDate);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching metrics',
    });
  }
});

// Daily sales endpoint
router.get('/daily-sales', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
    const dailySales = await AnalyticsService.getDailySales(startDate, endDate, limit);
    res.json(dailySales);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching daily sales',
    });
  }
});

// Top products endpoint
router.get('/top-products', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const topProducts = await AnalyticsService.getTopProducts(startDate, endDate, limit);
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching top products',
    });
  }
});

// Revenue by category endpoint
router.get('/revenue-by-category', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const revenueByCategory = await AnalyticsService.getRevenueByCategory(startDate, endDate);
    res.json(revenueByCategory);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching revenue by category',
    });
  }
});

// Customer statistics endpoint
router.get('/customer-stats', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const customerStats = await AnalyticsService.getCustomerStats(startDate, endDate);
    res.json(customerStats);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching customer stats',
    });
  }
});

// Paginated orders endpoint
router.get('/orders', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const status = req.query.status as string | undefined;

    const result = await AnalyticsService.getOrdersWithPagination(page, limit, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching orders',
    });
  }
});

// Paginated products endpoint
router.get('/products', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const result = await AnalyticsService.getProductsWithPagination(page, limit, search, category);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching products',
    });
  }
});

// Export CSV endpoint
router.get('/export-csv', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const dailySales = await AnalyticsService.getDailySales(startDate, endDate, 100);
    const metrics = await AnalyticsService.getMetrics(startDate, endDate);

    // Build CSV header
    let csv = 'Date,Sales,Orders,Average Order Value\n';

    // Add daily sales data
    dailySales.forEach((day) => {
      csv += `${day.date},${day.sales},${day.orders},${(day.sales / day.orders).toFixed(2)}\n`;
    });

    // Add summary section
    csv += '\n\nSummary Report\n';
    csv += `Total Sales,${metrics.totalSales}\n`;
    csv += `Total Orders,${metrics.totalOrders}\n`;
    csv += `Average Order Value,${metrics.averageOrderValue}\n`;
    csv += `Total Customers,${metrics.totalCustomers}\n`;
    csv += `Conversion Rate,${metrics.conversionRate}%\n`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(Buffer.from(csv, 'utf-8'));
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error exporting CSV',
    });
  }
});

// Export PDF endpoint (mock - returns a simple text as placeholder)
router.get('/export-pdf', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // En producción, usar librería como pdfkit o puppeteer
    const { startDate, endDate } = getDateRange(req);
    const metrics = await AnalyticsService.getMetrics(startDate, endDate);

    // Simple PDF structure with metrics
    const pdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 200 >>\nstream\nBT\n/F1 20 Tf\n50 750 Td\n(FlexiCommerce Analytics Report) Tj\n0 -30 Td\n/F1 12 Tf\n(Total Sales: $' +
        metrics.totalSales +
        ') Tj\n0 -20 Td\n(Total Orders: ' +
        metrics.totalOrders +
        ') Tj\n0 -20 Td\n(Customers: ' +
        metrics.totalCustomers +
        ') Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000252 00000 n\n0000000500 00000 n\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n578\n%%EOF'
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error exporting PDF',
    });
  }
});

export default router;
