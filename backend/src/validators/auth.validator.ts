import { z } from 'zod';

export const registerSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Phone number must be valid international or Indian format (e.g. +919876543210 or 9876543210)'),
  email: z.string().trim().email('Invalid email address').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  role: z.enum(['FARMER', 'BUSINESS', 'TRANSPORTER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be FARMER, BUSINESS, TRANSPORTER, or ADMIN' })
  }),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  preferredLanguage: z.string().default('en')
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Phone number or email required'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3, 'Phone number or email is required')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10, 'Verification token is required')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
});
