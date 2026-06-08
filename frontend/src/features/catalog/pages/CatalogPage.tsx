import { useQuery } from '@tanstack/react-query';
import { ITEMS_PER_PAGE } from '@/constants/ui';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { catalogApi } from '../api/catalogApi';
import CatalogSidebar from '../components/CatalogSidebar';
import ProductGrid from '../components/ProductGrid';

export default function CatalogPage() {
  const { filters, setFilter, setPage, clearFilters } = useCatalogFilters();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      catalogApi.getProducts({
        category: filters.category || undefined,
        sort: filters.sort || undefined,
        min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        page: filters.page,
        limit: ITEMS_PER_PAGE,
      }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl text-gray-900 mb-6">Shop</h1>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <CatalogSidebar
          categories={categories}
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
        />
        <main className="flex-1 min-w-0">
          <ProductGrid
            items={data?.items ?? []}
            isLoading={isLoading}
            page={filters.page}
            pages={data?.pages ?? 1}
            setPage={setPage}
            clearFilters={clearFilters}
          />
        </main>
      </div>
    </div>
  );
}
