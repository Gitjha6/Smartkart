import mongoose, { Schema, Document } from 'mongoose';
import { IWishlist } from '@/types';

export interface WishlistDocument extends IWishlist, Document {
  addProduct(productId: string): Promise<void>;
  removeProduct(productId: string): Promise<void>;
  hasProduct(productId: string): boolean;
  getProductCount(): number;
}

const wishlistSchema = new Schema<WishlistDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }]
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
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ products: 1 });

// Virtual for product count
wishlistSchema.virtual('productCount').get(function() {
  return this.products.length;
});

// Method to add product to wishlist
wishlistSchema.methods.addProduct = async function(productId: string): Promise<void> {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    await this.save();
  }
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = async function(productId: string): Promise<void> {
  this.products = this.products.filter(
    (product: any) => product.toString() !== productId
  );
  await this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId: string): boolean {
  return this.products.some((product: any) => product.toString() === productId);
};

// Method to get product count
wishlistSchema.methods.getProductCount = function(): number {
  return this.products.length;
};

// Static method to find wishlist by user
wishlistSchema.statics.findByUser = function(userId: string) {
  return this.findOne({ user: userId })
    .populate('products', 'name price images rating numReviews stock');
};

// Static method to create or get wishlist for user
wishlistSchema.statics.findOrCreateByUser = async function(userId: string) {
  let wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    wishlist = new this({ user: userId, products: [] });
    await wishlist.save();
  }
  
  return wishlist;
};

export const Wishlist = mongoose.model<WishlistDocument>('Wishlist', wishlistSchema);

// Type for wishlist operations
export type WishlistInput = {
  productId: string;
};
