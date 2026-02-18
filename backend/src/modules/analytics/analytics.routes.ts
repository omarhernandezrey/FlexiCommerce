import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth';

const router = Router();

// Middleware para verificar que es admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Metrics endpoint
router.get('/metrics', verifyToken, requireAdmin, (req, res) => {
  try {
    // Mock data - En producción, calcular desde base de datos
    res.json({
      totalSales: 15234.50,
      totalOrders: 342,
      averageOrderValue: 44.55,
      totalCustomers: 1205,
      conversionRate: 3.2,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching metrics',
    });
  }
});

// Daily sales endpoint
router.get('/daily-sales', verifyToken, requireAdmin, (req, res) => {
  try {
    // Generate last 30 days of mock data
    const dailySales = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailySales.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 2000) + 500,
        orders: Math.floor(Math.random() * 50) + 10,
      });
    }
    res.json(dailySales);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching daily sales',
    });
  }
});

// Top products endpoint
router.get('/top-products', verifyToken, requireAdmin, (req, res) => {
  try {
    const topProducts = [
      {
        productId: 'prod_001',
        productName: 'Laptop Pro',
        unitsSold: 152,
        revenue: 45600.00,
        trend: 12.5,
      },
      {
        productId: 'prod_002',
        productName: 'Wireless Headphones',
        unitsSold: 340,
        revenue: 8500.00,
        trend: -5.2,
      },
      {
        productId: 'prod_003',
        productName: 'USB-C Cable Pack',
        unitsSold: 820,
        revenue: 4920.00,
        trend: 8.3,
      },
      {
        productId: 'prod_004',
        productName: 'Phone Stand',
        unitsSold: 560,
        revenue: 2800.00,
        trend: 3.1,
      },
      {
        productId: 'prod_005',
        productName: 'Screen Protector',
        unitsSold: 1240,
        revenue: 3720.00,
        trend: -2.8,
      },
      {
        productId: 'prod_006',
        productName: 'Power Bank',
        unitsSold: 670,
        revenue: 9030.00,
        trend: 15.7,
      },
      {
        productId: 'prod_007',
        productName: 'Keyboard',
        unitsSold: 245,
        revenue: 7350.00,
        trend: 6.2,
      },
      {
        productId: 'prod_008',
        productName: 'Mouse Pad',
        unitsSold: 890,
        revenue: 2670.00,
        trend: -0.5,
      },
      {
        productId: 'prod_009',
        productName: 'Monitor Arm',
        unitsSold: 180,
        revenue: 5400.00,
        trend: 11.3,
      },
      {
        productId: 'prod_010',
        productName: 'Desk Lamp',
        unitsSold: 420,
        revenue: 6300.00,
        trend: 7.9,
      },
    ];

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error fetching top products',
    });
  }
});

// Export CSV endpoint
router.get('/export-csv', verifyToken, requireAdmin, (req, res) => {
  try {
    const csv = `Date,Sales,Orders,Revenue Per Order
2026-02-10,1250,28,44.64
2026-02-11,1890,42,45.00
2026-02-12,1450,33,43.94
2026-02-13,2100,48,43.75
2026-02-14,1680,39,43.08
2026-02-15,1920,44,43.64
2026-02-16,2340,53,44.15
2026-02-17,1750,40,43.75`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error exporting CSV',
    });
  }
});

// Export PDF endpoint (mock - returns a simple text as placeholder)
router.get('/export-pdf', verifyToken, requireAdmin, (req, res) => {
  try {
    // En producción, usar librería como pdfkit
    const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n50 750 Td\n(FlexiCommerce Analytics Report) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000252 00000 n\n0000000346 00000 n\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n425\n%%EOF');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error exporting PDF',
    });
  }
});

export default router;
