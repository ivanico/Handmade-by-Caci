import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  function handleCheckout() {
    onClose();
    navigate(APP_ROUTES.CHECKOUT);
  }

  return (
    <div className="border-t border-border px-4 pt-4 pb-6 space-y-4">
      <div className="flex justify-between text-sm font-medium">
        <span>{t('cart.subtotal')}</span>
        <span className="text-primary-dark font-semibold">{formatPrice(subtotal)}</span>
      </div>
      <p className="text-xs text-gray-500">{t('cart.emailConfirm')}</p>
      <Button variant="primary" className="w-full" onClick={handleCheckout} disabled={hasStockIssue}>
        {t('cart.goToCheckout')}
      </Button>
      {hasStockIssue && (
        <p className="text-xs text-yellow-700 text-center">{t('cart.adjustCart')}</p>
      )}
    </div>
  );
}
