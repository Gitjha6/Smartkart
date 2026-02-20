const asyncHandler = require('express-async-handler');
const Shop = require('../models/Shop');
const User = require('../models/User');

// @desc    Register a new shop
// @route   POST /api/shops
// @access  Private/Shopkeeper
const createShop = asyncHandler(async (req, res) => {
    const { name, address, city, state, pincode, description, latitude, longitude } = req.body;

    console.log(`[DEBUG] allow createShop for user: ${req.user._id}`);
    const shopExists = await Shop.findOne({ owner: req.user._id });
    console.log(`[DEBUG] shopExists result: ${shopExists}`);

    if (shopExists) {
        // Self-repair: Link this shop to the user if not already linked
        const user = await User.findById(req.user._id);
        if (!user.shopDetails || user.shopDetails.toString() !== shopExists._id.toString()) {
            user.shopDetails = shopExists._id;
            await user.save();
        }

        // Return the existing shop instead of erroring
        return res.status(200).json(shopExists);
    }

    const lat = latitude ? Number(latitude) : 28.6139; // Default to New Delhi
    const lng = longitude ? Number(longitude) : 77.2090;

    const shop = await Shop.create({
        owner: req.user._id,
        name,
        address,
        city,
        state,
        pincode,
        description,
        location: {
            type: 'Point',
            coordinates: [lng, lat], // GeoJSON format: [long, lat]
        },
    });

    if (shop) {
        // Update user shopDetails
        const user = await User.findById(req.user._id);
        user.shopDetails = shop._id;
        await user.save();

        res.status(201).json(shop);
    } else {
        res.status(400);
        throw new Error('Invalid shop data');
    }
});

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id).populate('products');

    if (shop) {
        res.json(shop);
    } else {
        res.status(404);
        throw new Error('Shop not found');
    }
});

// @desc    Update shop profile
// @route   PUT /api/shops/:id
// @access  Private/Shopkeeper (Owner)
const updateShop = asyncHandler(async (req, res) => {
    const { name, address, city, state, pincode, description, latitude, longitude } = req.body;

    const shop = await Shop.findById(req.params.id);

    if (shop) {
        // Check ownership
        if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to update this shop');
        }

        shop.name = name || shop.name;
        shop.address = address || shop.address;
        shop.city = city || shop.city;
        shop.state = state || shop.state;
        shop.pincode = pincode || shop.pincode;
        shop.description = description || shop.description;

        if (latitude && longitude) {
            shop.location = {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
            };
        }

        const updatedShop = await shop.save();
        res.json(updatedShop);
    } else {
        res.status(404);
        throw new Error('Shop not found');
    }
});



// @desc    Get shops nearby
// @route   GET /api/shops/nearby
// @access  Public
module.exports = { createShop, getShopById, updateShop };
