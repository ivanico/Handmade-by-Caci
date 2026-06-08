import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const TAB_LABELS: Record<string, string> = {
  '': 'All',
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

type Props = {
  filters: { search: string; status: string; sort: string };
  onSearch: (v: string) => void;
  onStatus: (s: string) => void;
  onSort: () => void;
};

export default function AdminOrderTableFilters({ filters, onSearch, onStatus, onSort }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder="Search order #, customer, email…"
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onSort}>
          {filters.sort === 'newest' ? 'Newest ↑' : 'Oldest ↑'}
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
