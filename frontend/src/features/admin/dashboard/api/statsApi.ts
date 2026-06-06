import client from '@/api/client';

export interface Stats {
  total_products: number;
  active_orders: number;
  low_stock_count: number;
  total_revenue: string;
}

export const statsApi = {
  getStats: () => client.get<Stats>('/api/admin/stats'),
};
