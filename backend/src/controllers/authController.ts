import { Request, Response, NextFunction } from 'express';
import { User, CreateUserInput } from '@/models/User';
import { AuthRequest, ApiResponse } from '@/types';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { sendEmail } from '@/services/emailService';
import { generateToken } from '@/utils/tokenUtils';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone }: CreateUserInput = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new CustomError('User with this email already exists', 400);
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: 'customer'
    });

    await user.save();

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - SmartKart',
        html: `
          <h1>Welcome to SmartKart!</h1>
          <p>Hi ${name},</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new CustomError('Please verify your email address before logging in', 401);
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          address: user.address,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          address: user.address,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone, address } = req.body;
    const user = req.user;

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          address: user.address,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new CustomError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      const response: ApiResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      };
      return res.json(response);
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset - SmartKart',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      throw new CustomError('Failed to send password reset email', 500);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Password reset email sent successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Find user with reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new CustomError('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    // Find user with verification token
    const user = await User.findOne({
      emailVerificationToken: token
    });

    if (!user) {
      throw new CustomError('Invalid verification token', 400);
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new CustomError('Email is already verified', 400);
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - SmartKart',
        html: `
          <h1>Email Verification</h1>
          <p>Hi ${user.name},</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
        `
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      throw new CustomError('Failed to send verification email', 500);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Verification email sent successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token. However, you could implement a blacklist
    // or use refresh tokens for more security.

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
