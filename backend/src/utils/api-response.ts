/**
 * Standardized API Response utilities
 * Ensures consistent response format across all endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path?: string;
}

export class ApiResponseBuilder {
  /**
   * Build success response
   */
  static success<T>(
    data: T | null,
    message: string = 'Operación exitosa',
    status: number = 200,
    path?: string
  ): ApiResponse<T> {
    return {
      success: true,
      status,
      message,
      data: data === null || data === undefined ? undefined : data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Build error response
   */
  static error(
    message: string = 'Error interno del servidor',
    status: number = 500,
    error?: string,
    path?: string
  ): ApiResponse {
    return {
      success: false,
      status,
      message,
      error: error || message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Build paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
    },
    message: string = 'Datos obtenidos exitosamente',
    status: number = 200,
    path?: string
  ): ApiResponse<{ items: T[]; pagination: typeof pagination }> {
    return {
      success: true,
      status,
      message,
      data: {
        items: data,
        pagination,
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Build validation error response
   */
  static validationError(
    errors: { field: string; message: string }[],
    message: string = 'Error de validación',
    status: number = 400,
    path?: string
  ): ApiResponse {
    return {
      success: false,
      status,
      message,
      error: JSON.stringify(errors),
      timestamp: new Date().toISOString(),
      path,
    };
  }
}

/**
 * Express response helpers
 */
export function respondSuccess(res: any, data: any = null, message: string = 'Operación exitosa', status: number = 200) {
  const response = ApiResponseBuilder.success(data, message, status, res.req?.originalUrl);
  return res.status(status).json(response);
}

export function respondError(res: any, message: string = 'Error interno', status: number = 500, error?: string) {
  const response = ApiResponseBuilder.error(message, status, error, res.req?.originalUrl);
  return res.status(status).json(response);
}

export function respondPaginated(
  res: any,
  data: any[],
  pagination: any,
  message: string = 'Datos obtenidos',
  status: number = 200
) {
  const response = ApiResponseBuilder.paginated(data, pagination, message, status, res.req?.originalUrl);
  return res.status(status).json(response);
}

export function respondValidationError(res: any, errors: any[], message: string = 'Error de validación', status: number = 400) {
  const response = ApiResponseBuilder.validationError(errors, message, status, res.req?.originalUrl);
  return res.status(status).json(response);
}
