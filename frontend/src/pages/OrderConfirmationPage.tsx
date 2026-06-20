import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { APP_ROUTES } from '@/constants/routes';
import { checkoutApi } from '@/features/checkout/api/checkoutApi';
import { formatPrice } from '@/utils/formatters';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const email = sessionStorage.getItem('order_email') ?? '';

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => checkoutApi.getOrder(orderNumber!, email),
    enabled: !!orderNumber && !!email,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center pt-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Checkmark */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-green-600 text-3xl font-bold">✓</span>
      </div>

      <h1 className="font-heading text-3xl text-gray-900 mb-2">{t('orderConfirmation.heading')}</h1>
      <p className="text-gray-500 mb-8">
        {t('orderConfirmation.orderNumber')} <strong className="text-gray-900">{orderNumber}</strong>
      </p>

      {order && (
        <div className="bg-surface rounded-md border border-border p-6 text-left space-y-4 mb-8">
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.product_name}{' '}
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-border pt-3 flex justify-between font-semibold text-sm">
            <span>{t('orderConfirmation.total')}</span>
            <span className="text-primary-dark">{formatPrice(order.total_amount)}</span>
          </div>

          {/* Shipping address */}
          <div className="border-t border-border pt-3 text-sm text-gray-600 space-y-0.5">
            <p className="font-medium text-gray-900 mb-1">{t('orderConfirmation.shippingTo')}</p>
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.postal_code}
            </p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>
      )}

      <Button variant="secondary" onClick={() => navigate(APP_ROUTES.CATALOG)}>
        {t('orderConfirmation.continueShopping')}
      </Button>
    </div>
  );
}
