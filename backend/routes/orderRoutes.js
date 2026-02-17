const express = require('express');
const router = express.Router();
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

module.exports = router;
