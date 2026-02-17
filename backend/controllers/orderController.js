
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            // isPaid: paymentMethod === 'Cash On Delivery' ? false : true,
            // paidAt: paymentMethod === 'Cash On Delivery' ? null : Date.now(),
        });

        try {
            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        } catch (error) {
            console.error("Order Save Failed:", error);
            res.status(400);
            throw new Error('Order creation failed: ' + error.message);
        }
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get orders for the logged-in shopkeeper
// @route   GET /api/orders/shop-orders
// @access  Private/Shopkeeper
const getShopOrders = asyncHandler(async (req, res) => {
    // 1. Find the shop owned by the user (or use user.shopDetails if reliable)
    // We'll search by owner to be safe
    const Shop = require('../models/Shop'); // Lazy load or move to top
    const shop = await Shop.findOne({ owner: req.user._id });

    if (!shop) {
        res.status(404);
        throw new Error('Shop not found for this user');
    }

    // 2. Find orders where orderItems contains this shop ID
    // orderItems.shop is the field
    const orders = await Order.find({ 'orderItems.shop': shop._id })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Shopkeeper
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.orderStatus = status;

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Mark order as paid (Shopkeeper manual override)
// @route   PUT /api/orders/:id/pay/manual
// @access  Private/Shopkeeper
const markOrderAsPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: 'manual',
            status: 'completed',
            update_time: Date.now(),
            email_address: 'manual@shopkeeper',
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    markOrderAsPaid,
    getMyOrders,
    getShopOrders,
};
