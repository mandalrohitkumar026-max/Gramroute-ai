import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Response, CookieOptions } from 'express';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  email?: string;
  phoneNumber?: string;
}

const ACCESS_TOKEN_SECRET = config.JWT_SECRET;
const REFRESH_TOKEN_SECRET = `${config.JWT_SECRET}_refresh_salt`;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Sign a short-lived access token (15 mins)
 */
export const signAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY
  };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

/**
 * Sign a long-lived refresh token (7 days)
 */
export const signRefreshToken = (payload: { userId: string }): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY
  };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
};

/**
 * Hash a token (SHA-256) for secure storage in database
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Standard cookie configuration for HTTP-only cookies
 */
export const getCookieOptions = (maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): CookieOptions => {
  const isProduction = config.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: maxAgeMs,
    path: '/'
  };
};

/**
 * Set auth cookies on response
 */
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  // Access token cookie (15m)
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
  // Refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
};

/**
 * Clear auth cookies on response
 */
export const clearAuthCookies = (res: Response): void => {
  const options = getCookieOptions(0);
  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
};
