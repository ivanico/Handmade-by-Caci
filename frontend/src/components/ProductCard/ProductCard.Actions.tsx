import { cn } from '@/utils/cn';

type Props = {
  stockQuantity: number;
  productId: number;
  onAddToCart?: (id: number) => void;
};

export default function ProductCardActions({ stockQuantity, productId, onAddToCart }: Props) {
  if (stockQuantity === 0) return null;

  return (
    <div className="px-3 pb-3 pt-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          onAddToCart?.(productId);
        }}
        className={cn(
          'w-full py-2 text-sm font-medium bg-gray-900 text-white rounded-lg',
          'hover:bg-gray-700 active:bg-gray-800 transition-colors',
        )}
      >
        Add to Cart
      </button>
    </div>
  );
}
