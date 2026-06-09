import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ImageRef, ProductListItem } from '@/types/common';
import { APP_ROUTES } from '@/constants/routes';
import ProductCardActions from './ProductCard.Actions';
import ProductCardImage from './ProductCard.Image';
import ProductCardInfo from './ProductCard.Info';

const MotionLink = motion(Link);

type Props = {
  product: ProductListItem;
  onAddToCart?: (productId: number) => void;
  images?: ImageRef[];
};

export default function ProductCard({ product, onAddToCart, images }: Props) {
  const hoverImage = images && images.length > 1 ? images[1] : undefined;
  const isOutOfStock = product.stock_quantity === 0;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <MotionLink
      to={APP_ROUTES.PRODUCT(product.slug)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 600 }}
      className="group flex flex-col rounded-md overflow-hidden border border-border bg-white shadow-sm md:hover:shadow-md transition-shadow duration-200"
    >
      {/* Image area with overlays */}
      <div className="relative p-3">
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
    </MotionLink>
  );
}
