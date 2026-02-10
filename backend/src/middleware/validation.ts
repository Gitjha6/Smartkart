import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

// Base validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(errorMessage, 400);
    }
    
    next();
  };
};

// Validation schemas
export const authSchemas = {
  // User registration
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      }),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      })
  }),

  // User login
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Password reset request
  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      })
  }),

  // Password reset
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      })
  }),

  // Email verification
  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Verification token is required'
      })
  })
};

export const userSchemas = {
  // Update profile
  updateProfile: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      }),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('United States')
    }).optional()
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      })
  })
};

export const productSchemas = {
  // Create product
  createProduct: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
      }),
    description: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 2000 characters',
        'any.required': 'Product description is required'
      }),
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be positive',
        'any.required': 'Product price is required'
      }),
    category: Joi.string()
      .required()
      .messages({
        'any.required': 'Product category is required'
      }),
    stock: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Stock must be a number',
        'number.integer': 'Stock must be a whole number',
        'number.min': 'Stock cannot be negative',
        'any.required': 'Product stock is required'
      }),
    brand: Joi.string()
      .optional(),
    sku: Joi.string()
      .optional(),
    weight: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.base': 'Weight must be a number',
        'number.positive': 'Weight must be positive'
      }),
    dimensions: Joi.object({
      length: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      height: Joi.number().positive().required()
    }).optional(),
    tags: Joi.array()
      .items(Joi.string())
      .optional()
  }),

  // Update product
  updateProduct: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    description: Joi.string()
      .min(10)
      .max(2000)
      .optional(),
    price: Joi.number()
      .positive()
      .precision(2)
      .optional(),
    category: Joi.string()
      .optional(),
    stock: Joi.number()
      .integer()
      .min(0)
      .optional(),
    brand: Joi.string()
      .optional(),
    weight: Joi.number()
      .positive()
      .optional(),
    dimensions: Joi.object({
      length: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      height: Joi.number().positive().required()
    }).optional(),
    tags: Joi.array()
      .items(Joi.string())
      .optional(),
    isActive: Joi.boolean()
      .optional()
  }),

  // Product filters
  productFilters: Joi.object({
    category: Joi.string().optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    rating: Joi.number().min(1).max(5).optional(),
    brand: Joi.string().optional(),
    inStock: Joi.boolean().optional(),
    search: Joi.string().optional(),
    sort: Joi.string().valid('name', 'price', 'rating', 'createdAt').optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  })
};

export const cartSchemas = {
  // Add to cart
  addToCart: Joi.object({
    productId: Joi.string()
      .required()
      .messages({
        'any.required': 'Product ID is required'
      }),
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(99)
      .default(1)
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 99'
      })
  }),

  // Update cart item
  updateCartItem: Joi.object({
    productId: Joi.string()
      .required()
      .messages({
        'any.required': 'Product ID is required'
      }),
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(99)
      .required()
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 99',
        'any.required': 'Quantity is required'
      })
  })
};

export const orderSchemas = {
  // Create order
  createOrder: Joi.object({
    items: Joi.array()
      .items(Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        image: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
      }))
      .min(1)
      .required()
      .messages({
        'array.min': 'Order must contain at least one item',
        'any.required': 'Order items are required'
      }),
    totalAmount: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Total amount must be a number',
        'number.positive': 'Total amount must be positive',
        'any.required': 'Total amount is required'
      }),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('United States')
    }).required(),
    paymentMethod: Joi.string()
      .valid('stripe', 'paypal', 'cash_on_delivery')
      .required()
      .messages({
        'any.only': 'Invalid payment method',
        'any.required': 'Payment method is required'
      })
  }),

  // Update order status
  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
      .required()
      .messages({
        'any.only': 'Invalid order status',
        'any.required': 'Order status is required'
      }),
    trackingNumber: Joi.string()
      .optional(),
    notes: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Notes cannot exceed 500 characters'
      })
  })
};

export const reviewSchemas = {
  // Add review
  addReview: Joi.object({
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.base': 'Rating must be a number',
        'number.integer': 'Rating must be a whole number',
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating cannot exceed 5',
        'any.required': 'Rating is required'
      }),
    comment: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Review comment must be at least 10 characters long',
        'string.max': 'Review comment cannot exceed 500 characters',
        'any.required': 'Review comment is required'
      })
  })
};

export const wishlistSchemas = {
  // Add to wishlist
  addToWishlist: Joi.object({
    productId: Joi.string()
      .required()
      .messages({
        'any.required': 'Product ID is required'
      })
  })
};

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  sort: Joi.string()
    .valid('name', 'price', 'rating', 'createdAt', 'updatedAt')
    .optional(),
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Order must be either "asc" or "desc"'
    })
});

// File upload validation
export const fileUploadSchema = Joi.object({
  maxSize: Joi.number()
    .max(5 * 1024 * 1024) // 5MB
    .messages({
      'number.max': 'File size cannot exceed 5MB'
    }),
  allowedTypes: Joi.array()
    .items(Joi.string().valid('image/jpeg', 'image/png', 'image/webp'))
    .messages({
      'array.includes': 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
    })
});
