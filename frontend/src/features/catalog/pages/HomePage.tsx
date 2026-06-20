import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '@/hooks/useLocalized';
import ProductCard from '@/components/ProductCard';
import { APP_ROUTES } from '@/constants/routes';
import { useHomepage } from '../hooks/useHomepage';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { categories, featured, newArrivals } = useHomepage();
  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div>
      {/* Hero */}
      <section className="flex items-center justify-center bg-surface min-h-[60vh]">
        <div className="text-center px-4 max-w-xl">
          <h1 className="text-4xl md:text-6xl font-heading text-gray-900 mb-4 leading-tight">
            {t('home.heroHeading')}
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            {t('home.heroTagline')}
          </p>
          <Link
            to={APP_ROUTES.CATALOG}
            className="inline-flex items-center justify-center rounded-md active:scale-95 transition-all duration-150 font-medium px-8 py-3 text-base bg-primary hover:bg-primary-dark text-white"
          >
            {t('home.shopNow')}
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.items.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-heading text-gray-900 mb-6">{t('home.featured')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {featured.items.map((p) => (
              <div key={p.id} className="w-56 shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {activeCategories.length > 0 && (
        <section className="bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-heading text-gray-900 mb-6">{t('home.shopByCategory')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {activeCategories.map((c) => (
                <Link key={c.id} to={`${APP_ROUTES.CATALOG}?category=${c.slug}`} className="group block">
                  <div className="aspect-square rounded-md overflow-hidden bg-primary-light relative">
                    {c.image_url ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${c.image_url}`}
                        alt={getLocalized(c, i18n.language)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary">
                        <span className="text-4xl text-white/60">✦</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-3">
                      <p className="text-white text-sm font-medium text-center truncate">{getLocalized(c, i18n.language)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals && newArrivals.items.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-heading text-gray-900 mb-6">{t('home.newArrivals')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
