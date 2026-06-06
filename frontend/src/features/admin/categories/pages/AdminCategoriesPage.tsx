import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCategoriesApi, type Category } from '../api/adminCategoriesApi';
import CategoryModal from '../components/CategoryModal';

export default function AdminCategoriesPage() {
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
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
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
        <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + New Category
        </button>
      </div>

      {deleteError && (
        <p className="text-sm text-red-500 mb-4">{deleteError}</p>
      )}

      {isLoading && (
        <p className="text-gray-400 mt-6">Loading…</p>
      )}

      {!isLoading && categories.length === 0 && (
        <p className="text-gray-400 mt-6">No categories found.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center gap-2"
          >
            <div
              style={{ width: 80, height: 80 }}
              className="rounded bg-gray-100 overflow-hidden border border-gray-200 shrink-0"
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

            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {cat.product_count} {cat.product_count === 1 ? 'product' : 'products'}
            </span>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => openEdit(cat)}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <CategoryModal
          category={editCategory ?? undefined}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
