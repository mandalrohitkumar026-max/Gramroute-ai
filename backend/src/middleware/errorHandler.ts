import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Operational AppError
  if (err instanceof AppError) {
    logger.warn(`Operational Error [${err.errorCode}]: ${err.message}`, {
      statusCode: err.statusCode,
      details: err.details
    });
    sendError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // Zod Schema Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    logger.warn('Validation Error', { issues: formattedErrors });
    sendError(res, 'Validation error occurred', 422, 'VALIDATION_ERROR', formattedErrors);
    return;
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    const message = `Invalid format for resource identifier: ${err.value}`;
    sendError(res, message, 400, 'INVALID_IDENTIFIER');
    return;
  }

  // Mongoose Duplicate Key Error
  if ('code' in err && (err as { code: number }).code === 11000) {
    sendError(res, 'Duplicate resource entry detected', 409, 'DUPLICATE_RESOURCE');
    return;
  }

  // Unhandled / Unexpected Server Errors
  logger.error('Unhandled Server Exception:', err);
  const message = config.NODE_ENV === 'production' ? 'Internal server error occurred' : err.message;
  const details = config.NODE_ENV === 'production' ? undefined : err.stack;

  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR', details);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Cannot ${req.method} ${req.originalUrl} - Route not found`, 404, 'ROUTE_NOT_FOUND');
};
