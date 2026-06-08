import client from '@/api/client';
import type { Cart } from '@/types/common';

export const cartApi = {
  getCart: () => client.get<Cart>('/api/cart').then((r) => r.data),

  addItem: (productId: number, quantity: number, variantId?: number | null) =>
    client
      .post<Cart>('/api/cart/items', {
        product_id: productId,
        variant_id: variantId ?? null,
        quantity,
      })
      .then((r) => r.data),

  updateItem: (productId: number, quantity: number) =>
    client.put<Cart>(`/api/cart/items/${productId}`, { quantity }).then((r) => r.data),

  removeItem: (productId: number) =>
    client.delete<Cart>(`/api/cart/items/${productId}`).then((r) => r.data),

  clearCart: () => client.delete<Cart>('/api/cart').then((r) => r.data),
};
