import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';
import SearchModal from '../ui/SearchModal';
import FilterModal from '../ui/FilterModal';
import { useAppSelector } from '@/store/hooks';
import { closeAllModals } from '@/store/slices/uiSlice';

const Layout: React.FC = () => {
  const { modals, sidebar, mobileMenu } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Sidebar */}
      {sidebar.isOpen && <Sidebar />}
      
      {/* Mobile Menu */}
      {mobileMenu.isOpen && <MobileMenu />}
      
      {/* Modals */}
      {modals.search && <SearchModal />}
      {modals.filter && <FilterModal />}
      
      {/* Backdrop for modals */}
      {(modals.search || modals.filter || sidebar.isOpen || mobileMenu.isOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => closeAllModals()}
        />
      )}
    </div>
  );
};

export default Layout;

