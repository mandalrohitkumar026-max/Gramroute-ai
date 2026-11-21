"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = exports.getCookieOptions = exports.hashToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const ACCESS_TOKEN_SECRET = env_1.config.JWT_SECRET;
const REFRESH_TOKEN_SECRET = `${env_1.config.JWT_SECRET}_refresh_salt`;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
/**
 * Sign a short-lived access token (15 mins)
 */
const signAccessToken = (payload) => {
    const options = {
        expiresIn: ACCESS_TOKEN_EXPIRY
    };
    return jsonwebtoken_1.default.sign(payload, ACCESS_TOKEN_SECRET, options);
};
exports.signAccessToken = signAccessToken;
/**
 * Sign a long-lived refresh token (7 days)
 */
const signRefreshToken = (payload) => {
    const options = {
        expiresIn: REFRESH_TOKEN_EXPIRY
    };
    return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, options);
};
exports.signRefreshToken = signRefreshToken;
/**
 * Verify an access token
 */
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify a refresh token
 */
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Hash a token (SHA-256) for secure storage in database
 */
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
/**
 * Standard cookie configuration for HTTP-only cookies
 */
const getCookieOptions = (maxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
    const isProduction = env_1.config.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: maxAgeMs,
        path: '/'
    };
};
exports.getCookieOptions = getCookieOptions;
/**
 * Set auth cookies on response
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
    // Access token cookie (15m)
    res.cookie('accessToken', accessToken, (0, exports.getCookieOptions)(15 * 60 * 1000));
    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, (0, exports.getCookieOptions)(7 * 24 * 60 * 60 * 1000));
};
exports.setAuthCookies = setAuthCookies;
/**
 * Clear auth cookies on response
 */
const clearAuthCookies = (res) => {
    const options = (0, exports.getCookieOptions)(0);
    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
};
exports.clearAuthCookies = clearAuthCookies;
