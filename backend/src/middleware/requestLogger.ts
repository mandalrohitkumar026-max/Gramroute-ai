import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export const requestCorrelation = (req: Request, res: Response, next: NextFunction): void => {
  const incomingId = req.headers['x-request-id'];
  const requestId = Array.isArray(incomingId)
    ? incomingId[0]
    : incomingId || (crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  res.setHeader('X-Request-Id', requestId);
  res.locals.requestId = requestId;

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} [${duration}ms] - reqId: ${requestId}`);
  });

  next();
};
