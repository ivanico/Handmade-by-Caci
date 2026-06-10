import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { APP_ROUTES } from '@/constants/routes';
import { LOW_STOCK_THRESHOLD } from '@/constants/ui';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useRelatedProducts } from '@/hooks/useRelatedProducts';
import { useUiStore } from '@/store/uiStore';
import { cartApi } from '@/features/cart/api/cartApi';
import { formatPrice } from '@/utils/formatters';
import Button from '@/components/ui/Button';
import ImageGallery from '../components/ImageGallery';
import RelatedProducts from '../components/RelatedProducts';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProductDetail(slug!);
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: relatedProducts = [] } = useRelatedProducts(
    product?.category?.slug,
    product?.id ?? 0,
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-gray-200 rounded-[8px]" />
          <div className="space-y-4 pt-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-7 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-12 bg-gray-200 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return <Navigate to={APP_ROUTES.CATALOG} replace />;
  }

  const isOOS = product.stock_quantity === 0;
  const isLowStock = !isOOS && product.stock_quantity <= LOW_STOCK_THRESHOLD;

  async function handleAddToCart() {
    setIsAddingToCart(true);
    try {
      await cartApi.addItem(product!.id, quantity, selectedVariantId);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast('Added to cart!');
    } catch {
      showToast('Could not add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link to={APP_ROUTES.HOME} className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to={APP_ROUTES.CATALOG} className="hover:text-gray-900 transition-colors">Catalog</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`${APP_ROUTES.CATALOG}?category=${product.category.slug}`}
                className="hover:text-gray-900 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          <ImageGallery
            images={product.images}
            name={product.name}
            tag={isLowStock ? 'Low Stock' : undefined}
          />

          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center justify-between">
              {product.category && (
                <span className="text-xs tracking-widest uppercase text-primary-dark font-medium">
                  {product.category.name}
                </span>
              )}
              {isOOS && (
                <span className="text-xs font-medium text-red-500 uppercase tracking-wide">Out of Stock</span>
              )}
            </div>

            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-primary-dark">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
            </div>

            {isLowStock && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm text-gray-500">
                  Only {product.stock_quantity} left in stock
                </span>
              </div>
            )}

            {product.description && (
              <div
                className="text-sm text-gray-600 leading-relaxed border-t border-border pt-5 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <p className="text-xs text-gray-400">SKU: {product.sku}</p>

            {product.variants.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="variant-select" className="text-sm font-medium text-gray-700">
                  Option
                </label>
                <select
                  id="variant-select"
                  value={selectedVariantId ?? ''}
                  onChange={(e) =>
                    setSelectedVariantId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="border border-border rounded-[6px] px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="">Select an option</option>
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}: {v.value}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2">
              {!isOOS && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">Qty</span>
                  <div className="flex items-center border border-border rounded-[6px] overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-stone-50 transition-colors text-lg disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-stone-50 transition-colors text-lg disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isOOS || isAddingToCart}
                isLoading={isAddingToCart}
                onClick={handleAddToCart}
              >
                {isOOS ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>

        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
