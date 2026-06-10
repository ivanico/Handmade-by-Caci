import { formatPrice } from '@/utils/formatters';

type Props = {
  name: string;
  price: string;
  compare_at_price: string | null;
  category?: string;
};

export default function ProductCardInfo({ name, price, compare_at_price, category }: Props) {
  return (
    <>
      {category && (
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">{category}</p>
      )}
      <p className="font-semibold text-foreground mb-1">{name}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-primary font-medium">{formatPrice(price)}</span>
        {compare_at_price && (
          <span className="text-xs text-muted-foreground line-through">{formatPrice(compare_at_price)}</span>
        )}
      </div>
    </>
  );
}
