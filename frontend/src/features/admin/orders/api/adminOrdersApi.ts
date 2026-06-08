import client from '@/api/client';
import type { Order, PaginatedResponse } from '@/types/common';

export interface AdminOrdersParams {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const adminOrdersApi = {
  list: (params: AdminOrdersParams) =>
    client.get<PaginatedResponse<Order>>('/api/admin/orders', { params }),

  getById: (id: number) =>
    client.get<Order>(`/api/admin/orders/${id}`),

  updateStatus: (id: number, data: { status?: string; payment_status?: string; notes?: string }) =>
    client.put<Order>(`/api/admin/orders/${id}/status`, data),
};
