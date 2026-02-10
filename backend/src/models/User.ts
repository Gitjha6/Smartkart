import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, IUserInput } from '@/types';

export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'United States'
    }
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    }
  }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const token = jwt.sign(
    { userId: this._id, type: 'email_verification' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
  
  this.emailVerificationToken = token;
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const token = jwt.sign(
    { userId: this._id, type: 'password_reset' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  
  this.resetPasswordToken = token;
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Virtual for formatted address
userSchema.virtual('formattedAddress').get(function() {
  if (!this.address) return '';
  
  const { street, city, state, zipCode, country } = this.address;
  const parts = [street, city, state, zipCode, country].filter(Boolean);
  return parts.join(', ');
});

export const User = mongoose.model<UserDocument>('User', userSchema);

// Type for creating new users
export type CreateUserInput = Omit<IUserInput, 'password'> & { password: string };

// Type for updating users
export type UpdateUserInput = Partial<Omit<IUserInput, 'password' | 'email'>> & {
  password?: string;
};
