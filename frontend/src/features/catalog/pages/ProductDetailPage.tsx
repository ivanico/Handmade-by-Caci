import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { APP_ROUTES } from '@/constants/routes';
import { LOW_STOCK_THRESHOLD } from '@/constants/ui';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useUiStore } from '@/store/uiStore';
import { cartApi } from '@/features/cart/api/cartApi';
import { formatPrice } from '@/utils/formatters';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ImageGallery from '../components/ImageGallery';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProductDetail(slug!);
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-md" />
          <div className="space-y-4 pt-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-10 bg-gray-200 rounded mt-6" />
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Gallery */}
        <ImageGallery images={product.images} name={product.name} />

        {/* Info */}
        <div className="space-y-4">
          <h1 className="font-heading text-3xl text-gray-900 leading-snug">{product.name}</h1>

          {/* Price */}
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

          {/* Stock badge */}
          {isOOS ? (
            <Badge variant="error">Out of Stock</Badge>
          ) : isLowStock ? (
            <Badge variant="warning">Low Stock — {product.stock_quantity} left</Badge>
          ) : (
            <Badge variant="success">In Stock</Badge>
          )}

          {/* Description */}
          {product.description && (
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {/* SKU */}
          <p className="text-xs text-gray-400">SKU: {product.sku}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-1">
              <label htmlFor="variant-select" className="text-sm font-medium text-gray-700">
                Option
              </label>
              <select
                id="variant-select"
                value={selectedVariantId ?? ''}
                onChange={(e) =>
                  setSelectedVariantId(e.target.value ? Number(e.target.value) : null)
                }
                className="border border-border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

          {/* Quantity stepper */}
          {!isOOS && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Qty</span>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="rounded-none border-0 px-3"
                >
                  −
                </Button>
                <span className="px-4 text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="rounded-none border-0 px-3"
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isOOS || isAddingToCart}
            isLoading={isAddingToCart}
            onClick={handleAddToCart}
          >
            {isOOS ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
