import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { APP_ROUTES } from '@/constants/routes';
import { cartApi } from '@/features/cart/api/cartApi';
import { useCheckout } from '@/hooks/useCheckout';
import Spinner from '@/components/ui/Spinner';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';

export default function CheckoutPage() {
  const { data: cart, isLoading } = useQuery({ queryKey: ['cart'], queryFn: cartApi.getCart });
  const { placeOrder, error, isSubmitting } = useCheckout();
  const { t } = useTranslation();

  if (isLoading) return <div className="flex justify-center pt-24"><Spinner size="lg" /></div>;
  if (!cart || cart.items.length === 0) return <Navigate to={APP_ROUTES.CATALOG} replace />;

  const hasStockIssue = cart.items.some((i) => i.available_quantity < i.quantity);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 overflow-x-hidden">
      <h1 className="font-heading text-3xl text-gray-900 mb-8">{t('checkout.title')}</h1>
      {hasStockIssue && (
        <div className="mb-6 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          {t('checkout.stockWarning')}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <CheckoutForm onSubmit={placeOrder} isSubmitting={isSubmitting} error={error} />
        <OrderSummary cart={cart} />
      </div>
    </div>
  );
}
