import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types/common';

type Variant = 'success' | 'error' | 'warning' | 'info' | 'muted';

const statusVariant: Record<string, Variant> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

const paymentVariant: Record<string, Variant> = {
  unpaid: 'error',
  paid: 'success',
  refunded: 'muted',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ` +
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  );
}

type Props = {
  order: Order;
  onClick: () => void;
};

export default function AdminOrderTableRow({ order, onClick }: Props) {
  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={onClick}>
      <td className="px-4 py-3 font-medium text-primary-dark">{order.order_number}</td>
      <td className="px-4 py-3 text-gray-900">{order.customer_name}</td>
      <td className="px-4 py-3 text-gray-500 text-sm">{order.customer_email}</td>
      <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
        {formatDate(order.created_at)}
      </td>
      <td className="px-4 py-3 text-gray-500 text-center">{order.items.length}</td>
      <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{formatPrice(order.total_amount)}</td>
      <td className="px-4 py-3">
        <Badge variant={statusVariant[order.status] ?? 'muted'}>{order.status}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={paymentVariant[order.payment_status] ?? 'muted'}>
          {order.payment_status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          View
        </Button>
      </td>
    </tr>
  );
}
