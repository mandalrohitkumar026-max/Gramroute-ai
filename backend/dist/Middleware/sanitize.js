"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeNoSql = void 0;
const cleanObject = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(cleanObject);
    }
    const cleaned = {};
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
const sanitizeNoSql = (req, _res, next) => {
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
exports.sanitizeNoSql = sanitizeNoSql;
