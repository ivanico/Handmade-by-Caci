import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

type Props = {
  filters: { search: string; status: string; sort: string };
  onSearch: (v: string) => void;
  onStatus: (s: string) => void;
  onSort: () => void;
};

export default function AdminOrderTableFilters({ filters, onSearch, onStatus, onSort }: Props) {
  const { t } = useTranslation();

  const TAB_LABELS: Record<string, string> = {
    '': t('admin.allOrders'),
    pending: t('admin.pending'),
    confirmed: t('admin.confirmed'),
    processing: t('admin.processing'),
    shipped: t('admin.shipped'),
    delivered: t('admin.delivered'),
    cancelled: t('admin.cancelled'),
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={t('admin.searchOrders')}
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onSort}>
          {filters.sort === 'newest' ? t('admin.newestFirst') : t('admin.oldestFirst')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onStatus(s)}
            className={
              filters.status === s
                ? 'bg-primary text-white rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-3 py-1 text-xs transition-colors duration-150'
            }
          >
            {TAB_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
