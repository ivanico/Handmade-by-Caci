import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminProductsApi } from '../api/adminProductsApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
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
    if (!window.confirm(t('admin.deleteProductConfirm'))) return;
    await adminProductsApi.delete(id);
    invalidate();
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <h1 className="text-xl font-heading text-gray-900">{t('admin.products')}</h1>
        <Link
          to="/admin/products/new"
          className="rounded-md active:scale-95 transition-all duration-150 font-medium inline-flex items-center justify-center px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white"
        >
          {t('admin.newProduct')}
        </Link>
      </div>

      <div className="w-full max-w-xs mb-4">
        <Input
          placeholder={t('admin.searchProducts')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border border-border rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-14"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.name')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.sku')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.price')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.stock')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  {t('admin.loading')}
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  {t('admin.noProducts')}
                </td>
              </tr>
            )}
            {data?.items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div
                    style={{ width: 48, height: 48 }}
                    className="rounded border border-border overflow-hidden bg-gray-100 shrink-0"
                  >
                    {p.primary_image && (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${p.primary_image.thumbnail_url ?? p.primary_image.url}`}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link to={`/admin/products/${p.id}/edit`} className="hover:text-primary-dark">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-900">MKD{Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">{p.stock_quantity}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.is_active ? 'success' : 'muted'}>
                    {p.is_active ? t('admin.activeLabel') : t('admin.inactiveLabel')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="text-xs text-primary-dark hover:underline px-2 py-1"
                    >
                      {t('admin.edit')}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(p.id, p.is_active)}
                    >
                      {p.is_active ? t('admin.deactivate') : t('admin.activate')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      {t('admin.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center gap-3 mt-4 text-sm">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            {t('admin.prev')}
          </Button>
          <span className="text-gray-600">
            {t('admin.page', { page: data.page, pages: data.pages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === data.pages}
          >
            {t('admin.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
