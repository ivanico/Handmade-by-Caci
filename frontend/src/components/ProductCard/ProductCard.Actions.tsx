import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';

type Props = {
  stockQuantity: number;
  productId: number;
  onAddToCart?: (id: number) => void;
};

export default function ProductCardActions({ stockQuantity, productId, onAddToCart }: Props) {
  const { addItem, isAdding } = useCart();

  if (stockQuantity === 0) return null;

  return (
    <div className="px-3 pb-3 pt-2">
      <Button
        variant="primary"
        className="w-full"
        isLoading={isAdding}
        onClick={(e) => {
          e.preventDefault();
          addItem(productId, 1);
          onAddToCart?.(productId);
        }}
      >
        Add to Cart
      </Button>
    </div>
  );
}
