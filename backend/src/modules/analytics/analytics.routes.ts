import { Router, Request, Response } from 'express';
import { verifyToken } from '../../middlewares/auth';
import { AnalyticsService } from './analytics.service.js';

const router = Router();

// Middleware para verificar que es admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
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

const formatCOPPlain = (n: number): string =>
  '$ ' + Math.round(n).toLocaleString('es-CO');

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

// Export CSV endpoint — incluye resumen + ventas diarias + top products
router.get('/export-csv', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const [dailySales, metrics, topProducts] = await Promise.all([
      AnalyticsService.getDailySales(startDate, endDate, 100),
      AnalyticsService.getMetrics(startDate, endDate),
      AnalyticsService.getTopProducts(startDate, endDate, 20),
    ]);

    let csv = '\uFEFF'; // BOM para Excel

    // Resumen
    csv += 'REPORTE ANALYTICS - FLEXICOMMERCE\n';
    csv += `Periodo,"${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}"\n\n`;
    csv += 'RESUMEN GENERAL\n';
    csv += `Ventas Totales,"${formatCOPPlain(metrics.totalSales)}"\n`;
    csv += `Total Ordenes,${metrics.totalOrders}\n`;
    csv += `Ticket Promedio,"${formatCOPPlain(metrics.averageOrderValue)}"\n`;
    csv += `Clientes Unicos,${metrics.totalCustomers}\n`;
    csv += `Ordenes por Cliente,${(metrics.conversionRate / 100).toFixed(1)}\n`;

    // Ventas diarias
    csv += '\nVENTAS DIARIAS\n';
    csv += 'Fecha,Ventas,Ordenes,Ticket Promedio\n';
    dailySales.forEach((day) => {
      const avg = day.orders > 0 ? (day.sales / day.orders) : 0;
      csv += `${day.date},"${formatCOPPlain(day.sales)}",${day.orders},"${formatCOPPlain(avg)}"\n`;
    });

    // Top Products
    csv += '\nPRODUCTOS MAS VENDIDOS\n';
    csv += 'Posicion,Producto,Unidades Vendidas,Ingresos\n';
    topProducts.forEach((p, idx) => {
      csv += `${idx + 1},"${p.productName}",${p.unitsSold},"${formatCOPPlain(p.revenue)}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(Buffer.from(csv, 'utf-8'));
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error exporting CSV',
    });
  }
});

// Export PDF — genera texto plano formateado como reporte descargable
router.get('/export-pdf', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const [metrics, topProducts, dailySales] = await Promise.all([
      AnalyticsService.getMetrics(startDate, endDate),
      AnalyticsService.getTopProducts(startDate, endDate, 10),
      AnalyticsService.getDailySales(startDate, endDate, 30),
    ]);

    const sep = '='.repeat(60);
    const lines: string[] = [];

    lines.push(sep);
    lines.push('         FLEXICOMMERCE - REPORTE DE ANALYTICS');
    lines.push(sep);
    lines.push(`Periodo: ${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`);
    lines.push(`Generado: ${new Date().toLocaleString('es-CO')}`);
    lines.push('');

    lines.push('-'.repeat(60));
    lines.push('  RESUMEN GENERAL');
    lines.push('-'.repeat(60));
    lines.push(`  Ventas Totales:      ${formatCOPPlain(metrics.totalSales)}`);
    lines.push(`  Total Ordenes:       ${metrics.totalOrders}`);
    lines.push(`  Ticket Promedio:     ${formatCOPPlain(metrics.averageOrderValue)}`);
    lines.push(`  Clientes Unicos:     ${metrics.totalCustomers}`);
    lines.push(`  Ordenes por Cliente: ${(metrics.conversionRate / 100).toFixed(1)}`);
    lines.push('');

    if (topProducts.length > 0) {
      lines.push('-'.repeat(60));
      lines.push('  PRODUCTOS MAS VENDIDOS');
      lines.push('-'.repeat(60));
      topProducts.forEach((p, i) => {
        lines.push(`  ${(i + 1).toString().padStart(2)}. ${p.productName}`);
        lines.push(`      ${p.unitsSold} uds vendidas — ${formatCOPPlain(p.revenue)}`);
      });
      lines.push('');
    }

    if (dailySales.length > 0) {
      lines.push('-'.repeat(60));
      lines.push('  VENTAS DIARIAS (ultimos registros)');
      lines.push('-'.repeat(60));
      dailySales.slice(-10).forEach((d) => {
        lines.push(`  ${d.date}  |  ${formatCOPPlain(d.sales).padStart(15)}  |  ${d.orders} ordenes`);
      });
      lines.push('');
    }

    lines.push(sep);
    lines.push('  Reporte generado automaticamente por FlexiCommerce');
    lines.push(sep);

    const content = lines.join('\n');

    // Enviar como texto plano con extensión .txt (alternativa honesta al PDF dummy)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.txt`);
    res.send(Buffer.from(content, 'utf-8'));
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error exporting report',
    });
  }
});

export default router;
