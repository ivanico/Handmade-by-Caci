import type { ProductListItem } from '@/types/common';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import SkeletonCard from '@/components/ui/SkeletonCard';

type Props = {
  items: ProductListItem[];
  isLoading: boolean;
  page: number;
  pages: number;
  setPage: (n: number) => void;
  clearFilters: () => void;
};

export default function ProductGrid({ items, isLoading, page, pages, setPage, clearFilters }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">No products found</p>
        <Button variant="secondary" onClick={clearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← Prev
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {pages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
