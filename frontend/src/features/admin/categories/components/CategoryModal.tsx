import { useRef, useState } from 'react';
import { adminCategoriesApi, type Category } from '../api/adminCategoriesApi';

type Props = {
  category?: Category;
  onClose: () => void;
  onSaved: () => void;
};

export default function CategoryModal({ category, onClose, onSaved }: Props) {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const saved = isEdit
        ? await adminCategoriesApi.update(category!.id, { name, description: description || null })
        : await adminCategoriesApi.create({ name, description: description || null });
      if (imageFile) {
        await adminCategoriesApi.uploadImage(saved.data.id, imageFile);
      }
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Save failed');
      setSubmitting(false);
    }
  };

  const fieldClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 mt-24 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={fieldClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Image</label>
            {isEdit && category?.image_url && (
              <div className="mb-2">
                <div
                  style={{ width: 64, height: 64 }}
                  className="rounded border border-gray-200 overflow-hidden bg-gray-100"
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${category.image_url}`}
                    alt={category.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Current image</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {imageFile ? imageFile.name : isEdit ? 'Replace image' : 'Choose image'}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
