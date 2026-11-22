import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { User, UserRole, IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        phoneNumber?: string;
        email?: string;
      };
      userDoc?: IUser;
    }
  }
}

/**
 * Middleware to authenticate requests via Bearer token or HttpOnly cookie
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Authentication required. No access token provided.', 401, 'UNAUTHORIZED');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Verify user exists and is active
    const user = await User.findOne({ _id: decoded.userId, isDeleted: false });
    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401, 'USER_NOT_FOUND');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new AppError(`Your account is ${user.status.toLowerCase()}. Contact support.`, 403, 'ACCOUNT_DISABLED');
    }

    if (user.isLocked()) {
      throw new AppError('Account is temporarily locked due to failed login attempts. Try again later.', 403, 'ACCOUNT_LOCKED');
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      phoneNumber: user.phoneNumber,
      email: user.email
    };
    req.userDoc = user;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid access token.', 401, 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization check.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

/**
 * Helper to ensure a user only accesses their own resource unless they are ADMIN
 */
export const requireOwnershipOrAdmin = (getOwnerId: (req: Request) => string | undefined) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (req.user.role === 'ADMIN') {
      return next(); // Admins bypass ownership checks
    }

    const ownerId = getOwnerId(req);
    if (!ownerId || ownerId !== req.user.id) {
      return next(new AppError('Forbidden: You do not have permission to access or modify this resource.', 403, 'FORBIDDEN'));
    }

    next();
  };
};
