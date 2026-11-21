"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.ApiResponse = void 0;
exports.ApiResponse = {
    success(data, message, meta) {
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
    error(code, message, details) {
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
const sendSuccess = (res, data, statusCode = 200, meta) => {
    const response = {
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
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details) => {
    const response = {
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
exports.sendError = sendError;
