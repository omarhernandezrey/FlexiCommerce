import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middlewares/errorHandler.js';
import { httpLogger } from './middlewares/logger.js';

// Importar rutas
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import cmsRoutes from './modules/cms/cms.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import recommendationsRoutes from './modules/recommendations/recommendations.routes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app: Express = express();

// HTTP request logging
app.use(httpLogger);

// Middlewares de seguridad
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.NODE_ENV === 'development' ? true : (process.env.CORS_ORIGIN || 'http://localhost:3000'),
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  try {
    const openapiPath = path.join(__dirname, '..', '..', '..', 'openapi.yaml');
    const swaggerDocument = yaml.load(fs.readFileSync(openapiPath, 'utf8')) as Record<string, unknown>;
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'FlexiCommerce API Docs',
      swaggerOptions: {
        persistAuthorization: true,
      },
    }));
  } catch {
    console.warn('⚠️  No se pudo cargar openapi.yaml para Swagger UI');
  }
}

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: '🚀 FlexiCommerce Backend',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      payments: '/api/payments',
      reviews: '/api/reviews',
      cms: '/api/cms',
      analytics: '/api/analytics',
      wishlist: '/api/wishlist',
      health: '/api/health',
      docs: process.env.NODE_ENV !== 'production' ? '/api/docs' : 'disabled in production',
    },
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
    message: 'Backend is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;
