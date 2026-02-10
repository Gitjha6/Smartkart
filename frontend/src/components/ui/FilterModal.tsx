import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeModal, setAppliedFilters } from '@/store/slices/uiSlice';
import { setFilters } from '@/store/slices/productsSlice';
import { FiX, FiFilter, FiDollarSign, FiStar } from 'react-icons/fi';

const FilterModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, brands } = useAppSelector((state) => state.products);
  const { filters } = useAppSelector((state) => state.ui);

  const [localFilters, setLocalFilters] = useState({
    category: filters.appliedFilters.category || '',
    brand: filters.appliedFilters.brand || '',
    minPrice: filters.appliedFilters.minPrice || '',
    maxPrice: filters.appliedFilters.maxPrice || '',
    rating: filters.appliedFilters.rating || '',
    inStock: filters.appliedFilters.inStock || false,
  });

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, value]) => 
        value !== '' && value !== false && value !== null
      )
    );
    
    dispatch(setAppliedFilters(cleanFilters));
    dispatch(setFilters(cleanFilters));
    dispatch(closeModal('filter'));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
    });
    dispatch(setAppliedFilters({}));
    dispatch(setFilters({}));
  };

  const handleClose = () => {
    dispatch(closeModal('filter'));
  };

  const ratingOptions = [
    { value: '4', label: '4★ & above' },
    { value: '3', label: '3★ & above' },
    { value: '2', label: '2★ & above' },
    { value: '1', label: '1★ & above' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <FiFilter className="mr-2" />
            Filters
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus-ring"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6 max-h-64 overflow-y-auto">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input w-full"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Brand</h3>
            <select
              value={localFilters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="input w-full"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FiDollarSign className="mr-1" />
              Price Range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FiStar className="mr-1" />
              Rating
            </h3>
            <select
              value={localFilters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="input w-full"
            >
              <option value="">Any Rating</option>
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock Filter */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localFilters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                In Stock Only
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t space-y-3">
          <button
            onClick={handleApplyFilters}
            className="btn btn-primary w-full"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="btn btn-outline w-full"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;

