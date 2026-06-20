import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '@/hooks/useLocalized';
import { catalogApi } from '@/features/catalog/api/catalogApi';

const BRAND = '#2d1a20';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  return (
    <>
      {/* About Us */}
      <section className="bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2 tracking-wide uppercase">
            {t('about.heading')}
          </h2>
          <p className="text-xs tracking-[0.18em] uppercase text-primary-dark mb-6">
            {t('about.tagline')}
          </p>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            {t('about.body')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: BRAND }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm leading-relaxed text-white/70">
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-heading text-white text-sm uppercase tracking-wider mb-3">
                {t('footer.categories')}
              </h4>
              <ul className="space-y-2">
                {categories
                  ?.filter((c) => c.is_active)
                  .map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/catalog?category=${c.slug}`}
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {getLocalized(c, i18n.language)}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-white text-sm uppercase tracking-wider mb-3">
                {t('footer.contact')}
              </h4>
              <a
                href="mailto:handmade.caci@gmail.com"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                handmade.caci@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/20 text-center text-sm text-white/50">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </>
  );
}
