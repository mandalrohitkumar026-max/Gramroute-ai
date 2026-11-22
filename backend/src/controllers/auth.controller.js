"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.getMe = exports.refreshTokens = exports.logout = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const Profile_1 = require("../models/Profile");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const jwt_1 = require("../utils/jwt");
/**
 * Register a new user and generate base profile
 */
const register = async (req, res, next) => {
    try {
        const { phoneNumber, email, password, role, fullName, preferredLanguage } = req.body;
        // Check if phone or email already registered
        const existingUser = await User_1.User.findOne({
            $or: [{ phoneNumber }, ...(email ? [{ email }] : [])],
            isDeleted: false
        });
        if (existingUser) {
            if (existingUser.phoneNumber === phoneNumber) {
                throw new appError_1.AppError('Phone number is already registered.', 409, 'PHONE_ALREADY_EXISTS');
            }
            if (email && existingUser.email === email) {
                throw new appError_1.AppError('Email address is already registered.', 409, 'EMAIL_ALREADY_EXISTS');
            }
        }
        // Create user
        const user = await User_1.User.create({
            phoneNumber,
            email,
            passwordHash: password, // Pre-save hook will hash this
            role,
            status: 'ACTIVE', // Auto-active for demonstration & development
            preferredLanguage: preferredLanguage || 'en'
        });
        // Create initial profile
        const profile = await Profile_1.Profile.create({
            userId: user._id,
            fullName,
            businessName: role === 'BUSINESS' ? fullName : undefined,
            operatorName: role === 'TRANSPORTER' ? fullName : undefined,
            address: {
                villageOrTown: 'Dindori',
                district: 'Nashik',
                state: 'Maharashtra',
                pincode: '422001',
                country: 'India'
            },
            location: {
                type: 'Point',
                coordinates: [73.8344, 20.0063]
            },
            isOnboardingComplete: false
        });
        // Generate tokens
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: user._id.toString(),
            role: user.role,
            phoneNumber: user.phoneNumber,
            email: user.email
        });
        const rawRefreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id.toString() });
        const tokenHash = (0, jwt_1.hashToken)(rawRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        user.refreshTokens.push({
            tokenHash,
            expiresAt,
            createdAt: new Date(),
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
        await user.save();
        (0, jwt_1.setAuthCookies)(res, accessToken, rawRefreshToken);
        res.status(201).json(apiResponse_1.ApiResponse.success({
            user,
            profile,
            accessToken,
            refreshToken: rawRefreshToken
        }, 'Registration successful'));
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
/**
 * Login user with identifier (phone or email) and password
 */
const login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;
        // Search by phone or email, including passwordHash
        const user = await User_1.User.findOne({
            $or: [{ phoneNumber: identifier }, { email: identifier.toLowerCase() }],
            isDeleted: false
        }).select('+passwordHash');
        if (!user) {
            throw new appError_1.AppError('Invalid credentials.', 401, 'INVALID_CREDENTIALS');
        }
        if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
            throw new appError_1.AppError(`Account is ${user.status.toLowerCase()}. Contact support.`, 403, 'ACCOUNT_DISABLED');
        }
        // Check account lockout
        if (user.isLocked()) {
            const waitMinutes = user.lockUntil ? Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000) : 15;
            throw new appError_1.AppError(`Account locked due to excessive failed attempts. Try again in ${waitMinutes} minutes.`, 429, 'ACCOUNT_LOCKED');
        }
        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await user.incrementLoginAttempts();
            throw new appError_1.AppError('Invalid credentials.', 401, 'INVALID_CREDENTIALS');
        }
        // Reset login attempts on successful login
        await user.resetLoginAttempts();
        user.lastLoginAt = new Date();
        // Clean expired refresh tokens
        const now = new Date();
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.expiresAt > now);
        // Sign new tokens
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: user._id.toString(),
            role: user.role,
            phoneNumber: user.phoneNumber,
            email: user.email
        });
        const rawRefreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id.toString() });
        const tokenHash = (0, jwt_1.hashToken)(rawRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        user.refreshTokens.push({
            tokenHash,
            expiresAt,
            createdAt: now,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
        await user.save();
        // Fetch user profile
        const profile = await Profile_1.Profile.findOne({ userId: user._id, isDeleted: false });
        (0, jwt_1.setAuthCookies)(res, accessToken, rawRefreshToken);
        res.status(200).json(apiResponse_1.ApiResponse.success({
            user,
            profile,
            accessToken,
            refreshToken: rawRefreshToken
        }, 'Login successful'));
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
/**
 * Logout user: invalidates current refresh token and clears cookies
 */
const logout = async (req, res, next) => {
    try {
        const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (rawRefreshToken && req.userDoc) {
            const tokenHash = (0, jwt_1.hashToken)(rawRefreshToken);
            req.userDoc.refreshTokens = req.userDoc.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
            await req.userDoc.save();
        }
        (0, jwt_1.clearAuthCookies)(res);
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Logged out successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
/**
 * Refresh access token using refresh token rotation
 */
const refreshTokens = async (req, res, next) => {
    try {
        const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!rawRefreshToken) {
            throw new appError_1.AppError('Refresh token required.', 401, 'REFRESH_TOKEN_MISSING');
        }
        const decoded = (0, jwt_1.verifyRefreshToken)(rawRefreshToken);
        const incomingTokenHash = (0, jwt_1.hashToken)(rawRefreshToken);
        const user = await User_1.User.findById(decoded.userId);
        if (!user || user.isDeleted || user.status === 'SUSPENDED') {
            throw new appError_1.AppError('User session is invalid.', 401, 'INVALID_SESSION');
        }
        // Check if refresh token exists in user's active tokens
        const tokenIndex = user.refreshTokens.findIndex((rt) => rt.tokenHash === incomingTokenHash && rt.expiresAt > new Date());
        if (tokenIndex === -1) {
            // Possible token reuse attack detected: invalidate all refresh tokens for security
            user.refreshTokens = [];
            await user.save();
            (0, jwt_1.clearAuthCookies)(res);
            throw new appError_1.AppError('Invalid refresh token or token reuse detected. Please log in again.', 401, 'TOKEN_REUSE_DETECTED');
        }
        // Rotate refresh token: remove old one, append new one
        user.refreshTokens.splice(tokenIndex, 1);
        const newAccessToken = (0, jwt_1.signAccessToken)({
            userId: user._id.toString(),
            role: user.role,
            phoneNumber: user.phoneNumber,
            email: user.email
        });
        const newRawRefreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id.toString() });
        const newTokenHash = (0, jwt_1.hashToken)(newRawRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        user.refreshTokens.push({
            tokenHash: newTokenHash,
            expiresAt,
            createdAt: new Date(),
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
        await user.save();
        (0, jwt_1.setAuthCookies)(res, newAccessToken, newRawRefreshToken);
        res.status(200).json(apiResponse_1.ApiResponse.success({
            accessToken: newAccessToken,
            refreshToken: newRawRefreshToken
        }, 'Tokens refreshed successfully'));
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(new appError_1.AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN'));
        }
        else {
            next(error);
        }
    }
};
exports.refreshTokens = refreshTokens;
/**
 * Get current authenticated user details and profile
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user || user.isDeleted) {
            throw new appError_1.AppError('User not found.', 404, 'NOT_FOUND');
        }
        const profile = await Profile_1.Profile.findOne({ userId: user._id, isDeleted: false });
        res.status(200).json(apiResponse_1.ApiResponse.success({
            user,
            profile
        }, 'User profile retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
/**
 * Forgot password handler
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { identifier } = req.body;
        const user = await User_1.User.findOne({
            $or: [{ phoneNumber: identifier }, { email: identifier.toLowerCase() }],
            isDeleted: false
        });
        // Always respond with success to avoid user enumeration
        if (!user) {
            res.status(200).json(apiResponse_1.ApiResponse.success(null, 'If an account exists with that identifier, a reset code has been sent.'));
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        user.passwordResetTokenHash = (0, jwt_1.hashToken)(resetToken);
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
        // In development or test, return the reset token for convenience
        const isDev = process.env.NODE_ENV !== 'production';
        res.status(200).json(apiResponse_1.ApiResponse.success(isDev ? { resetToken } : null, 'If an account exists with that identifier, a reset code has been sent.'));
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const tokenHash = (0, jwt_1.hashToken)(token);
        const user = await User_1.User.findOne({
            passwordResetTokenHash: tokenHash,
            passwordResetExpires: { $gt: new Date() },
            isDeleted: false
        });
        if (!user) {
            throw new appError_1.AppError('Password reset token is invalid or has expired.', 400, 'INVALID_RESET_TOKEN');
        }
        user.passwordHash = newPassword; // Pre-save hook will hash this
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        user.refreshTokens = []; // Revoke all sessions
        await user.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Password has been reset successfully. Please log in with your new password.'));
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
/**
 * Verify email using token
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        const tokenHash = (0, jwt_1.hashToken)(token);
        const user = await User_1.User.findOne({
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpires: { $gt: new Date() },
            isDeleted: false
        });
        if (!user) {
            throw new appError_1.AppError('Email verification token is invalid or has expired.', 400, 'INVALID_VERIFICATION_TOKEN');
        }
        user.isEmailVerified = true;
        user.emailVerificationTokenHash = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Email verified successfully.'));
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
