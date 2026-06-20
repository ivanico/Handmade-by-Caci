import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminProductsApi, type Category, type CreateProductData, type Product } from '../api/adminProductsApi';
import ProductFormImageGrid from './ProductForm.ImageGrid';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

const selectClass =
  'w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function ProductForm({ product, categories, onSave, onCancel, onImagesChanged }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(product?.name ?? '');
  const [nameMk, setNameMk] = useState(product?.name_mk ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(product?.category?.id ?? null);
  const [description, setDescription] = useState(product?.description ?? '');
  const [descriptionMk, setDescriptionMk] = useState(product?.description_mk ?? '');
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
        name_mk: nameMk || null,
        category_id: categoryId,
        description: description || null,
        description_mk: descriptionMk || null,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name (EN) */}
      <div>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {name && (
          <p className="text-xs text-gray-400 mt-1">{t('common.slug', { slug: generateSlug(name) })}</p>
        )}
      </div>

      {/* Name (MK) */}
      <Input
        label={t('admin.nameMk')}
        value={nameMk}
        onChange={(e) => setNameMk(e.target.value)}
      />

      {/* Category */}
      <div>
        <label className={labelClass}>{t('admin.category')}</label>
        <select
          className={selectClass}
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">{t('admin.noneCategory')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Description (EN) */}
      <div>
        <label className={labelClass}>{t('admin.descriptionLabel')}</label>
        <textarea
          className={selectClass}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Description (MK) */}
      <div>
        <label className={labelClass}>{t('admin.descriptionMk')}</label>
        <textarea
          className={selectClass}
          rows={5}
          value={descriptionMk}
          onChange={(e) => setDescriptionMk(e.target.value)}
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('admin.priceLabel')}
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          label={t('admin.compareAtPrice')}
          type="number"
          step="0.01"
          min="0"
          value={compareAtPrice}
          onChange={(e) => setCompareAtPrice(e.target.value)}
          placeholder={t('admin.optional')}
        />
      </div>

      {/* SKU + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('admin.skuLabel')}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <Input
          label={t('admin.stockQuantity')}
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          {t('admin.isFeatured')}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          {t('admin.isActive')}
        </label>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>{t('admin.images')}</label>
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
          <p className="text-sm text-gray-400 italic">{t('admin.saveFirstToUpload')}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" isLoading={submitting}>
          {t('admin.save')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('admin.cancel')}
        </Button>
      </div>
    </form>
  );
}
