import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { AuthRequest, JWTPayload, AppError } from '@/types';
import { logger } from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Verify JWT token
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Check if user is active
    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email address', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token:', error.message);
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token');
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isEmailVerified) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue without user
    next();
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`User ${req.user._id} attempted to access restricted resource. Role: ${req.user.role}, Required: ${roles.join(', ')}`);
      next(new AppError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};

// Admin only access
export const requireAdmin = requireRole(['admin']);

// Customer only access
export const requireCustomer = requireRole(['customer']);

// Check if user owns the resource
export const requireOwnership = (resourceUserIdField: string = 'user') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      next(new AppError('Resource user ID not found', 400));
      return;
    }

    if (resourceUserId !== req.user._id.toString()) {
      logger.warn(`User ${req.user._id} attempted to access resource owned by ${resourceUserId}`);
      next(new AppError('Access denied', 403));
      return;
    }

    next();
  };
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};

// Password reset rate limiting
export const passwordResetRateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};

// Email verification rate limiting
export const emailVerificationRateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many email verification attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};
