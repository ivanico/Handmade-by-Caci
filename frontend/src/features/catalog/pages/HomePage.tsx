import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { APP_ROUTES } from '@/constants/routes';
import { useHomepage } from '../hooks/useHomepage';

export default function HomePage() {
  const { categories, featured, newArrivals } = useHomepage();
  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div>
      {/* Hero */}
      <section className="flex items-center justify-center bg-stone-100 min-h-[60vh]">
        <div className="text-center px-4 max-w-xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Handmade with love
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Unique handcrafted pieces for every occasion
          </p>
          <Link
            to={APP_ROUTES.CATALOG}
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-base font-medium"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products — hidden when empty */}
      {featured && featured.items.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured</h2>
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {activeCategories.map((c) => (
              <Link
                key={c.id}
                to={`${APP_ROUTES.CATALOG}?category=${c.slug}`}
                className="group block"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                  {c.image_url ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${c.image_url}`}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                      <span className="text-4xl text-stone-300">✦</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-3">
                    <p className="text-white text-sm font-medium text-center truncate">{c.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals && newArrivals.items.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">New Arrivals</h2>
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
