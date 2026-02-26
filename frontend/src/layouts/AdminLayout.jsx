import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderTree, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Store
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then fallback to system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navigateToStore = () => {
    navigate('/');
    toast.info('Switched to customer view');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
    { icon: MessageSquare, label: 'Contact Messages', path: '/admin/contact' },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-20'
          } bg-gradient-to-b from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 text-white transition-all duration-300 ease-in-out shadow-2xl flex flex-col`}
        >
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            {isSidebarOpen && (
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 shadow-lg scale-105'
                      : 'hover:bg-white/10 hover:translate-x-1'
                  }`}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <Icon size={22} className="min-w-[22px]" />
                  {isSidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={navigateToStore}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all duration-200"
              title={!isSidebarOpen ? 'View Store' : ''}
            >
              <Store size={22} />
              {isSidebarOpen && <span className="font-medium">View Store</span>}
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200"
              title={!isSidebarOpen ? 'Toggle Theme' : ''}
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
              {isSidebarOpen && (
                <span className="font-medium">
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all duration-200"
              title={!isSidebarOpen ? 'Logout' : ''}
            >
              <LogOut size={22} />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;