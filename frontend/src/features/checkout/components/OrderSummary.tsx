import type { Cart } from '@/types/common';
import { formatPrice } from '@/utils/formatters';

type Props = {
  cart: Cart;
};

export default function OrderSummary({ cart }: Props) {
  return (
    <div className="bg-surface rounded-md border border-border p-4 space-y-3 h-fit">
      <h2 className="font-heading text-lg text-gray-900">Order Summary</h2>
      <div className="space-y-2">
        {cart.items.map((item) => (
          <div key={item.product_id} className="flex justify-between text-sm">
            <span className="text-gray-700 truncate mr-2">
              {item.name} <span className="text-gray-400">× {item.quantity}</span>
            </span>
            <span className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 flex justify-between font-semibold text-sm">
        <span>Total</span>
        <span className="text-primary-dark">{formatPrice(cart.subtotal)}</span>
      </div>
    </div>
  );
}
