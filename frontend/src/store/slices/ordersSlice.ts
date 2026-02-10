import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersAPI } from '@/services/api';
import { OrdersState, Order, CreateOrderData, UpdateOrderStatusData } from '@/types';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params?: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrders(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrderById(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.createOrder(orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, statusData }: { orderId: string; statusData: UpdateOrderStatusData }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, statusData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.cancelOrder(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  'orders/createPaymentIntent',
  async ({ orderId, paymentMethod }: { orderId: string; paymentMethod: string }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.createPaymentIntent(orderId, paymentMethod);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment intent');
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'orders/confirmPayment',
  async ({ orderId, paymentIntentId }: { orderId: string; paymentIntentId: string }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.confirmPayment(orderId, paymentIntentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm payment');
    }
  }
);

export const fetchOrderStats = createAsyncThunk(
  'orders/fetchOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrderStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order stats');
    }
  }
);

// Initial state
const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  orderStats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: '',
    dateRange: {
      start: null,
      end: null,
    },
  },
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  paymentIntent: null,
};

// Orders slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },
    setFilters: (state, action: PayloadAction<Partial<typeof state.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        dateRange: {
          start: null,
          end: null,
        },
      };
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<Partial<typeof state.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.currentOrder?._id === action.payload._id) {
        state.currentOrder = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedOrder = action.payload;
        
        // Update in orders list
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        
        // Update current order if it's the same
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isUpdating = false;
        const cancelledOrder = action.payload;
        
        // Update in orders list
        const index = state.orders.findIndex(order => order._id === cancelledOrder._id);
        if (index !== -1) {
          state.orders[index] = cancelledOrder;
        }
        
        // Update current order if it's the same
        if (state.currentOrder?._id === cancelledOrder._id) {
          state.currentOrder = cancelledOrder;
        }
        
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Create Payment Intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentIntent = action.payload;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Confirm Payment
    builder
      .addCase(confirmPayment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedOrder = action.payload;
        
        // Update in orders list
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        
        // Update current order if it's the same
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        
        state.paymentIntent = null;
        state.error = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch Order Stats
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderStats = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentOrder,
  clearPaymentIntent,
  setFilters,
  clearFilters,
  setPagination,
  addOrder,
  updateOrderInList,
} = ordersSlice.actions;

export default ordersSlice.reducer;
