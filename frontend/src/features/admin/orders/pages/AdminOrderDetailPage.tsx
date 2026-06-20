import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminOrdersApi } from '../api/adminOrdersApi';
import { APP_ROUTES } from '@/constants/routes';
import { useUiStore } from '@/store/uiStore';
import { formatPrice } from '@/utils/formatters';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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

const SELECT_CLASSES =
  'border border-border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary';

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  const backSearch = (location.state as { fromSearch?: string })?.fromSearch ?? '';

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminOrdersApi.getById(Number(id)).then((r) => r.data),
    enabled: !!id,
  });

  const [editState, setEditState] = useState({
    status: '',
    payment_status: '',
    notes: '',
  });

  useEffect(() => {
    if (order) {
      setEditState({
        status: order.status,
        payment_status: order.payment_status,
        notes: order.notes ?? '',
      });
    }
  }, [order]);

  const mutation = useMutation({
    mutationFn: () => adminOrdersApi.updateStatus(Number(id), editState),
    onSuccess: () => {
      showToast(t('admin.orderUpdated'));
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
    },
    onError: () => {
      showToast(t('admin.failedUpdateOrder'), 'error');
    },
  });

  if (isLoading) {
    return <div className="p-8 text-gray-500">{t('admin.loading')}</div>;
  }

  if (!order) {
    return <div className="p-8 text-gray-500">{t('admin.orderNotFound')}</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Back link */}
      <Link
        to={APP_ROUTES.ADMIN.ORDERS + backSearch}
        className="text-sm text-primary-dark hover:underline mb-6 inline-block"
      >
        {t('admin.backToOrders')}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-heading text-gray-900">{order.order_number}</h1>
        <Badge variant={statusVariant[order.status] ?? 'muted'}>{order.status}</Badge>
        <Badge variant={paymentVariant[order.payment_status] ?? 'muted'}>
          {order.payment_status}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Section 1 — Customer Info */}
        <section className="bg-surface border border-border rounded-md p-5">
          <h2 className="font-heading text-lg text-gray-900 mb-3">{t('admin.customer')}</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
            <div>
              <dt className="text-gray-500">{t('admin.nameLabel')}</dt>
              <dd className="text-gray-900 font-medium">{order.customer_name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('admin.emailLabel')}</dt>
              <dd className="text-gray-900">{order.customer_email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('admin.phoneLabel')}</dt>
              <dd className="text-gray-900">{order.customer_phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('admin.shippingAddress')}</dt>
              <dd className="text-gray-900">
                <span>{order.shipping_address.line1}</span>
                {order.shipping_address.line2 && (
                  <>, {order.shipping_address.line2}</>
                )}
                <br />
                {order.shipping_address.city}, {order.shipping_address.postal_code}
                <br />
                {order.shipping_address.country}
              </dd>
            </div>
          </dl>
        </section>

        {/* Section 2 — Items */}
        <section className="bg-white border border-border rounded-md overflow-hidden shadow-sm">
          <h2 className="font-heading text-lg text-gray-900 px-5 py-3 border-b border-border">
            {t('admin.itemsHeading')}
          </h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.nameLabel')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.sku')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.unitPrice')}</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t('admin.qty')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.subtotal')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-gray-900">{item.product_name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.product_sku}</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatPrice(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatPrice(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-border bg-gray-50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900 text-sm">
                  {t('admin.total')}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-primary-dark">
                  {formatPrice(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Section 3 — Edit */}
        <section className="bg-surface border border-border rounded-md p-5">
          <h2 className="font-heading text-lg text-gray-900 mb-4">{t('admin.updateOrder')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.statusLabel')}</label>
              <select
                className={SELECT_CLASSES}
                value={editState.status}
                onChange={(e) => setEditState((s) => ({ ...s, status: e.target.value }))}
              >
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((v) => (
                  <option key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.paymentStatus')}</label>
              <select
                className={SELECT_CLASSES}
                value={editState.payment_status}
                onChange={(e) => setEditState((s) => ({ ...s, payment_status: e.target.value }))}
              >
                {['unpaid', 'paid', 'refunded'].map((v) => (
                  <option key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.notesLabel')}</label>
            <textarea
              className={SELECT_CLASSES}
              rows={3}
              value={editState.notes}
              onChange={(e) => setEditState((s) => ({ ...s, notes: e.target.value }))}
              placeholder={t('admin.internalNotes')}
            />
          </div>
          <Button
            variant="primary"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {t('admin.saveChanges')}
          </Button>
        </section>
      </div>
    </div>
  );
}
