const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    mockGoogleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/google', mockGoogleLogin);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
