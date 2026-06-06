import client from '@/api/client';
import type { Cart } from '@/types/common';

export const cartApi = {
  getCart: () => client.get<Cart>('/api/cart').then((r) => r.data),
};
