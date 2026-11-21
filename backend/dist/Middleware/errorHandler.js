"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errorHandler = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    // Operational AppError
    if (err instanceof appError_1.AppError) {
        logger_1.logger.warn(`Operational Error [${err.errorCode}]: ${err.message}`, {
            statusCode: err.statusCode,
            details: err.details
        });
        (0, apiResponse_1.sendError)(res, err.message, err.statusCode, err.errorCode, err.details);
        return;
    }
    // Zod Schema Validation Error
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
        }));
        logger_1.logger.warn('Validation Error', { issues: formattedErrors });
        (0, apiResponse_1.sendError)(res, 'Validation error occurred', 422, 'VALIDATION_ERROR', formattedErrors);
        return;
    }
    // Mongoose Cast Error (Invalid ObjectId)
    if (err instanceof mongoose_1.default.Error.CastError) {
        const message = `Invalid format for resource identifier: ${err.value}`;
        (0, apiResponse_1.sendError)(res, message, 400, 'INVALID_IDENTIFIER');
        return;
    }
    // Mongoose Duplicate Key Error
    if ('code' in err && err.code === 11000) {
        (0, apiResponse_1.sendError)(res, 'Duplicate resource entry detected', 409, 'DUPLICATE_RESOURCE');
        return;
    }
    // Unhandled / Unexpected Server Errors
    logger_1.logger.error('Unhandled Server Exception:', err);
    const message = env_1.config.NODE_ENV === 'production' ? 'Internal server error occurred' : err.message;
    const details = env_1.config.NODE_ENV === 'production' ? undefined : err.stack;
    (0, apiResponse_1.sendError)(res, message, 500, 'INTERNAL_SERVER_ERROR', details);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    (0, apiResponse_1.sendError)(res, `Cannot ${req.method} ${req.originalUrl} - Route not found`, 404, 'ROUTE_NOT_FOUND');
};
exports.notFoundHandler = notFoundHandler;
