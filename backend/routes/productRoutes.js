const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, shopkeeper } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, shopkeeper, createProduct);
router
    .route('/:id')
    .get(getProductById)
    .put(protect, shopkeeper, updateProduct)
    .delete(protect, shopkeeper, deleteProduct);

module.exports = router;
