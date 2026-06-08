import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { APP_ROUTES } from '@/constants/routes';
import AdminOrderTable from '../components/AdminOrderTable';
import AdminOrderTableFilters from '../components/AdminOrderTable/AdminOrderTable.Filters';
import AdminOrderTablePagination from '../components/AdminOrderTable/AdminOrderTable.Pagination';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, filters, setSearch, setStatus, toggleSort, setPage } = useAdminOrders();

  function handleRowClick(id: number) {
    navigate(APP_ROUTES.ADMIN.ORDER_DETAIL(id), {
      state: { fromSearch: location.search },
    });
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-xl font-heading text-gray-900 mb-6">Orders</h1>

      <AdminOrderTableFilters
        filters={filters}
        onSearch={setSearch}
        onStatus={setStatus}
        onSort={toggleSort}
      />

      <div className="bg-white border border-border rounded-md overflow-x-auto shadow-sm mt-4">
        <AdminOrderTable
          orders={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      </div>

      {data && data.pages > 1 && (
        <AdminOrderTablePagination
          page={filters.page}
          pages={data.pages}
          onPage={setPage}
        />
      )}
    </div>
  );
}
