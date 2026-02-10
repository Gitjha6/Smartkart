import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, ModalType, NotificationType } from '@/types';

// Initial state
const initialState: UIState = {
  // Modal states
  modals: {
    cart: false,
    wishlist: false,
    search: false,
    filter: false,
    productQuickView: false,
    login: false,
    register: false,
    forgotPassword: false,
    payment: false,
    orderConfirmation: false,
  },
  
  // Loading states
  loading: {
    page: false,
    search: false,
    filter: false,
    cart: false,
    wishlist: false,
    checkout: false,
    payment: false,
  },
  
  // Sidebar states
  sidebar: {
    isOpen: false,
    type: null,
  },
  
  // Search states
  search: {
    isOpen: false,
    query: '',
    suggestions: [],
    recentSearches: [],
  },
  
  // Filter states
  filters: {
    isOpen: false,
    appliedFilters: {},
  },
  
  // Notifications
  notifications: [],
  
  // Theme
  theme: 'light',
  
  // Mobile menu
  mobileMenu: {
    isOpen: false,
  },
  
  // Scroll position
  scrollPosition: 0,
  
  // Toast notifications
  toasts: [],
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action: PayloadAction<ModalType>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<ModalType>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as ModalType] = false;
      });
    },
    
    // Loading actions
    setLoading: (state, action: PayloadAction<{ key: keyof typeof state.loading; value: boolean }>) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.page = action.payload;
    },
    
    // Sidebar actions
    openSidebar: (state, action: PayloadAction<{ type: string }>) => {
      state.sidebar.isOpen = true;
      state.sidebar.type = action.payload.type;
    },
    closeSidebar: (state) => {
      state.sidebar.isOpen = false;
      state.sidebar.type = null;
    },
    
    // Search actions
    openSearch: (state) => {
      state.search.isOpen = true;
    },
    closeSearch: (state) => {
      state.search.isOpen = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
    },
    setSearchSuggestions: (state, action: PayloadAction<string[]>) => {
      state.search.suggestions = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload;
      const recentSearches = state.search.recentSearches.filter(s => s !== query);
      recentSearches.unshift(query);
      state.search.recentSearches = recentSearches.slice(0, 10); // Keep only last 10
    },
    clearRecentSearches: (state) => {
      state.search.recentSearches = [];
    },
    
    // Filter actions
    openFilters: (state) => {
      state.filters.isOpen = true;
    },
    closeFilters: (state) => {
      state.filters.isOpen = false;
    },
    setAppliedFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters.appliedFilters = action.payload;
    },
    clearAppliedFilters: (state) => {
      state.filters.appliedFilters = {};
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<NotificationType>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Mobile menu actions
    openMobileMenu: (state) => {
      state.mobileMenu.isOpen = true;
    },
    closeMobileMenu: (state) => {
      state.mobileMenu.isOpen = false;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenu.isOpen = !state.mobileMenu.isOpen;
    },
    
    // Scroll position
    setScrollPosition: (state, action: PayloadAction<number>) => {
      state.scrollPosition = action.payload;
    },
    
    // Toast actions
    addToast: (state, action: PayloadAction<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      state.toasts.push(action.payload);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Reset UI state
    resetUI: (state) => {
      state.modals = initialState.modals;
      state.loading = initialState.loading;
      state.sidebar = initialState.sidebar;
      state.search = initialState.search;
      state.filters = initialState.filters;
      state.notifications = [];
      state.mobileMenu = initialState.mobileMenu;
      state.toasts = [];
    },
  },
});

export const {
  // Modal actions
  openModal,
  closeModal,
  closeAllModals,
  
  // Loading actions
  setLoading,
  setPageLoading,
  
  // Sidebar actions
  openSidebar,
  closeSidebar,
  
  // Search actions
  openSearch,
  closeSearch,
  setSearchQuery,
  setSearchSuggestions,
  addRecentSearch,
  clearRecentSearches,
  
  // Filter actions
  openFilters,
  closeFilters,
  setAppliedFilters,
  clearAppliedFilters,
  
  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Theme actions
  setTheme,
  toggleTheme,
  
  // Mobile menu actions
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  
  // Scroll position
  setScrollPosition,
  
  // Toast actions
  addToast,
  removeToast,
  clearToasts,
  
  // Reset
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
