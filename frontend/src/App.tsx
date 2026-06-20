import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '@/routes/AuthProvider';
import ProtectedRoute from '@/routes/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import AdminLayout from '@/layouts/AdminLayout';
import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/features/catalog/pages/HomePage';
import CatalogPage from '@/features/catalog/pages/CatalogPage';
import ProductDetailPage from '@/features/catalog/pages/ProductDetailPage';
import CheckoutPage from '@/features/checkout/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import DashboardPage from '@/features/admin/dashboard/DashboardPage';
import AdminProductsPage from '@/features/admin/products/pages/AdminProductsPage';
import AdminProductFormPage from '@/features/admin/products/pages/AdminProductFormPage';
import AdminCategoriesPage from '@/features/admin/categories/pages/AdminCategoriesPage';
import AdminOrdersPage from '@/features/admin/orders/pages/AdminOrdersPage';
import AdminOrderDetailPage from '@/features/admin/orders/pages/AdminOrderDetailPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute role="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/products/new" element={<AdminProductFormPage />} />
                <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
                <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="/admin/*" element={<DashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
