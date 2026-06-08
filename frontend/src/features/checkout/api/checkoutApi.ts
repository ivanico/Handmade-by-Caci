import client from '@/api/client';
import type { Order } from '@/types/common';

export interface CheckoutPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  notes?: string;
}

export const checkoutApi = {
  placeOrder: (data: CheckoutPayload) =>
    client.post<Order>('/api/orders', data).then((r) => r.data),

  getOrder: (orderNumber: string, email: string) =>
    client
      .get<Order>(`/api/orders/${orderNumber}`, { params: { email } })
      .then((r) => r.data),
};
