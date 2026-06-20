import { useTranslation } from 'react-i18next';
import type { Order } from '@/types/common';
import AdminOrderTableRow from './AdminOrderTable.Row';
import SkeletonRow from '@/components/ui/SkeletonRow';

type Props = {
  orders: Order[];
  isLoading: boolean;
  onRowClick: (id: number) => void;
};

export default function AdminOrderTable({ orders, isLoading, onRowClick }: Props) {
  const { t } = useTranslation();
  return (
    <table className="w-full min-w-[640px] text-sm">
      <thead className="bg-gray-50 border-b border-border">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orderNumber')}</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.customer')}</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.emailCol')}</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.date')}</th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('admin.items')}</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.total')}</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.payment')}</th>
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && orders.length === 0 && (
          <tr>
            <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
              {t('admin.noOrders')}
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
