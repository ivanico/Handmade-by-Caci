import { formatPrice } from '@/utils/formatters';

type Props = {
  name: string;
  price: string;
  compare_at_price: string | null;
};

export default function ProductCardInfo({ name, price, compare_at_price }: Props) {
  return (
    <>
      <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{name}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-semibold text-gray-900">{formatPrice(price)}</span>
        {compare_at_price && (
          <span className="text-xs text-gray-400 line-through">{formatPrice(compare_at_price)}</span>
        )}
      </div>
    </>
  );
}
