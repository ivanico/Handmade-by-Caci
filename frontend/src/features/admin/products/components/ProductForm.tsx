import { useState } from 'react';
import { adminProductsApi, type Category, type CreateProductData, type Product } from '../api/adminProductsApi';
import ProductFormImageGrid from './ProductForm.ImageGrid';

function generateSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

type Props = {
  product?: Product;
  categories: Category[];
  onSave: (data: CreateProductData) => Promise<Product>;
  onCancel: () => void;
  onImagesChanged: () => void;
};

export default function ProductForm({ product, categories, onSave, onCancel, onImagesChanged }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(product?.category?.id ?? null);
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [stock, setStock] = useState(String(product?.stock_quantity ?? 0));
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSave({
        name,
        category_id: categoryId,
        description: description || null,
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        sku,
        stock_quantity: Number(stock),
        is_featured: isFeatured,
        is_active: isActive,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Save failed');
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className={labelClass}>Name</label>
        <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} required />
        {name && (
          <p className="text-xs text-gray-400 mt-1">Slug: {generateSlug(name)}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Category</label>
        <select
          className={fieldClass}
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={fieldClass}
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Price</label>
          <input
            className={fieldClass}
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Compare At Price</label>
          <input
            className={fieldClass}
            type="number"
            step="0.01"
            min="0"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* SKU + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>SKU</label>
          <input className={fieldClass} value={sku} onChange={(e) => setSku(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Stock Quantity</label>
          <input
            className={fieldClass}
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Is Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Is Active
        </label>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Images</label>
        {product?.id ? (
          <ProductFormImageGrid
            productId={product.id}
            images={product.images}
            onUpload={async (files) => {
              await adminProductsApi.addImages(product.id, files);
              onImagesChanged();
            }}
            onDelete={async (imageId) => {
              await adminProductsApi.deleteImage(product.id, imageId);
              onImagesChanged();
            }}
            onReorder={async (order) => {
              await adminProductsApi.reorderImages(product.id, order);
              onImagesChanged();
            }}
          />
        ) : (
          <p className="text-sm text-gray-400 italic">Save the product first to upload images.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Footer */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
