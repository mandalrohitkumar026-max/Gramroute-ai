"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    errorCode;
    isOperational;
    details;
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errorCode = 'BAD_REQUEST', details) {
        return new AppError(message, 400, errorCode, details);
    }
    static unauthorized(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
        return new AppError(message, 401, errorCode);
    }
    static forbidden(message = 'Forbidden action', errorCode = 'FORBIDDEN') {
        return new AppError(message, 403, errorCode);
    }
    static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        return new AppError(message, 404, errorCode);
    }
    static conflict(message, errorCode = 'CONFLICT', details) {
        return new AppError(message, 409, errorCode, details);
    }
    static unprocessable(message, details) {
        return new AppError(message, 422, 'UNPROCESSABLE_ENTITY', details);
    }
    static internal(message = 'Internal server error', details) {
        return new AppError(message, 500, 'INTERNAL_SERVER_ERROR', details);
    }
}
exports.AppError = AppError;
