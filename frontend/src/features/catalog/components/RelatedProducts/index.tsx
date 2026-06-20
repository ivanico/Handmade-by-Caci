import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '@/hooks/useLocalized';
import { APP_ROUTES } from '@/constants/routes';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formatters';
import type { ProductListItem } from '@/types/common';

type Props = {
  products: ProductListItem[];
};

export default function RelatedProducts({ products }: Props) {
  const { addItem } = useCart();
  const { t, i18n } = useTranslation();

  if (products.length === 0) return null;

  return (
    <div className="mt-24">
      <div className="mb-10">
        <p className="text-xs tracking-[0.18em] uppercase text-primary-dark mb-2">{t('product.youMayAlsoLike')}</p>
        <h2 className="text-3xl font-heading font-bold text-gray-900">{t('product.relatedPieces')}</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <Link key={p.id} to={APP_ROUTES.PRODUCT(p.slug)} className="group cursor-pointer">
            <div className="relative overflow-hidden aspect-[4/5] bg-stone-100 rounded-[6px] mb-3">
              {p.primary_image ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${p.primary_image.thumbnail_url ?? p.primary_image.url}`}
                  alt={p.primary_image.alt_text ?? getLocalized(p, i18n.language)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-300 text-4xl">✦</span>
                </div>
              )}
              {p.stock_quantity > 0 && (
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={(e) => { e.preventDefault(); addItem(p.id, 1); }}
                    className="w-full py-3 bg-primary text-white text-xs tracking-wide hover:bg-primary-dark transition-colors"
                  >
                    {t('product.addToCart')}
                  </button>
                </div>
              )}
            </div>
            <p className="font-medium text-gray-900 text-sm">{getLocalized(p, i18n.language)}</p>
            <p className="text-sm text-primary-dark font-medium mt-0.5">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
