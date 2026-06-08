import client from '@/api/client';
import type { ProductDetail } from '@/types/common';

export const productApi = {
  getProduct: (slug: string) =>
    client.get<ProductDetail>(`/api/products/${slug}`).then((r) => r.data),
};
