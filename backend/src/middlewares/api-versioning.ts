/**
 * API versioning middleware and utilities
 * Supports multiple API versions for backward compatibility
 */

import { Request, Response, NextFunction } from 'express';

export enum APIVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export const CURRENT_VERSION = APIVersion.V1;

/**
 * Detect API version from request
 */
export function parseAPIVersion(req: Request): APIVersion {
  // Check Accept-Version header
  const acceptVersion = req.get('Accept-Version');
  if (acceptVersion === 'v2') return APIVersion.V2;

  // Check path prefix
  if (req.path.startsWith('/api/v2/')) return APIVersion.V2;

  // Default to v1
  return APIVersion.V1;
}

/**
 * API versioning middleware
 */
export function apiVersioningMiddleware(req: Request, res: Response, next: NextFunction) {
  const version = parseAPIVersion(req);
  (req as any).apiVersion = version;

  // Add version to response headers
  res.set('API-Version', version);

  next();
}

/**
 * Version-specific handler
 */
export function withVersions(
  handlers: {
    v1?: (req: Request, res: Response) => Promise<void> | void;
    v2?: (req: Request, res: Response) => Promise<void> | void;
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = (req as any).apiVersion || parseAPIVersion(req);
      const handler = handlers[version as keyof typeof handlers];

      if (!handler) {
        return res.status(400).json({
          error: `API version ${version} not supported`,
        });
      }

      return await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Deprecation warning middleware
 */
export function deprecationWarningMiddleware(req: Request, res: Response, next: NextFunction) {
  // Mark v1 endpoints as deprecated
  if ((req as any).apiVersion === APIVersion.V1) {
    res.set('Deprecation', 'true');
    res.set('Sunset', new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString()); // 6 months
    res.set(
      'Link',
      '</api/v2/docs>; rel="successor-version"; title="API v2 Documentation"'
    );
  }

  next();
}

/**
 * Version migration guide response
 */
export function getMigrationGuide(fromVersion: APIVersion, toVersion: APIVersion) {
  const guides: Record<string, string> = {
    'v1-v2': `
      Migration Guide: API v1 to v2
      
      Breaking Changes:
      1. Endpoint paths changed from /api/resource to /api/v2/resource
      2. Response format now includes 'data' wrapper: { "data": {...} }
      3. Pagination uses 'pagination' key instead of inline metadata
      4. Error format changed: { "error": { "code": "...", "message": "..." } }
      5. Authentication header changed from 'X-API-Key' to 'Authorization: Bearer TOKEN'
      
      New Features in v2:
      - Batch operations API
      - Webhooks system
      - Real-time notifications
      - Advanced filtering and search
      - Rate limiting headers
      
      See full docs at: /api/v2/docs
    `,
  };

  return guides[`${fromVersion}-${toVersion}`] || 'No migration guide available';
}

/**
 * API documentation endpoint
 */
export function getAPIDocumentation(version: APIVersion) {
  const docs = {
    v1: {
      version: 'v1',
      status: 'Stable (Deprecated)',
      sunset: '2026-08-17',
      endpoints: [
        'GET /api/products',
        'GET /api/products/:id',
        'GET /api/orders',
        'POST /api/orders',
        'GET /api/auth/user',
      ],
      authentication: 'X-API-Key header or JWT token',
    },
    v2: {
      version: 'v2',
      status: 'Current',
      features: [
        'Batch operations',
        'Webhooks',
        'Advanced filtering',
        'Real-time updates',
        'Rate limiting',
      ],
      endpoints: [
        'GET /api/v2/products',
        'GET /api/v2/products/:id',
        'GET /api/v2/orders',
        'POST /api/v2/orders',
        'POST /api/v2/batch',
        'POST /api/v2/webhooks',
      ],
      authentication: 'Authorization: Bearer TOKEN',
      rateLimits: {
        default: '100 requests per 15 minutes',
        strict: '20 requests per hour',
      },
    },
  };

  return docs[version as keyof typeof docs];
}
