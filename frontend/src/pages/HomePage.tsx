import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchFeaturedProducts, fetchNewArrivals, fetchCategories } from '@/store/slices/productsSlice';
import { FiArrowRight, FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { featuredProducts, newArrivals, categories, isLoading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchCategories());
  }, [dispatch]);

  const heroCategories = [
    { name: 'Electronics', image: '/images/categories/electronics.jpg', path: '/products?category=electronics' },
    { name: 'Fashion', image: '/images/categories/fashion.jpg', path: '/products?category=fashion' },
    { name: 'Home & Garden', image: '/images/categories/home.jpg', path: '/products?category=home' },
    { name: 'Sports', image: '/images/categories/sports.jpg', path: '/products?category=sports' },
  ];

  const ProductCard = ({ product }: { product: any }) => (
    <div className="product-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <FiHeart className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <FiShoppingCart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-warning text-warning-700 text-xs px-2 py-1 rounded-full">
            Low Stock
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'star' : 'star-empty'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">({product.numReviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className={`stock-status ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Welcome to <span className="text-secondary">SmartKart</span>
              </h1>
              <p className="text-xl text-gray-100 leading-relaxed">
                Discover amazing products at unbeatable prices. Shop the latest trends 
                in electronics, fashion, home & garden, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn btn-secondary btn-lg flex items-center justify-center"
                >
                  Shop Now
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/deals"
                  className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary"
                >
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/images/hero-shopping.jpg"
                alt="Shopping"
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of categories and find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {heroCategories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-responsive">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked products for you</p>
            </div>
            <Link
              to="/products"
              className="btn btn-outline flex items-center"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-products">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-products">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="container-responsive">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-600">Latest products just in</p>
            </div>
            <Link
              to="/products?sort=newest"
              className="btn btn-outline flex items-center"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-products">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-products">
              {newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container-responsive text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust SmartKart for their shopping needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn btn-secondary btn-lg"
            >
              Browse Products
            </Link>
            <Link
              to="/register"
              className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

