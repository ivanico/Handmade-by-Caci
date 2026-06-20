import { useTranslation } from 'react-i18next';
import type { CartItem } from '@/types/common';
import { formatPrice } from '@/utils/formatters';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

type Props = {
  item: CartItem;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
};

export default function CartDrawerItem({ item, onUpdateQty, onRemove }: Props) {
  const isOverStock = item.quantity > item.available_quantity;
  const { t } = useTranslation();

  return (
    <div className={`flex gap-3 py-3 border-b border-border last:border-0 rounded-sm ${isOverStock ? 'bg-yellow-50' : ''}`}>
      <div className="w-15 h-15 shrink-0 rounded-md overflow-hidden bg-stone-100 w-[60px] h-[60px]">
        {item.image_url ? (
          <img src={`${import.meta.env.VITE_API_BASE_URL}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">✦</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-primary-dark font-semibold mt-0.5">{formatPrice(item.price * item.quantity)}</p>

        {isOverStock && (
          <Badge variant="warning" className="mt-1">
            {t('cart.onlyLeft', { count: item.available_quantity })}
          </Badge>
        )}

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <Button variant="ghost" size="sm" className="rounded-none px-2 py-1 h-7" disabled={item.quantity <= 1} onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}>−</Button>
            <span className="px-2 text-sm">{item.quantity}</span>
            <Button variant="ghost" size="sm" className="rounded-none px-2 py-1 h-7" disabled={item.quantity >= item.available_quantity} onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}>+</Button>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 px-2" onClick={() => onRemove(item.product_id)}>✕</Button>
        </div>
      </div>
    </div>
  );
}
