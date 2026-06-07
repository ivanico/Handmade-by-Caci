import Button from '@/components/ui/Button';

type Props = {
  stockQuantity: number;
  productId: number;
  onAddToCart?: (id: number) => void;
};

export default function ProductCardActions({ stockQuantity, productId, onAddToCart }: Props) {
  if (stockQuantity === 0) return null;

  return (
    <div className="px-3 pb-3 pt-2">
      <Button
        variant="primary"
        className="w-full"
        onClick={(e) => {
          e.preventDefault();
          onAddToCart?.(productId);
        }}
      >
        Add to Cart
      </Button>
    </div>
  );
}
