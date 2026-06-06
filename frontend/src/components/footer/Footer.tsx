import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/api/catalogApi';

export default function Footer() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold text-base mb-3">Handmade by Caci</h3>
            <p className="text-sm leading-relaxed">
              Unique handcrafted pieces made with care and love.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories
                ?.filter((c) => c.is_active)
                .map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/catalog?category=${c.slug}`}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Contact
            </h4>
            <a
              href="mailto:trudno.pile3@gmail.com"
              className="text-sm hover:text-white transition-colors"
            >
              trudno.pile3@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
          © {new Date().getFullYear()} Handmade by Caci. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
