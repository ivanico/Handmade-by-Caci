import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminCategoriesApi, type Category } from '../api/adminCategoriesApi';
import CategoryModal from '../components/CategoryModal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminCategoriesApi.list().then((r) => r.data),
  });

  const openCreate = () => {
    setEditCategory(null);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditCategory(null);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    closeModal();
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(t('admin.deleteCategoryConfirm', { name: cat.name }))) return;
    setDeleteError('');
    try {
      await adminCategoriesApi.delete(cat.id);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setDeleteError(msg || 'Delete failed');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-heading text-gray-900">{t('admin.categories')}</h1>
        <Button variant="primary" size="sm" onClick={openCreate}>
          {t('admin.newCategory')}
        </Button>
      </div>

      {deleteError && (
        <p className="text-sm text-red-500 mb-4">{deleteError}</p>
      )}

      {isLoading && (
        <p className="text-gray-400 mt-6">{t('admin.loading')}</p>
      )}

      {!isLoading && categories.length === 0 && (
        <p className="text-gray-400 mt-6">{t('admin.noCategories')}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-border rounded-md shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 p-4 flex flex-col items-center gap-2"
          >
            <div
              style={{ width: 80, height: 80 }}
              className="rounded bg-gray-100 overflow-hidden border border-border shrink-0"
            >
              {cat.image_url ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${cat.image_url}`}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null}
            </div>

            <p className="text-sm font-medium text-gray-900 text-center">{cat.name}</p>

            <Badge variant="muted">
              {cat.product_count} {cat.product_count === 1 ? t('admin.products_one') : t('admin.products_other')}
            </Badge>

            <div className="flex gap-1 mt-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                {t('admin.edit')}
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(cat)}>
                {t('admin.delete')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        key={editCategory?.id ?? 'new'}
        isOpen={modalOpen}
        category={editCategory ?? undefined}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </div>
  );
}
