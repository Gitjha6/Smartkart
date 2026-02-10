import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  validateCart
} from '@/controllers/cartController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { cartSchemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', asyncHandler(getCart));

// @route   GET /api/cart/summary
// @desc    Get cart summary
// @access  Private
router.get('/summary', asyncHandler(getCartSummary));

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', validate(cartSchemas.addToCart), asyncHandler(addToCart));

// @route   PUT /api/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put('/update', validate(cartSchemas.updateCartItem), asyncHandler(updateCartItem));

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', asyncHandler(removeFromCart));

// @route   DELETE /api/cart/clear
// @desc    Clear cart
// @access  Private
router.delete('/clear', asyncHandler(clearCart));

// @route   POST /api/cart/validate
// @desc    Validate cart items
// @access  Private
router.post('/validate', asyncHandler(validateCart));

export default router;
