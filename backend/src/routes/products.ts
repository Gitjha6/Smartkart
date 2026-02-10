import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getCategories,
  getBrands,
  addReview,
  getProductReviews,
  getFeaturedProducts,
  getNewArrivals
} from '@/controllers/productController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { productSchemas, reviewSchemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// @route   GET /api/products
// @desc    Get all products with pagination, search, and filters
// @access  Public
router.get('/', asyncHandler(getProducts));

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', asyncHandler(searchProducts));

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', asyncHandler(getCategories));

// @route   GET /api/products/brands
// @desc    Get all product brands
// @access  Public
router.get('/brands', asyncHandler(getBrands));

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', asyncHandler(getFeaturedProducts));

// @route   GET /api/products/new-arrivals
// @desc    Get new arrivals
// @access  Public
router.get('/new-arrivals', asyncHandler(getNewArrivals));

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', asyncHandler(getProductsByCategory));

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', asyncHandler(getProductById));

// @route   GET /api/products/:id/reviews
// @desc    Get product reviews
// @access  Public
router.get('/:id/reviews', asyncHandler(getProductReviews));

// @route   POST /api/products/:id/reviews
// @desc    Add review to product
// @access  Private
router.post('/:id/reviews', authenticateToken, validate(reviewSchemas.addReview), asyncHandler(addReview));

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, validate(productSchemas.createProduct), asyncHandler(createProduct));

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validate(productSchemas.updateProduct), asyncHandler(updateProduct));

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(deleteProduct));

export default router;
