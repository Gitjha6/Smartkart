// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Product related types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  reviews: Review[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  user: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
  inStock?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  stock: number;
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
}

// Cart related types
export interface CartItem {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Cart {
  id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartInput {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemInput {
  productId: string;
  quantity: number;
}

// Order related types
export interface OrderItem {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  orderNumber: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export interface UpdateOrderStatusInput {
  status: Order['status'];
  trackingNumber?: string;
  notes?: string;
}

// Wishlist related types
export interface Wishlist {
  id: string;
  user: string;
  products: Product[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistInput {
  productId: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Payment types
export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentConfirmInput {
  paymentIntentId: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// UI types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  type: string;
  data?: any;
}

// Filter types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Search types
export interface SearchResult {
  products: Product[];
  total: number;
  query: string;
}

// Dashboard types (for admin)
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  paymentBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

// File upload types
export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Cart validation types
export interface CartValidationResult {
  isValid: boolean;
  validationResults: Array<{
    productId: string;
    name: string;
    valid: boolean;
    error?: string;
    availableStock?: number;
    oldPrice?: number;
    newPrice?: number;
  }>;
}

// Route types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  adminOnly?: boolean;
}

// Component props types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Redux store types
export interface RootState {
  auth: AuthState;
  cart: CartState;
  products: ProductsState;
  orders: OrdersState;
  wishlist: WishlistState;
  ui: UIState;
}

export interface CartState extends LoadingState {
  cart: Cart | null;
  itemCount: number;
  totalAmount: number;
}

export interface ProductsState extends LoadingState {
  products: Product[];
  featuredProducts: Product[];
  newArrivals: Product[];
  categories: string[];
  brands: string[];
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrdersState extends LoadingState {
  orders: Order[];
  currentOrder: Order | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WishlistState extends LoadingState {
  wishlist: Wishlist | null;
  productCount: number;
}

export interface UIState {
  modal: ModalState;
  notifications: Notification[];
  sidebar: {
    isOpen: boolean;
  };
  theme: 'light' | 'dark';
}
