import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsAPI } from '@/services/api';
import { ProductsState, Product, ProductFilters, PaginationParams } from '@/types';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: PaginationParams & ProductFilters, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProducts(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProductById(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchParams: { query: string; filters?: ProductFilters; pagination?: PaginationParams }, { rejectWithValue }) => {
    try {
      const response = await productsAPI.searchProducts(searchParams);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search products');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (params: { category: string; filters?: ProductFilters; pagination?: PaginationParams }, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProductsByCategory(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products by category');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getFeaturedProducts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getNewArrivals();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch new arrivals');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getBrands();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch brands');
    }
  }
);

// Initial state
const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  newArrivals: [],
  categories: [],
  brands: [],
  currentProduct: null,
  filters: {
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 0,
    rating: 0,
    inStock: false,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  searchQuery: '',
  isLoading: false,
  error: null,
  isSearching: false,
  searchResults: [],
};

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        rating: 0,
        inStock: false,
      };
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationParams>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },
    addToWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const product = state.products.find(p => p._id === productId);
      if (product) {
        product.isInWishlist = true;
      }
      if (state.currentProduct?._id === productId) {
        state.currentProduct.isInWishlist = true;
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const product = state.products.find(p => p._id === productId);
      if (product) {
        product.isInWishlist = false;
      }
      if (state.currentProduct?._id === productId) {
        state.currentProduct.isInWishlist = false;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Fetch Products by Category
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Featured Products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload.products || [];
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch New Arrivals
    builder
      .addCase(fetchNewArrivals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.newArrivals = action.payload.products || [];
        state.error = null;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories || [];
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Brands
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload.brands || [];
        state.error = null;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  setPagination,
  setSearchQuery,
  clearSearch,
  addToWishlist,
  removeFromWishlist,
} = productsSlice.actions;

export default productsSlice.reducer;
