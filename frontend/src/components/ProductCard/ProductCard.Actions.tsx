import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/useCart';

type Props = {
  stockQuantity: number;
  productId: number;
  onAddToCart?: (id: number) => void;
};

export default function ProductCardActions({ stockQuantity, productId, onAddToCart }: Props) {
  const { addItem, isAdding } = useCart();
  const { t } = useTranslation();

  if (stockQuantity === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <button
        disabled={isAdding}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addItem(productId, 1);
          onAddToCart?.(productId);
        }}
        className="w-full py-3.5 bg-primary text-primary-foreground text-sm tracking-wide hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isAdding ? t('product.adding') : t('product.addToCart')}
      </button>
    </div>
  );
}
