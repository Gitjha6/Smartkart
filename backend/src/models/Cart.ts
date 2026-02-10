import mongoose, { Schema, Document } from 'mongoose';
import { ICart, ICartItem } from '@/types';

export interface CartDocument extends ICart, Document {
  addItem(productId: string, name: string, price: number, image: string, quantity?: number): Promise<void>;
  removeItem(productId: string): Promise<void>;
  updateItemQuantity(productId: string, quantity: number): Promise<void>;
  clearCart(): Promise<void>;
  calculateTotal(): Promise<void>;
  getItemCount(): number;
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  }
}, {
  timestamps: false
});

const cartSchema = new Schema<CartDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
cartSchema.index({ user: 1 });

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for formatted total
cartSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalAmount.toFixed(2)}`;
});

// Method to add item to cart
cartSchema.methods.addItem = async function(
  productId: string,
  name: string,
  price: number,
  image: string,
  quantity: number = 1
): Promise<void> {
  // Check if item already exists in cart
  const existingItemIndex = this.items.findIndex(
    (item: ICartItem) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
    this.items[existingItemIndex].name = name; // Update name in case it changed
    this.items[existingItemIndex].image = image; // Update image in case it changed
  } else {
    // Add new item
    this.items.push({
      product: productId,
      name,
      price,
      image,
      quantity
    });
  }

  await this.calculateTotal();
  await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId: string): Promise<void> {
  this.items = this.items.filter(
    (item: ICartItem) => item.product.toString() !== productId
  );
  
  await this.calculateTotal();
  await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await this.removeItem(productId);
    return;
  }

  const itemIndex = this.items.findIndex(
    (item: ICartItem) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    this.items[itemIndex].quantity = quantity;
    await this.calculateTotal();
    await this.save();
  }
};

// Method to clear cart
cartSchema.methods.clearCart = async function(): Promise<void> {
  this.items = [];
  this.totalAmount = 0;
  await this.save();
};

// Method to calculate total amount
cartSchema.methods.calculateTotal = async function(): Promise<void> {
  this.totalAmount = this.items.reduce(
    (total: number, item: ICartItem) => total + (item.price * item.quantity),
    0
  );
};

// Method to get total item count
cartSchema.methods.getItemCount = function(): number {
  return this.items.reduce((total: number, item: ICartItem) => total + item.quantity, 0);
};

// Static method to find cart by user
cartSchema.statics.findByUser = function(userId: string) {
  return this.findOne({ user: userId }).populate('items.product', 'name price images stock');
};

// Static method to create or get cart for user
cartSchema.statics.findOrCreateByUser = async function(userId: string) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({ user: userId, items: [], totalAmount: 0 });
    await cart.save();
  }
  
  return cart;
};

// Pre-save middleware to ensure total is calculated
cartSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    await this.calculateTotal();
  }
  next();
});

export const Cart = mongoose.model<CartDocument>('Cart', cartSchema);

// Type for cart operations
export type CartItemInput = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};
