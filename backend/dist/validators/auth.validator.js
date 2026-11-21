"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    phoneNumber: zod_1.z
        .string()
        .trim()
        .regex(/^\+?[1-9]\d{7,14}$/, 'Phone number must be valid international or Indian format (e.g. +919876543210 or 9876543210)'),
    email: zod_1.z.string().trim().email('Invalid email address').optional(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit'),
    role: zod_1.z.enum(['FARMER', 'BUSINESS', 'TRANSPORTER', 'ADMIN'], {
        errorMap: () => ({ message: 'Role must be FARMER, BUSINESS, TRANSPORTER, or ADMIN' })
    }),
    fullName: zod_1.z.string().trim().min(2, 'Full name must be at least 2 characters'),
    preferredLanguage: zod_1.z.string().default('en')
});
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().trim().min(3, 'Phone number or email required'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.forgotPasswordSchema = zod_1.z.object({
    identifier: zod_1.z.string().trim().min(3, 'Phone number or email is required')
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(10, 'Reset token is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit')
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(10, 'Verification token is required')
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'New password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit')
});
