import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminProductsApi } from '../api/adminProductsApi';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', debouncedSearch, page],
    queryFn: () =>
      adminProductsApi
        .list({ search: debouncedSearch || undefined, page })
        .then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-products'] });

  const handleToggle = async (id: number, current: boolean) => {
    await adminProductsApi.update(id, { is_active: !current });
    invalidate();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    await adminProductsApi.delete(id);
    invalidate();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + New Product
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-14"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
            {data?.items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div
                    style={{ width: 48, height: 48 }}
                    className="rounded border border-gray-200 overflow-hidden bg-gray-100 shrink-0"
                  >
                    {p.primary_image && (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${p.primary_image.url}`}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="hover:text-blue-600"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-900">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">{p.stock_quantity}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      'px-2 py-0.5 rounded-full text-xs font-medium ' +
                      (p.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500')
                    }
                  >
                    {p.is_active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggle(p.id, p.is_active)}
                      className="text-xs text-gray-500 hover:text-gray-800"
                    >
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center gap-3 mt-4 text-sm">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-gray-600">
            Page {data.page} of {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === data.pages}
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
