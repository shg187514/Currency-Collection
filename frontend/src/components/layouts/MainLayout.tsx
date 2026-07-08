import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../providers/ThemeProvider';
import { Moon, Sun, Search, Menu, X } from 'lucide-react';
import { TreeSidebar } from '../../features/sidebar/TreeSidebar';
import { GlobalSearchModal } from '../../features/search/GlobalSearchModal';
import { useTreeStore } from '../../store/useTreeStore';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNodeMutations } from '../../hooks/useNodeMutations';
import { usePermissions } from '../../hooks/usePermissions';

export const MainLayout = () => {
  const { theme, setTheme } = useTheme();
  const { setIsSearchModalOpen } = useTreeStore();
  const { createMutation } = useNodeMutations();
  const { isAuthenticated } = useAuthStore();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Global Keyboard Shortcuts
  useHotkeys('meta+k, ctrl+k', (e) => {
    e.preventDefault();
    if (!hasPermission('search')) return;
    setIsSearchModalOpen(true);
  });

  useHotkeys('meta+shift+l, ctrl+shift+l', (e) => {
    e.preventDefault();
    setIsSidebarVisible(prev => !prev);
  });

  useHotkeys('meta+alt+n, ctrl+alt+n', (e) => {
    e.preventDefault();
    createMutation.mutate({ title: 'New Node', parentId: null });
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-950
          md:relative md:translate-x-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarVisible ? 'md:flex' : 'md:hidden'}
        `}
      >
        <TreeSidebar />
        {/* Mobile Close Button */}
        <button 
          className="md:hidden absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close Sidebar"
          title="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900 gap-4 transition-colors">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button 
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open Sidebar"
              title="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            {hasPermission('search') && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Search nodes"
                title="Search nodes (Ctrl+K)"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Search nodes...</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-sans text-xs shadow-sm">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-sans text-xs shadow-sm">K</kbd>
                </div>
              </button>
            )}
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors shrink-0 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
          </button>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-gray-950 relative">
          <Outlet />
        </main>
      </div>
      {hasPermission('search') && <GlobalSearchModal />}
    </div>
  );
};
