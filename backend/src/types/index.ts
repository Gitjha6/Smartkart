import { Request } from 'express';
import { Document } from 'mongoose';

// Base interface for all documents
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// User related types
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'admin';
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
}

// Product related types
export interface IProduct extends BaseDocument {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  reviews: IReview[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  tags: string[];
}

export interface IProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  stock: number;
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
}

export interface IReview {
  user: IUser['_id'];
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Cart related types
export interface ICartItem {
  product: IProduct['_id'];
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ICart extends BaseDocument {
  user: IUser['_id'];
  items: ICartItem[];
  totalAmount: number;
}

// Order related types
export interface IOrderItem {
  product: IProduct['_id'];
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface IOrder extends BaseDocument {
  user: IUser['_id'];
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface IOrderInput {
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

// Wishlist related types
export interface IWishlist extends BaseDocument {
  user: IUser['_id'];
  products: IProduct['_id'][];
}

// Authentication types
export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination types
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Search and filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
  inStock?: boolean;
  search?: string;
}

// Stripe types
export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Email types
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Database query types
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  populate?: string | string[];
}

// Cache types
export interface CacheOptions {
  ttl?: number;
  key?: string;
}

// Notification types
export interface Notification {
  type: 'order_status' | 'payment' | 'stock' | 'review';
  title: string;
  message: string;
  userId: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}
