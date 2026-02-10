const express = require('express');
const router = express.Router();
const {
    createShop,
    getShopById,
    updateShop,
} = require('../controllers/shopController');
const { protect, shopkeeper } = require('../middleware/authMiddleware');

router.post('/', protect, shopkeeper, createShop);
router.route('/:id').get(getShopById).put(protect, shopkeeper, updateShop);

module.exports = router;
