"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnershipOrAdmin = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const appError_1 = require("../utils/appError");
const User_1 = require("../models/User");
/**
 * Middleware to authenticate requests via Bearer token or HttpOnly cookie
 */
const authenticate = async (req, _res, next) => {
    try {
        let token;
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            throw new appError_1.AppError('Authentication required. No access token provided.', 401, 'UNAUTHORIZED');
        }
        // Verify token
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        // Verify user exists and is active
        const user = await User_1.User.findOne({ _id: decoded.userId, isDeleted: false });
        if (!user) {
            throw new appError_1.AppError('User belonging to this token no longer exists.', 401, 'USER_NOT_FOUND');
        }
        if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
            throw new appError_1.AppError(`Your account is ${user.status.toLowerCase()}. Contact support.`, 403, 'ACCOUNT_DISABLED');
        }
        if (user.isLocked()) {
            throw new appError_1.AppError('Account is temporarily locked due to failed login attempts. Try again later.', 403, 'ACCOUNT_LOCKED');
        }
        req.user = {
            id: user._id.toString(),
            role: user.role,
            phoneNumber: user.phoneNumber,
            email: user.email
        };
        req.userDoc = user;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new appError_1.AppError('Token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED'));
        }
        else if (error.name === 'JsonWebTokenError') {
            next(new appError_1.AppError('Invalid access token.', 401, 'INVALID_TOKEN'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
/**
 * Role-Based Access Control (RBAC) middleware
 */
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new appError_1.AppError('Authentication required before authorization check.', 401, 'UNAUTHORIZED'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new appError_1.AppError(`Access denied. Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`, 403, 'FORBIDDEN'));
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Helper to ensure a user only accesses their own resource unless they are ADMIN
 */
const requireOwnershipOrAdmin = (getOwnerId) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new appError_1.AppError('Authentication required.', 401, 'UNAUTHORIZED'));
        }
        if (req.user.role === 'ADMIN') {
            return next(); // Admins bypass ownership checks
        }
        const ownerId = getOwnerId(req);
        if (!ownerId || ownerId !== req.user.id) {
            return next(new appError_1.AppError('Forbidden: You do not have permission to access or modify this resource.', 403, 'FORBIDDEN'));
        }
        next();
    };
};
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
