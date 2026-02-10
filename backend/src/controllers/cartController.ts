import { Request, Response, NextFunction } from 'express';
import { Cart } from '@/models/Cart';
import { Product } from '@/models/Product';
import { AuthRequest, ApiResponse } from '@/types';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const cart = await Cart.findOrCreateByUser(user._id.toString());

    const response: ApiResponse = {
      success: true,
      message: 'Cart retrieved successfully',
      data: { cart }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = req.user!;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new CustomError('Product is not available', 400);
    }

    // Check if product is in stock
    if (!product.isInStock(quantity)) {
      throw new CustomError(`Only ${product.stock} items available in stock`, 400);
    }

    // Get or create cart
    const cart = await Cart.findOrCreateByUser(user._id.toString());

    // Add item to cart
    await cart.addItem(
      productId,
      product.name,
      product.price,
      product.images[0] || '',
      quantity
    );

    // Refresh cart data
    await cart.populate('items.product', 'name price images stock');

    const response: ApiResponse = {
      success: true,
      message: 'Item added to cart successfully',
      data: { cart }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user!;

    if (quantity < 1) {
      throw new CustomError('Quantity must be at least 1', 400);
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new CustomError('Product is not available', 400);
    }

    // Check if product is in stock
    if (!product.isInStock(quantity)) {
      throw new CustomError(`Only ${product.stock} items available in stock`, 400);
    }

    // Get cart
    const cart = await Cart.findByUser(user._id.toString());
    if (!cart) {
      throw new CustomError('Cart not found', 404);
    }

    // Update item quantity
    await cart.updateItemQuantity(productId, quantity);

    // Refresh cart data
    await cart.populate('items.product', 'name price images stock');

    const response: ApiResponse = {
      success: true,
      message: 'Cart item updated successfully',
      data: { cart }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const user = req.user!;

    // Get cart
    const cart = await Cart.findByUser(user._id.toString());
    if (!cart) {
      throw new CustomError('Cart not found', 404);
    }

    // Remove item from cart
    await cart.removeItem(productId);

    // Refresh cart data
    await cart.populate('items.product', 'name price images stock');

    const response: ApiResponse = {
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    // Get cart
    const cart = await Cart.findByUser(user._id.toString());
    if (!cart) {
      throw new CustomError('Cart not found', 404);
    }

    // Clear cart
    await cart.clearCart();

    const response: ApiResponse = {
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const cart = await Cart.findByUser(user._id.toString());
    if (!cart) {
      const response: ApiResponse = {
        success: true,
        message: 'Cart summary retrieved successfully',
        data: {
          itemCount: 0,
          totalAmount: 0,
          items: []
        }
      };
      return res.json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Cart summary retrieved successfully',
      data: {
        itemCount: cart.getItemCount(),
        totalAmount: cart.totalAmount,
        items: cart.items
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Validate cart items (check stock and availability)
// @route   POST /api/cart/validate
// @access  Private
export const validateCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const cart = await Cart.findByUser(user._id.toString());
    if (!cart || cart.items.length === 0) {
      throw new CustomError('Cart is empty', 400);
    }

    const validationResults = [];
    let isValid = true;

    // Validate each item in cart
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        validationResults.push({
          productId: item.product,
          name: item.name,
          valid: false,
          error: 'Product not found'
        });
        isValid = false;
        continue;
      }

      if (!product.isActive) {
        validationResults.push({
          productId: item.product,
          name: item.name,
          valid: false,
          error: 'Product is not available'
        });
        isValid = false;
        continue;
      }

      if (!product.isInStock(item.quantity)) {
        validationResults.push({
          productId: item.product,
          name: item.name,
          valid: false,
          error: `Only ${product.stock} items available in stock`,
          availableStock: product.stock
        });
        isValid = false;
        continue;
      }

      // Check if price has changed
      if (product.price !== item.price) {
        validationResults.push({
          productId: item.product,
          name: item.name,
          valid: false,
          error: 'Product price has changed',
          oldPrice: item.price,
          newPrice: product.price
        });
        isValid = false;
        continue;
      }

      validationResults.push({
        productId: item.product,
        name: item.name,
        valid: true
      });
    }

    const response: ApiResponse = {
      success: true,
      message: isValid ? 'Cart is valid' : 'Cart validation failed',
      data: {
        isValid,
        validationResults
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
