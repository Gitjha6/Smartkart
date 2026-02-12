const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Fetch all products with search and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .populate('shop', 'name')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('shop', 'name');

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Shopkeeper
const createProduct = asyncHandler(async (req, res) => {
    // Find the shop owned by the user
    console.log(req.user._id);
    const shop = await Shop.findOne({ owner: req.user._id });

    if (!shop) {
        res.status(404);
        throw new Error('Shop not found for this user');
    }

    const { name, price, description, image, category, countInStock, searchTags } = req.body;

    const product = new Product({
        name,
        price,
        user: req.user._id,
        shop: shop._id,
        image,
        category,
        countInStock,
        numReviews: 0,
        description,
        searchTags: searchTags ? searchTags.split(',') : [],
    });

    const createdProduct = await product.save();

    shop.products.push(createdProduct._id);
    await shop.save();

    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Shopkeeper
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, category, countInStock, searchTags } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Check ownership? 
        // We can check if product.shop matches user.shopDetails

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.category = category;
        product.countInStock = countInStock;
        if (searchTags) product.searchTags = searchTags.split(',');

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Shopkeeper
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
