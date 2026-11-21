"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const apiResponse_1 = require("../utils/apiResponse");
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: apiResponse_1.ApiResponse.error('TOO_MANY_REQUESTS', 'Too many authentication attempts. Please try again after 15 minutes.'),
    skip: () => process.env.NODE_ENV === 'test'
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: apiResponse_1.ApiResponse.error('TOO_MANY_REQUESTS', 'Rate limit exceeded. Please slow down.'),
    skip: () => process.env.NODE_ENV === 'test'
});
