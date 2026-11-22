import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiResponse.error('TOO_MANY_REQUESTS', 'Too many authentication attempts. Please try again after 15 minutes.'),
  skip: () => process.env.NODE_ENV === 'test'
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiResponse.error('TOO_MANY_REQUESTS', 'Rate limit exceeded. Please slow down.'),
  skip: () => process.env.NODE_ENV === 'test'
});
