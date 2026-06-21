import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '@/hooks/useLocalized';
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
  const { t, i18n } = useTranslation();
  const displayName = getLocalized(product, i18n.language);

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
console.log('Rendering ProductCard for', product);
  return (
    <MotionLink
      to={APP_ROUTES.PRODUCT(product.slug)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 600 }}
      className="group flex flex-col cursor-pointer"
    >
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] rounded-[6px]">
        <ProductCardImage
          primaryImage={product.primary_image}
          hoverImage={hoverImage}
          name={displayName}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-end">
            <span className="w-full text-center py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-white/80 backdrop-blur-sm">
              {t('product.outOfStock')}
            </span>
          </div>
        )}

        <ProductCardActions
          stockQuantity={product.stock_quantity}
          productId={product.id}
          onAddToCart={onAddToCart}
        />
      </div>

      <div className="px-3 py-2 bg-white">
        <ProductCardInfo
          name={displayName}
          price={product.price}
          compare_at_price={product.compare_at_price}
          category={product.category ? getLocalized(product.category, i18n.language) : undefined}
        />
      </div>
    </MotionLink>
  );
}
