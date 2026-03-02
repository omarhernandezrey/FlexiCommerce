import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Capture unexpected 500 errors in Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
};
