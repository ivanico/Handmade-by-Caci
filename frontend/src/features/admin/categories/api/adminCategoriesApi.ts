import client from '@/api/client';

export interface Category {
  id: number;
  name: string;
  name_mk?: string | null;
  slug: string;
  description: string | null;
  description_mk?: string | null;
  image_url: string | null;
  parent_id: number | null;
  is_active: boolean;
  product_count: number;
}

export interface CreateCategoryData {
  name: string;
  name_mk?: string | null;
  description: string | null;
  description_mk?: string | null;
}

export interface UpdateCategoryData {
  name?: string;
  name_mk?: string | null;
  description?: string | null;
  description_mk?: string | null;
  is_active?: boolean;
}

export const adminCategoriesApi = {
  list: () => client.get<Category[]>('/api/categories'),

  create: (data: CreateCategoryData) =>
    client.post<Category>('/api/admin/categories', data),

  update: (id: number, data: UpdateCategoryData) =>
    client.put<Category>(`/api/admin/categories/${id}`, data),

  delete: (id: number) =>
    client.delete(`/api/admin/categories/${id}`),

  uploadImage: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client.post<{ image_url: string }>(
      `/api/admin/categories/${id}/image`,
      form,
    );
  },
};
