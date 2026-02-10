import mongoose, { Schema, Document } from 'mongoose';
import { IProduct, IProductInput, IReview } from '@/types';

export interface ProductDocument extends IProduct, Document {
  addReview(userId: string, name: string, rating: number, comment: string): Promise<void>;
  updateRating(): Promise<void>;
  isInStock(quantity: number): boolean;
}

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Review comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new Schema<ProductDocument>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    lowercase: true
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required']
  }],
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ 'tags': 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock < 10) return 'low_stock';
  return 'in_stock';
});

// Virtual for average rating
productSchema.virtual('averageRating').get(function() {
  if (this.numReviews === 0) return 0;
  return this.rating;
});

// Method to add a review
productSchema.methods.addReview = async function(
  userId: string,
  name: string,
  rating: number,
  comment: string
): Promise<void> {
  // Check if user already reviewed this product
  const existingReviewIndex = this.reviews.findIndex(
    (review: IReview) => review.user.toString() === userId
  );

  if (existingReviewIndex > -1) {
    // Update existing review
    this.reviews[existingReviewIndex].rating = rating;
    this.reviews[existingReviewIndex].comment = comment;
    this.reviews[existingReviewIndex].name = name;
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      name,
      rating,
      comment,
      createdAt: new Date()
    });
    this.numReviews += 1;
  }

  await this.updateRating();
  await this.save();
};

// Method to update average rating
productSchema.methods.updateRating = async function(): Promise<void> {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum: number, review: IReview) => sum + review.rating, 0);
  this.rating = totalRating / this.reviews.length;
  this.numReviews = this.reviews.length;
};

// Method to check if product is in stock
productSchema.methods.isInStock = function(quantity: number = 1): boolean {
  return this.stock >= quantity;
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category: string) {
  return this.find({ category: category.toLowerCase(), isActive: true });
};

// Static method to find products by brand
productSchema.statics.findByBrand = function(brand: string) {
  return this.find({ brand: new RegExp(brand, 'i'), isActive: true });
};

// Static method to search products
productSchema.statics.search = function(searchTerm: string) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  });
};

// Static method to get products with filters
productSchema.statics.getFilteredProducts = function(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
  inStock?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const query: any = { isActive: true };

  if (filters.category) {
    query.category = filters.category.toLowerCase();
  }

  if (filters.brand) {
    query.brand = new RegExp(filters.brand, 'i');
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
  }

  if (filters.rating !== undefined) {
    query.rating = { $gte: filters.rating };
  }

  if (filters.inStock !== undefined) {
    if (filters.inStock) {
      query.stock = { $gt: 0 };
    } else {
      query.stock = 0;
    }
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { category: { $regex: filters.search, $options: 'i' } },
      { brand: { $regex: filters.search, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.search, 'i')] } }
    ];
  }

  let sortQuery: any = { createdAt: -1 };

  if (filters.sort) {
    const order = filters.order === 'asc' ? 1 : -1;
    sortQuery = { [filters.sort]: order };
  }

  return this.find(query).sort(sortQuery);
};

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    this.sku = `SK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export const Product = mongoose.model<ProductDocument>('Product', productSchema);

// Type for creating new products
export type CreateProductInput = IProductInput;

// Type for updating products
export type UpdateProductInput = Partial<IProductInput>;
