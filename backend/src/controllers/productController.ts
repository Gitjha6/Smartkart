import { Request, Response, NextFunction } from 'express';
import { Product, CreateProductInput } from '@/models/Product';
import { AuthRequest, ApiResponse, ProductFilters } from '@/types';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// @desc    Get all products with pagination, search, and filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      brand,
      inStock,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filters: ProductFilters = {};

    if (search) filters.search = search as string;
    if (category) filters.category = category as string;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (rating) filters.rating = parseFloat(rating as string);
    if (brand) filters.brand = brand as string;
    if (inStock !== undefined) filters.inStock = inStock === 'true';
    if (sort) filters.sort = sort as string;
    if (order) filters.order = order as 'asc' | 'desc';

    // Get products with filters
    const products = await Product.getFilteredProducts(filters);

    // Apply pagination
    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('reviews.user', 'name');

    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new CustomError('Product is not available', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Product retrieved successfully',
      data: { product }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productData: CreateProductInput = req.body;

    const product = new Product(productData);
    await product.save();

    const response: ApiResponse = {
      success: true,
      message: 'Product created successfully',
      data: { product }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);

    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    // Update product fields
    Object.keys(updateData).forEach(key => {
      if (key in product) {
        (product as any)[key] = updateData[key];
      }
    });

    await product.save();

    const response: ApiResponse = {
      success: true,
      message: 'Product updated successfully',
      data: { product }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    const response: ApiResponse = {
      success: true,
      message: 'Product deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      throw new CustomError('Search query is required', 400);
    }

    const searchTerm = q as string;
    const limitNum = parseInt(limit as string);

    const products = await Product.search(searchTerm).limit(limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'Search results retrieved successfully',
      data: { products }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.findByCategory(category);
    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'Products by category retrieved successfully',
      data: {
        products: paginatedProducts,
        category,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Product.distinct('category');

    const response: ApiResponse = {
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
export const getBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const brands = await Product.distinct('brand').where('brand').ne(null);

    const response: ApiResponse = {
      success: true,
      message: 'Brands retrieved successfully',
      data: { brands }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user!;

    const product = await Product.findById(id);

    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new CustomError('Product is not available', 404);
    }

    // Add review
    await product.addReview(user._id.toString(), user.name, rating, comment);

    const response: ApiResponse = {
      success: true,
      message: 'Review added successfully',
      data: { product }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const product = await Product.findById(id).populate('reviews.user', 'name');

    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    const reviews = product.reviews.slice(skip, skip + limitNum);
    const total = product.reviews.length;

    const response: ApiResponse = {
      success: true,
      message: 'Product reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 8 } = req.query;
    const limitNum = parseInt(limit as string);

    const products = await Product.find({ isActive: true })
      .sort({ rating: -1, numReviews: -1 })
      .limit(limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'Featured products retrieved successfully',
      data: { products }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 8 } = req.query;
    const limitNum = parseInt(limit as string);

    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'New arrivals retrieved successfully',
      data: { products }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
