import { Routes, Route } from 'react-router-dom';
import GoogleAuthSuccess from '../pages/public/GoogleAuthSuccess';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/public/HomePage';
import ProductsPage from '../pages/public/ProductsPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ContactPage from '../pages/public/ContactPage';
import VerifyEmailPage from '../pages/public/VerifyEmailPage';
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
import ManageContactPage from '../pages/admin/ManageContactPage';
import ManageOffersPage from '../pages/admin/ManageOffersPage';
import SendEmailPage from '../pages/admin/SendEmailPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      {/* Protected User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* Admin Routes with Layout */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="contact" element={<ManageContactPage />} />
        <Route path="offers" element={<ManageOffersPage />} />
        <Route path="email" element={<SendEmailPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;