import { Request, Response, NextFunction } from 'express';

const cleanObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip operators starting with $ or keys with dots
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = cleanObject(value);
  }
  return cleaned;
};

/**
 * Sanitizes req.body, req.query, and req.params against NoSQL query operator injection ($where, $gt, etc.)
 */
export const sanitizeNoSql = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = cleanObject(req.body);
  }
  if (req.query) {
    req.query = cleanObject(req.query);
  }
  if (req.params) {
    req.params = cleanObject(req.params);
  }
  next();
};
