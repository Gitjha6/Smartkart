import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartAPI } from '@/services/api';
import { CartState, CartItem, Product } from '@/types';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: string, { rejectWithValue }) => {
    try {
      await cartAPI.removeFromCart(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartAPI.clearCart();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const validateCart = createAsyncThunk(
  'cart/validateCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.validateCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate cart');
    }
  }
);

// Initial state
const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  isLoading: false,
  error: null,
  isValidating: false,
  validationErrors: [],
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearValidationErrors: (state) => {
      state.validationErrors = [];
    },
    // Local cart operations (for immediate UI updates)
    addItemLocally: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.product.price;
      } else {
        state.items.push({
          product,
          quantity,
          totalPrice: quantity * product.price,
        });
      }
      
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
    },
    updateItemLocally: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product._id === productId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.product._id !== productId);
        } else {
          item.quantity = quantity;
          item.totalPrice = quantity * item.product.price;
        }
        
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      }
    },
    removeItemLocally: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product._id !== productId);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
    },
    clearCartLocally: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.totalItems = action.payload.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || state.items;
        state.totalAmount = action.payload.totalAmount || state.totalAmount;
        state.totalItems = action.payload.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || state.totalItems;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Cart Item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || state.items;
        state.totalAmount = action.payload.totalAmount || state.totalAmount;
        state.totalItems = action.payload.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || state.totalItems;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove from Cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const productId = action.payload;
        state.items = state.items.filter(item => item.product._id !== productId);
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Clear Cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.totalAmount = 0;
        state.totalItems = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Validate Cart
    builder
      .addCase(validateCart.pending, (state) => {
        state.isValidating = true;
        state.validationErrors = [];
      })
      .addCase(validateCart.fulfilled, (state, action) => {
        state.isValidating = false;
        state.validationErrors = action.payload.errors || [];
        state.items = action.payload.items || state.items;
        state.totalAmount = action.payload.totalAmount || state.totalAmount;
        state.totalItems = action.payload.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || state.totalItems;
      })
      .addCase(validateCart.rejected, (state, action) => {
        state.isValidating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearValidationErrors,
  addItemLocally,
  updateItemLocally,
  removeItemLocally,
  clearCartLocally,
} = cartSlice.actions;

export default cartSlice.reducer;
