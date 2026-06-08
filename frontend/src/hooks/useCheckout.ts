import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { APP_ROUTES } from '@/constants/routes';
import { checkoutApi, type CheckoutPayload } from '@/features/checkout/api/checkoutApi';

export function useCheckout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function placeOrder(data: CheckoutPayload) {
    setIsSubmitting(true);
    setError('');
    try {
      const order = await checkoutApi.placeOrder(data);
      sessionStorage.setItem('order_email', data.customer_email);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate(APP_ROUTES.ORDER_CONFIRMATION(order.order_number));
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { placeOrder, error, isSubmitting };
}
