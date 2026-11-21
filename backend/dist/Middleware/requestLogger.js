"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCorrelation = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
const requestCorrelation = (req, res, next) => {
    const incomingId = req.headers['x-request-id'];
    const requestId = Array.isArray(incomingId)
        ? incomingId[0]
        : incomingId || (crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    res.setHeader('X-Request-Id', requestId);
    res.locals.requestId = requestId;
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger_1.logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} [${duration}ms] - reqId: ${requestId}`);
    });
    next();
};
exports.requestCorrelation = requestCorrelation;
