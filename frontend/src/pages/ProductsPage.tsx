import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProducts, setFilters, setPagination } from '@/store/slices/productsSlice';
import { openModal } from '@/store/slices/uiSlice';
import { FiFilter, FiGrid, FiList, FiChevronDown, FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { products, pagination, filters, isLoading } = useAppSelector((state) => state.products);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '1';
    
    const filterParams = {
      page: parseInt(page),
      limit: 12,
      ...(search && { search }),
      ...(category && { category }),
    };
    
    dispatch(setFilters(filterParams));
    dispatch(fetchProducts(filterParams));
  }, [searchParams, dispatch]);

  const handleFilterClick = () => {
    dispatch(openModal('filter'));
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Apply sorting logic here
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

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

  const ProductListItem = ({ product }: { product: any }) => (
    <div className="product-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex space-x-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-24 h-24 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
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
        <div className="flex flex-col space-y-2">
          <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border">
            <FiHeart className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border">
            <FiShoppingCart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">
            {pagination.total} products found
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFilterClick}
                className="btn btn-outline flex items-center"
              >
                <FiFilter className="mr-2" />
                Filters
              </button>
              <span className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-products' : 'space-y-4'}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-products' : 'space-y-4'}>
              {products.map((product) => (
                viewMode === 'grid' ? (
                  <ProductCard key={product._id} product={product} />
                ) : (
                  <ProductListItem key={product._id} product={product} />
                )
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrent = page === pagination.page;
                    const isNearCurrent = Math.abs(page - pagination.page) <= 2;
                    
                    if (isCurrent || isNearCurrent || page === 1 || page === pagination.totalPages) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-outline'}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === 2 || page === pagination.totalPages - 1) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiGrid className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

