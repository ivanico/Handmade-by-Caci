import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '@/constants/routes';
import { formatPrice } from '@/utils/formatters';
import Button from '@/components/ui/Button';

type Props = {
  subtotal: number;
  onClose: () => void;
  hasStockIssue: boolean;
};

export default function CartDrawerFooter({ subtotal, onClose, hasStockIssue }: Props) {
  const navigate = useNavigate();

  function handleCheckout() {
    onClose();
    navigate(APP_ROUTES.CHECKOUT);
  }

  return (
    <div className="border-t border-border px-4 pt-4 pb-6 space-y-4">
      <div className="flex justify-between text-sm font-medium">
        <span>Subtotal</span>
        <span className="text-primary-dark font-semibold">{formatPrice(subtotal)}</span>
      </div>
      <p className="text-xs text-gray-500">We'll confirm your order by email</p>
      <Button variant="primary" className="w-full" onClick={handleCheckout} disabled={hasStockIssue}>
        Go to Checkout
      </Button>
      {hasStockIssue && (
        <p className="text-xs text-yellow-700 text-center">Adjust cart quantities to continue</p>
      )}
    </div>
  );
}
