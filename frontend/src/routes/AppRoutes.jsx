import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import HomePage from '../pages/public/HomePage';
import ProductsPage from '../pages/public/ProductsPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ContactPage from '../pages/public/ContactPage';
import DashboardPage from '../pages/user/DashboardPage';
import CartPage from '../pages/user/CartPage';
import CheckoutPage from '../pages/user/CheckoutPage';
import OrdersPage from '../pages/user/OrdersPage';
import OrderDetailPage from '../pages/user/OrderDetailPage';
import ProfilePage from '../pages/user/ProfilePage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import ManageProductsPage from '../pages/admin/ManageProductsPage';
import ManageCategoriesPage from '../pages/admin/ManageCategoriesPage';
import ManageOrdersPage from '../pages/admin/ManageOrdersPage';
import ManageUsersPage from '../pages/admin/ManageUsersPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><ManageProductsPage /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><ManageCategoriesPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><ManageOrdersPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
    </Routes>
  );
}

export default AppRoutes;
