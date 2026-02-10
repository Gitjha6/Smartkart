import { Router } from 'express';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  createPaymentIntent,
  confirmPayment,
  cancelOrder,
  getOrderStats
} from '@/controllers/orderController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { orderSchemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', asyncHandler(getUserOrders));

// @route   GET /api/orders/stats
// @desc    Get order statistics (Admin only)
// @access  Private (Admin only)
router.get('/stats', requireAdmin, asyncHandler(getOrderStats));

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', asyncHandler(getOrderById));

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', validate(orderSchemas.createOrder), asyncHandler(createOrder));

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin only)
router.put('/:id/status', requireAdmin, validate(orderSchemas.updateOrderStatus), asyncHandler(updateOrderStatus));

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', asyncHandler(cancelOrder));

// @route   POST /api/orders/:id/payment-intent
// @desc    Create payment intent for order
// @access  Private
router.post('/:id/payment-intent', asyncHandler(createPaymentIntent));

// @route   POST /api/orders/:id/confirm-payment
// @desc    Confirm payment
// @access  Private
router.post('/:id/confirm-payment', asyncHandler(confirmPayment));

export default router;
