import client from '@/api/client';
import type { Category, PaginatedResponse, ProductListItem } from '@/types/common';

interface ProductQueryParams {
  featured?: boolean;
  sort?: string;
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export const catalogApi = {
  getCategories: () => client.get<Category[]>('/api/categories').then((r) => r.data),

  getProducts: (params?: ProductQueryParams) =>
    client
      .get<PaginatedResponse<ProductListItem>>('/api/products', { params })
      .then((r) => r.data),
};
