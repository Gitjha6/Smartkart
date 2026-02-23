const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getShopOrders,
    updateOrderStatus,
    markOrderAsPaid,
} = require('../controllers/orderController');
const { protect, shopkeeper } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/shop-orders').get(protect, getShopOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/pay/manual').put(protect, shopkeeper, markOrderAsPaid);
router.route('/:id/status').put(protect, shopkeeper, updateOrderStatus);

// Create Stripe Payment Intent
router.post('/:id/create-payment-intent', protect, async (req, res) => {
    try {
        const order = await require('../models/Order').findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Create a PaymentIntent with the order amount and currency
        // Stripe expects amount in smallest currency unit (e.g., paise for INR)
        // Ensure price is converted accurately
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalPrice * 100),
            currency: 'inr',
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: order._id.toString(),
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error("Stripe Intent Error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
