import type { Order } from '@/types/common';
import AdminOrderTableRow from './AdminOrderTable.Row';
import SkeletonRow from '@/components/ui/SkeletonRow';

type Props = {
  orders: Order[];
  isLoading: boolean;
  onRowClick: (id: number) => void;
};

export default function AdminOrderTable({ orders, isLoading, onRowClick }: Props) {
  return (
    <table className="w-full min-w-[640px] text-sm">
      <thead className="bg-gray-50 border-b border-border">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && orders.length === 0 && (
          <tr>
            <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
              No orders found.
            </td>
          </tr>
        )}
        {orders.map((o) => (
          <AdminOrderTableRow key={o.id} order={o} onClick={() => onRowClick(o.id)} />
        ))}
      </tbody>
    </table>
  );
}
