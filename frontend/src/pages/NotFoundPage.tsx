import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="text-gray-400 mb-8">
          <FiSearch className="w-32 h-32 mx-auto" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn btn-primary btn-lg flex items-center justify-center"
          >
            <FiHome className="mr-2" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline btn-lg flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

