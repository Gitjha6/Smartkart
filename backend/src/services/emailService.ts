import nodemailer from 'nodemailer';
import { EmailOptions } from '@/types';
import { logger } from '@/utils/logger';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SmartKart" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Welcome to SmartKart!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining SmartKart! We're excited to have you as part of our community.</p>
      <p>Here's what you can do with your account:</p>
      <ul>
        <li>Browse our extensive product catalog</li>
        <li>Add items to your wishlist</li>
        <li>Shop with secure payments</li>
        <li>Track your orders</li>
        <li>Write product reviews</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Happy shopping!</p>
      <p>Best regards,<br>The SmartKart Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to SmartKart!',
    html
  });
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderNumber: string,
  orderDetails: any
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your order! We've received your order and it's being processed.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> $${orderDetails.totalAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${orderDetails.status}</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Shipping Address</h3>
        <p>${orderDetails.shippingAddress.street}</p>
        <p>${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}</p>
        <p>${orderDetails.shippingAddress.country}</p>
      </div>

      <p>We'll send you updates about your order status via email.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Thank you for choosing SmartKart!</p>
      <p>Best regards,<br>The SmartKart Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html
  });
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
): Promise<void> => {
  const statusMessages = {
    processing: 'Your order is being processed and prepared for shipment.',
    shipped: 'Your order has been shipped and is on its way to you!',
    delivered: 'Your order has been delivered successfully.',
    cancelled: 'Your order has been cancelled.'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Order Status Update</h1>
      <p>Hi ${name},</p>
      <p>Your order status has been updated.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>New Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
        ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
      </div>

      <p>${statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.'}</p>
      
      ${trackingNumber ? `
        <p>You can track your package using the tracking number above.</p>
      ` : ''}

      <p>If you have any questions, please contact our support team.</p>
      <p>Thank you for choosing SmartKart!</p>
      <p>Best regards,<br>The SmartKart Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Order Status Update - ${orderNumber}`,
    html
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>You requested a password reset for your SmartKart account.</p>
      <p>Click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>

      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>The SmartKart Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset - SmartKart',
    html
  });
};

// Send email verification email
export const sendEmailVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
      <p>Hi ${name},</p>
      <p>Welcome to SmartKart! Please verify your email address to complete your registration.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
           style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>

      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account with SmartKart, please ignore this email.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>The SmartKart Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - SmartKart',
    html
  });
};

// Send low stock alert email (for admin)
export const sendLowStockAlertEmail = async (
  email: string,
  productName: string,
  currentStock: number
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b6b; text-align: center;">Low Stock Alert</h1>
      <p>Hello Admin,</p>
      <p>A product is running low on stock and may need to be restocked soon.</p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>Product Details</h3>
        <p><strong>Product Name:</strong> ${productName}</p>
        <p><strong>Current Stock:</strong> ${currentStock} units</p>
      </div>

      <p>Please consider restocking this product to avoid stockouts.</p>
      <p>Best regards,<br>SmartKart System</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Low Stock Alert - SmartKart',
    html
  });
};
