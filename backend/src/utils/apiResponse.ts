import { Response } from 'express';

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export const ApiResponse = {
  success<T>(data?: T, message?: string, meta?: Record<string, unknown>): IApiResponse<T> {
    return {
      success: true,
      ...(message ? { message } : {}),
      ...(data !== undefined ? { data } : {}),
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  },

  error(code: string, message: string, details?: unknown): IApiResponse<null> {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {})
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
};

export type ApiResponse<T = any> = IApiResponse<T>;

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: IApiResponse<T>['meta']
): Response => {
  const response: IApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(res.locals.requestId ? { requestId: res.locals.requestId } : {}),
      ...meta
    }
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
): Response => {
  const response: IApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(res.locals.requestId ? { requestId: res.locals.requestId } : {})
    }
  };
  return res.status(statusCode).json(response);
};
