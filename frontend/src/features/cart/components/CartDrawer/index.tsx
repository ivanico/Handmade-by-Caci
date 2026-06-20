import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APP_ROUTES } from '@/constants/routes';
import { useUiStore } from '@/store/uiStore';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import CartDrawerItem from './CartDrawer.Item';
import CartDrawerFooter from './CartDrawer.Footer';

export default function CartDrawer() {
  const open = useUiStore((s) => s.cartDrawerOpen);
  const setOpen = useUiStore((s) => s.setCartDrawerOpen);
  const { cart, updateItem, removeItem } = useCart();
  const { t } = useTranslation();

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const hasStockIssue = items.some((i) => i.available_quantity < i.quantity);

  function close() { setOpen(false); }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={close} aria-hidden="true" />}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-white shadow-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label={t('cart.title')}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <h2 className="font-heading text-lg text-gray-900">{t('cart.title')}</h2>
          <Button variant="ghost" size="sm" onClick={close} aria-label="Close cart">✕</Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
              <p className="text-gray-500">{t('cart.empty')}</p>
              <Link to={APP_ROUTES.CATALOG} onClick={close} className="text-sm text-primary-dark underline hover:no-underline">
                {t('cart.browseCatalog')}
              </Link>
            </div>
          ) : (
            <>
              {hasStockIssue && (
                <div className="mt-3 mb-1 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800">
                  {t('cart.stockWarning')}
                </div>
              )}
              {items.map((item) => (
                <CartDrawerItem key={item.product_id} item={item} onUpdateQty={updateItem} onRemove={removeItem} />
              ))}
            </>
          )}
        </div>

        {!isEmpty && cart && (
          <div className="shrink-0">
            <CartDrawerFooter subtotal={cart.subtotal} onClose={close} hasStockIssue={hasStockIssue} />
          </div>
        )}
      </div>
    </>
  );
}
