import { useQuery } from '@tanstack/react-query';
import { statsApi, type Stats } from './api/statsApi';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => statsApi.getStats().then((r) => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="p-8 text-gray-500">Loading…</div>;
  if (isError || !data) return <div className="p-8 text-red-500">Failed to load stats.</div>;

  const cards = [
    { label: 'Total Products', value: data.total_products },
    { label: 'Active Orders', value: data.active_orders },
    { label: 'Low Stock Items', value: data.low_stock_count },
    { label: 'Total Revenue', value: `$${Number(data.total_revenue).toFixed(2)}` },
  ];

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} />
        ))}
      </div>
    </div>
  );
}
