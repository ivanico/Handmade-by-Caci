import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '@/routes/AuthProvider';
import ProtectedRoute from '@/routes/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import AdminLayout from '@/layouts/AdminLayout';
import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/features/catalog/pages/HomePage';
import DashboardPage from '@/features/admin/dashboard/DashboardPage';
import AdminProductsPage from '@/features/admin/products/pages/AdminProductsPage';
import AdminProductFormPage from '@/features/admin/products/pages/AdminProductFormPage';
import AdminCategoriesPage from '@/features/admin/categories/pages/AdminCategoriesPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<div className="p-8">Catalog — coming soon</div>} />
              <Route path="/products/:slug" element={<div className="p-8">Product — coming soon</div>} />
              <Route path="/checkout" element={<div className="p-8">Checkout — coming soon</div>} />
              <Route path="/order-confirmation/:orderNumber" element={<div className="p-8">Confirmation — coming soon</div>} />
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
                <Route path="/admin/*" element={<DashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
