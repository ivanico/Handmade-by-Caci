import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProductImage } from '../api/adminProductsApi';

type Props = {
  productId: number;
  images: ProductImage[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (imageId: number) => Promise<void>;
  onReorder: (order: number[]) => Promise<void>;
};

export default function ProductFormImageGrid({
  images,
  onUpload,
  onDelete,
  onReorder,
}: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    handle(() => onUpload(files));
    e.target.value = '';
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const order = images.map((img) => img.id);
    [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
    handle(() => onReorder(order));
  };

  const moveDown = (idx: number) => {
    if (idx === images.length - 1) return;
    const order = images.map((img) => img.id);
    [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
    handle(() => onReorder(order));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, idx) => (
          <div key={img.id} className="relative group" style={{ width: 120, height: 120 }}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${img.thumbnail_url ?? img.url}`}
              alt={img.alt_text ?? ''}
              className="w-full h-full object-cover rounded border border-gray-200"
            />
            {img.is_primary && (
              <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                {t('admin.primary')}
              </span>
            )}
            <button
              type="button"
              onClick={() => handle(() => onDelete(img.id))}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full leading-none flex items-center justify-center shadow"
            >
              ×
            </button>
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveDown(idx)}
                disabled={idx === images.length - 1}
                className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFiles}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={loading || images.length >= 8}
        className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? t('admin.uploading') : t('admin.addImages')}
      </button>
      {images.length >= 8 && (
        <p className="text-xs text-gray-400 mt-1">{t('admin.maxImages')}</p>
      )}
    </div>
  );
}
