import { Link } from 'react-router-dom';
import type { ImageRef, ProductListItem } from '@/types/common';
import { APP_ROUTES } from '@/constants/routes';
import ProductCardActions from './ProductCard.Actions';
import ProductCardImage from './ProductCard.Image';
import ProductCardInfo from './ProductCard.Info';

type Props = {
  product: ProductListItem;
  onAddToCart?: (productId: number) => void;
  images?: ImageRef[];
};

export default function ProductCard({ product, onAddToCart, images }: Props) {
  const hoverImage = images && images.length > 1 ? images[1] : undefined;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <Link
      to={APP_ROUTES.PRODUCT(product.slug)}
      className="group flex flex-col rounded-md overflow-hidden border border-border bg-white shadow-sm md:hover:-translate-y-1 md:hover:shadow-md transition-all duration-200"
    >
      {/* Image area with overlays */}
      <div className="relative">
        <ProductCardImage
          primaryImage={product.primary_image}
          hoverImage={hoverImage}
          name={product.name}
        />

        {product.category && (
          <span className="absolute top-2 left-2 bg-white/85 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {product.category.name}
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-end">
            <span className="w-full text-center py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-white/80 backdrop-blur-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Text info */}
      <div className="px-3 pt-3 flex-1">
        <ProductCardInfo
          name={product.name}
          price={product.price}
          compare_at_price={product.compare_at_price}
        />
      </div>

      {/* Add to Cart button */}
      <ProductCardActions
        stockQuantity={product.stock_quantity}
        productId={product.id}
        onAddToCart={onAddToCart}
      />
    </Link>
  );
}
