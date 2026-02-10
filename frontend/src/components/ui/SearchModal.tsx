import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeModal, setSearchQuery, addRecentSearch } from '@/store/slices/uiSlice';
import { searchProducts } from '@/store/slices/productsSlice';
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';

const SearchModal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { search } = useAppSelector((state) => state.ui);
  const { searchResults, isSearching } = useAppSelector((state) => state.products);
  
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        dispatch(searchProducts({ query: query.trim() }));
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [query, dispatch]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      dispatch(setSearchQuery(searchQuery));
      dispatch(addRecentSearch(searchQuery));
      dispatch(closeModal('search'));
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClose = () => {
    dispatch(closeModal('search'));
  };

  const popularSearches = [
    'electronics', 'clothing', 'books', 'home & garden',
    'sports', 'beauty', 'toys', 'automotive'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Search Products</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus-ring"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="p-4 border-b">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for products..."
              className="input w-full pl-10 pr-4"
              autoFocus
            />
          </div>
        </form>

        {/* Search Results & Suggestions */}
        <div className="max-h-64 overflow-y-auto">
          {query.trim() && (
            <div className="p-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading-spinner w-6 h-6"></div>
                  <span className="ml-2 text-gray-500">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.slice(0, 5).map((product) => (
                    <button
                      key={product._id}
                      onClick={() => {
                        dispatch(closeModal('search'));
                        navigate(`/products/${product._id}`);
                      }}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg w-full text-left"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                  {searchResults.length > 5 && (
                    <button
                      onClick={() => handleSearch(query)}
                      className="w-full text-center py-2 text-sm text-primary hover:bg-gray-50 rounded-lg"
                    >
                      View all {searchResults.length} results
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found for "{query}"</p>
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && !query.trim() && (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {search.recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <FiClock className="w-4 h-4 mr-2" />
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {search.recentSearches.slice(0, 5).map((recentSearch, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(recentSearch)}
                        className="flex items-center w-full p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        <FiSearch className="w-4 h-4 mr-3 text-gray-400" />
                        {recentSearch}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((searchTerm) => (
                    <button
                      key={searchTerm}
                      onClick={() => handleSearch(searchTerm)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {searchTerm}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

