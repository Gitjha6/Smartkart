const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check 1: Find User
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopDetails: user.shopDetails,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'customer',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopDetails: user.shopDetails,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Self-healing: If shopDetails is missing, check if a shop actually exists
        if (!user.shopDetails) {
            const Shop = require('../models/Shop'); // Import locally to avoid circular dep if any
            const existingShop = await Shop.findOne({ owner: user._id });
            if (existingShop) {
                user.shopDetails = existingShop._id;
                await user.save();
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopDetails: user.shopDetails,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Mock Google Login (For Demo/Dev without credentials)
// @route   GET /api/users/google
// @access  Public
const mockGoogleLogin = asyncHandler(async (req, res) => {
    // 1. Check if mock user exists
    let user = await User.findOne({ email: 'google_user@test.com' });

    if (!user) {
        // Create mock user if not exists
        user = await User.create({
            name: 'Google User (Mock)',
            email: 'google_user@test.com',
            password: 'mock_password_123', // Dummy password
            role: 'shopkeeper',
        });
    }

    // 2. Generate token
    const token = generateToken(user._id);

    // 3. Redirect to frontend with token
    res.redirect(`http://localhost:5173/login?token=${token}`);
});

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    mockGoogleLogin,
};
