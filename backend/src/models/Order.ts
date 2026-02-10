import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, IOrderItem, IOrderInput } from '@/types';

export interface OrderDocument extends IOrder, Document {
  updateStatus(status: IOrder['status']): Promise<void>;
  updatePaymentStatus(status: IOrder['paymentStatus']): Promise<void>;
  addTrackingNumber(trackingNumber: string): Promise<void>;
  calculateTotal(): Promise<void>;
  getFormattedStatus(): string;
  getFormattedPaymentStatus(): string;
}

const orderItemSchema = new Schema<IOrderItem>({
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
    min: [1, 'Quantity must be at least 1']
  }
}, {
  timestamps: false
});

const orderSchema = new Schema<OrderDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  shippingAddress: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'United States'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'cash_on_delivery']
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 });

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalAmount.toFixed(2)}`;
});

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to update order status
orderSchema.methods.updateStatus = async function(status: IOrder['status']): Promise<void> {
  this.status = status;
  
  // Set estimated delivery based on status
  if (status === 'shipped') {
    this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }
  
  await this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function(status: IOrder['paymentStatus']): Promise<void> {
  this.paymentStatus = status;
  await this.save();
};

// Method to add tracking number
orderSchema.methods.addTrackingNumber = async function(trackingNumber: string): Promise<void> {
  this.trackingNumber = trackingNumber;
  this.status = 'shipped';
  this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  await this.save();
};

// Method to calculate total
orderSchema.methods.calculateTotal = async function(): Promise<void> {
  this.totalAmount = this.items.reduce(
    (total: number, item: IOrderItem) => total + (item.price * item.quantity),
    0
  );
};

// Method to get formatted status
orderSchema.methods.getFormattedStatus = function(): string {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return statusMap[this.status] || this.status;
};

// Method to get formatted payment status
orderSchema.methods.getFormattedPaymentStatus = function(): string {
  const paymentStatusMap = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed'
  };
  return paymentStatusMap[this.paymentStatus] || this.paymentStatus;
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId })
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });
};

// Static method to find order by ID with user
orderSchema.statics.findByIdWithUser = function(orderId: string) {
  return this.findById(orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name images stock');
};

// Static method to get orders with filters (for admin)
orderSchema.statics.getFilteredOrders = function(filters: {
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}) {
  const query: any = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.userId) {
    query.user = filters.userId;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = filters.startDate;
    if (filters.endDate) query.createdAt.$lte = filters.endDate;
  }

  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  const statusStats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const paymentStats = await this.aggregate([
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    totalOrders: stats[0]?.totalOrders || 0,
    totalRevenue: stats[0]?.totalRevenue || 0,
    averageOrderValue: stats[0]?.averageOrderValue || 0,
    statusBreakdown: statusStats,
    paymentBreakdown: paymentStats
  };
};

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Order number will be generated by virtual
  }
  next();
});

export const Order = mongoose.model<OrderDocument>('Order', orderSchema);

// Type for creating new orders
export type CreateOrderInput = IOrderInput;

// Type for updating orders
export type UpdateOrderInput = Partial<{
  status: IOrder['status'];
  paymentStatus: IOrder['paymentStatus'];
  trackingNumber: string;
  estimatedDelivery: Date;
  notes: string;
}>;
