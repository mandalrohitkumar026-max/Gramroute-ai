import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshTokens,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from '../validators/auth.validator';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshTokens);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), resetPassword);
router.post('/verify-email', validate({ body: verifyEmailSchema }), verifyEmail);

export default router;
