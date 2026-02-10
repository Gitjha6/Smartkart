import { Request, Response, NextFunction } from 'express';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import { Product } from '@/models/Product';
import { AuthRequest, ApiResponse, CreateOrderInput } from '@/types';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '@/services/emailService';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.findByUser(user._id.toString());
    const total = orders.length;
    const paginatedOrders = orders.slice(skip, skip + limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: paginatedOrders,
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

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const order = await Order.findByIdWithUser(id);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new CustomError('Access denied', 403);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const orderData: CreateOrderInput = req.body;

    // Get user's cart
    const cart = await Cart.findByUser(user._id.toString());
    if (!cart || cart.items.length === 0) {
      throw new CustomError('Cart is empty', 400);
    }

    // Validate cart items
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new CustomError(`Product ${item.name} not found`, 404);
      }
      if (!product.isActive) {
        throw new CustomError(`Product ${item.name} is not available`, 400);
      }
      if (!product.isInStock(item.quantity)) {
        throw new CustomError(`Only ${product.stock} items available for ${item.name}`, 400);
      }
    }

    // Create order
    const order = new Order({
      user: user._id,
      items: cart.items,
      totalAmount: cart.totalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Clear cart
    await cart.clearCart();

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        user.email,
        user.name,
        order.orderNumber,
        {
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress
        }
      );
    } catch (emailError) {
      logger.error('Failed to send order confirmation email:', emailError);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order created successfully',
      data: { order }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findByIdWithUser(id);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    // Update order status
    await order.updateStatus(status);

    // Add tracking number if provided
    if (trackingNumber) {
      await order.addTrackingNumber(trackingNumber);
    }

    // Add notes if provided
    if (notes) {
      order.notes = notes;
      await order.save();
    }

    // Send status update email
    try {
      await sendOrderStatusUpdateEmail(
        order.user.email,
        order.user.name,
        order.orderNumber,
        status,
        trackingNumber
      );
    } catch (emailError) {
      logger.error('Failed to send order status update email:', emailError);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create payment intent for order
// @route   POST /api/orders/:id/payment-intent
// @access  Private
export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const order = await Order.findById(id);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    if (order.user.toString() !== user._id.toString()) {
      throw new CustomError('Access denied', 403);
    }

    if (order.paymentStatus === 'completed') {
      throw new CustomError('Payment already completed', 400);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString()
      }
    });

    // Update order with payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    const response: ApiResponse = {
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment
// @route   POST /api/orders/:id/confirm-payment
// @access  Private
export const confirmPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentIntentId } = req.body;
    const user = req.user!;

    const order = await Order.findById(id);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    if (order.user.toString() !== user._id.toString()) {
      throw new CustomError('Access denied', 403);
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      await order.save();

      const response: ApiResponse = {
        success: true,
        message: 'Payment confirmed successfully',
        data: { order }
      };

      res.json(response);
    } else {
      throw new CustomError('Payment not completed', 400);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const order = await Order.findByIdWithUser(id);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new CustomError('Access denied', 403);
    }

    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new CustomError('Order cannot be cancelled at this stage', 400);
    }

    // Update order status
    await order.updateStatus('cancelled');

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private (Admin only)
export const getOrderStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Order.getOrderStats();

    const response: ApiResponse = {
      success: true,
      message: 'Order statistics retrieved successfully',
      data: { stats }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
