import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import Toast from '@/components/ui/Toast';
import CartDrawer from '@/features/cart/components/CartDrawer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <Toast />
      <CartDrawer />
    </div>
  );
}
