import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { wishlistAPI } from '@/services/api';
import { WishlistState, Product } from '@/types';

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlist();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.addToWishlist(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await wishlistAPI.clearWishlist();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
    }
  }
);

// Initial state
const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null,
};

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Local wishlist operations (for immediate UI updates)
    addItemLocally: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item._id === product._id);
      
      if (!existingItem) {
        state.items.push(product);
        state.totalItems = state.items.length;
      }
    },
    removeItemLocally: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      state.totalItems = state.items.length;
    },
    clearWishlistLocally: (state) => {
      state.items = [];
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products || [];
        state.totalItems = state.items.length;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to Wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products || state.items;
        state.totalItems = state.items.length;
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove from Wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        const productId = action.payload;
        state.items = state.items.filter(item => item._id !== productId);
        state.totalItems = state.items.length;
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Clear Wishlist
    builder
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.totalItems = 0;
        state.error = null;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  addItemLocally,
  removeItemLocally,
  clearWishlistLocally,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
