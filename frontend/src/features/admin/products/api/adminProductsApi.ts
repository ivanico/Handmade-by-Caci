import client from '@/api/client';

export interface ProductImage {
  id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface CategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compare_at_price: string | null;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category: CategoryRef | null;
  primary_image: ProductImage | null;
  images: ProductImage[];
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateProductData {
  name: string;
  category_id: number | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
}

export type UpdateProductData = Partial<CreateProductData>;

export const adminProductsApi = {
  list: (params?: { search?: string; page?: number; limit?: number }) =>
    client.get<PaginatedProducts>('/api/admin/products', { params }),

  getById: (id: number) =>
    client.get<Product>(`/api/admin/products/${id}`),

  create: (data: CreateProductData) =>
    client.post<Product>('/api/admin/products', data),

  update: (id: number, data: UpdateProductData) =>
    client.put<Product>(`/api/admin/products/${id}`, data),

  delete: (id: number) =>
    client.delete(`/api/admin/products/${id}`),

  addImages: (id: number, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return client.post<ProductImage[]>(`/api/admin/products/${id}/images`, form);
  },

  deleteImage: (productId: number, imageId: number) =>
    client.delete(`/api/admin/products/${productId}/images/${imageId}`),

  reorderImages: (productId: number, order: number[]) =>
    client.put(`/api/admin/products/${productId}/images/reorder`, { order }),
};

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const categoriesApi = {
  list: () => client.get<Category[]>('/api/categories'),
};
