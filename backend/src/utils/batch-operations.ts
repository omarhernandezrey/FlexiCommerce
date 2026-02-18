/**
 * Batch operations service for bulk API operations
 * Allows multiple operations in a single request
 */

export interface BatchOperation {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: any;
  headers?: Record<string, string>;
}

export interface BatchResponse {
  id: string;
  status: number;
  data?: any;
  error?: string;
}

export interface BatchRequest {
  operations: BatchOperation[];
  sequential?: boolean; // Execute in order, stop on first error
}

export interface BatchResult {
  results: BatchResponse[];
  successCount: number;
  errorCount: number;
  executionTimeMs: number;
}

import { Router, Request, Response } from 'express';

export class BatchOperationProcessor {
  /**
   * Process batch operations
   */
  static async processBatch(
    batchRequest: BatchRequest,
    authenticatedUserId?: string
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const results: BatchResponse[] = [];
    const operations = batchRequest.operations || [];
    const sequential = batchRequest.sequential || false;

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];

      try {
        // Validate operation
        if (!operation.path || !operation.method) {
          results.push({
            id: operation.id || `op_${i}`,
            status: 400,
            error: 'Missing required fields: path, method',
          });
          if (sequential) break;
          continue;
        }

        // Mock operation execution
        // In real implementation, this would route to actual handlers
        const response = await this.executeOperation(operation, authenticatedUserId);
        results.push({
          id: operation.id || `op_${i}`,
          status: response.status,
          data: response.data,
        });
      } catch (error) {
        results.push({
          id: operation.id || `op_${i}`,
          status: 500,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        if (sequential) break;
      }
    }

    const successCount = results.filter((r) => r.status >= 200 && r.status < 300).length;

    return {
      results,
      successCount,
      errorCount: results.length - successCount,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Execute individual operation
   */
  private static async executeOperation(
    operation: BatchOperation,
    userId?: string
  ): Promise<{ status: number; data?: any }> {
    // TODO: Route to actual endpoint handlers
    // For now, return mock response

    const { method, path } = operation;

    // Simulate different operations
    if (path.includes('/products')) {
      if (method === 'GET') {
        return { status: 200, data: { id: 'prod_1', name: 'Product Name' } };
      } else if (method === 'POST') {
        return {
          status: 201,
          data: { id: 'prod_' + Date.now(), name: operation.body?.name },
        };
      }
    }

    if (path.includes('/orders')) {
      if (method === 'GET') {
        return { status: 200, data: { id: 'order_1', total: 100 } };
      }
    }

    return { status: 200, data: { success: true } };
  }

  /**
   * Validate batch size
   */
  static validateBatchSize(operations: BatchOperation[], maxSize = 50): boolean {
    return operations.length > 0 && operations.length <= maxSize;
  }

  /**
   * Get batch status info
   */
  static getBatchInfo(result: BatchResult) {
    return {
      totalOperations: result.results.length,
      succeeded: result.successCount,
      failed: result.errorCount,
      executionTimeMs: result.executionTimeMs,
      averageTimePerOperation: Math.round(result.executionTimeMs / result.results.length),
    };
  }
}

/**
 * Create batch operations router
 */
export function createBatchRouter() {
  const router = Router();

  // POST /api/batch - Execute batch operations
  router.post('/api/batch', async (req: Request, res: Response) => {
    try {
      const batchRequest: BatchRequest = req.body;

      // Validate batch size
      if (!BatchOperationProcessor.validateBatchSize(batchRequest.operations)) {
        res.status(400).json({
          error: 'Invalid batch size. Must have 1-50 operations.',
        });
        return;
      }

      // Validate operations structure
      for (const op of batchRequest.operations) {
        if (!op.method || !op.path || !op.id) {
          res.status(400).json({
            error: 'Each operation must have id, method, and path',
          });
          return;
        }

        if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(op.method)) {
          res.status(400).json({
            error: `Invalid HTTP method: ${op.method}`,
          });
          return;
        }
      }

      // Execute batch
      const userId = (req as any).user?.id;
      const result = await BatchOperationProcessor.processBatch(batchRequest, userId);

      res.json({
        data: result,
        info: BatchOperationProcessor.getBatchInfo(result),
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Batch processing failed',
      });
    }
  });

  // GET /api/batch/info - Get batch operations documentation
  router.get('/api/batch/info', (req: Request, res: Response) => {
    res.json({
      description: 'Batch Operations API - Execute multiple operations in a single request',
      endpoint: '/api/batch',
      method: 'POST',
      maxOperationsPerBatch: 50,
      example: {
        operations: [
          {
            id: 'op1',
            method: 'GET',
            path: '/api/products/prod_123',
          },
          {
            id: 'op2',
            method: 'POST',
            path: '/api/orders',
            body: { items: [], total: 100 },
          },
        ],
        sequential: false,
      },
      responseExample: {
        data: {
          results: [
            {
              id: 'op1',
              status: 200,
              data: { id: 'prod_123', name: 'Product' },
            },
          ],
          successCount: 1,
          errorCount: 0,
          executionTimeMs: 125,
        },
        info: {
          totalOperations: 1,
          succeeded: 1,
          failed: 0,
          executionTimeMs: 125,
          averageTimePerOperation: 125,
        },
      },
    });
  });

  return router;
}
