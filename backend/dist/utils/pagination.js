"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateResult = exports.parsePagination = void 0;
const parsePagination = (query) => {
    const page = Math.max(1, parseInt(String(query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
    const skip = (page - 1) * limit;
    const sortBy = String(query.sortBy || 'createdAt');
    const sortOrder = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    return {
        page,
        limit,
        skip,
        sort: { [sortBy]: sortOrder }
    };
};
exports.parsePagination = parsePagination;
const paginateResult = (items, total, page, limit) => {
    const totalPages = Math.ceil(total / limit) || 1;
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};
exports.paginateResult = paginateResult;
