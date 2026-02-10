import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout
} from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { authSchemas, userSchemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(authSchemas.register), asyncHandler(register));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(authSchemas.login), asyncHandler(login));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, asyncHandler(getMe));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, validate(userSchemas.updateProfile), asyncHandler(updateProfile));

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, validate(userSchemas.changePassword), asyncHandler(changePassword));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', validate(authSchemas.forgotPassword), asyncHandler(forgotPassword));

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', validate(authSchemas.resetPassword), asyncHandler(resetPassword));

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email', validate(authSchemas.verifyEmail), asyncHandler(verifyEmail));

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification', validate(authSchemas.forgotPassword), asyncHandler(resendVerification));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(logout));

export default router;
