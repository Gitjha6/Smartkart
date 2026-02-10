import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { logger } from './logger';

// Generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Failed to generate token');
  }
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token:', error.message);
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token');
      throw new Error('Token expired');
    } else {
      logger.error('Error verifying JWT token:', error);
      throw new Error('Token verification failed');
    }
  }
};

// Generate email verification token
export const generateEmailVerificationToken = (userId: string): string => {
  try {
    return jwt.sign(
      { userId, type: 'email_verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  } catch (error) {
    logger.error('Error generating email verification token:', error);
    throw new Error('Failed to generate verification token');
  }
};

// Generate password reset token
export const generatePasswordResetToken = (userId: string): string => {
  try {
    return jwt.sign(
      { userId, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  } catch (error) {
    logger.error('Error generating password reset token:', error);
    throw new Error('Failed to generate reset token');
  }
};

// Verify email verification token
export const verifyEmailVerificationToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }
    
    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid email verification token:', error.message);
      throw new Error('Invalid verification token');
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired email verification token');
      throw new Error('Verification token expired');
    } else {
      logger.error('Error verifying email verification token:', error);
      throw new Error('Token verification failed');
    }
  }
};

// Verify password reset token
export const verifyPasswordResetToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }
    
    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid password reset token:', error.message);
      throw new Error('Invalid reset token');
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired password reset token');
      throw new Error('Reset token expired');
    } else {
      logger.error('Error verifying password reset token:', error);
      throw new Error('Token verification failed');
    }
  }
};

// Decode token without verification (for logging purposes)
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    logger.error('Error checking token expiration:', error);
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    logger.error('Error getting token expiration:', error);
    return null;
  }
};
