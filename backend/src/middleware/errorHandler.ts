import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';
import { ValidationError } from 'joi';

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Mongoose duplicate key error
  if (err instanceof mongoose.Error.MongoError && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    statusCode = 400;
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    statusCode = 400;
    message = messages.join(', ');
  }

  // Joi validation error
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.details.map(detail => detail.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Custom AppError
  if (err instanceof CustomError || (err as AppError).statusCode) {
    statusCode = (err as AppError).statusCode;
    message = err.message;
  }

  // Handle specific HTTP errors
  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  }

  if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Access forbidden';
  }

  if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle file upload errors
  if (err.message.includes('File too large')) {
    statusCode = 400;
    message = 'File size too large';
  }

  if (err.message.includes('Invalid file type')) {
    statusCode = 400;
    message = 'Invalid file type';
  }

  // Handle Stripe errors
  if (err.message.includes('Stripe')) {
    statusCode = 400;
    message = 'Payment processing error';
  }

  // Send error response
  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  res.status(statusCode).json(response);
};

// 404 handler for undefined routes
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const validationErrorHandler = (err: ValidationError, req: Request, res: Response, next: NextFunction): void => {
  const messages = err.details.map(detail => detail.message);
  const error = new CustomError(messages.join(', '), 400);
  next(error);
};

// Database error handler
export const databaseErrorHandler = (err: mongoose.Error, req: Request, res: Response, next: NextFunction): void => {
  let error: CustomError;

  if (err instanceof mongoose.Error.CastError) {
    error = new CustomError('Invalid ID format', 400);
  } else if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    error = new CustomError(messages.join(', '), 400);
  } else if (err instanceof mongoose.Error.MongoError && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    error = new CustomError(`${field} already exists`, 400);
  } else {
    error = new CustomError('Database operation failed', 500);
  }

  next(error);
};

// Rate limit error handler
export const rateLimitErrorHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError('Too many requests, please try again later', 429);
  next(error);
};

// Security error handler
export const securityErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err.message.includes('CSRF')) {
    const error = new CustomError('CSRF token validation failed', 403);
    next(error);
  } else if (err.message.includes('XSS')) {
    const error = new CustomError('XSS attack detected', 400);
    next(error);
  } else {
    next(err);
  }
};
