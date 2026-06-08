import { useSearchParams } from 'react-router-dom';

export interface CatalogFilters {
  category: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  page: number;
}

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CatalogFilters = {
    category: searchParams.get('category') ?? '',
    sort: searchParams.get('sort') ?? '',
    minPrice: searchParams.get('min_price') ?? '',
    maxPrice: searchParams.get('max_price') ?? '',
    page: Number(searchParams.get('page') ?? '1'),
  };

  function setFilter(key: string, value: string): void;
  function setFilter(updates: Record<string, string>): void;
  function setFilter(keyOrUpdates: string | Record<string, string>, value?: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const entries =
        typeof keyOrUpdates === 'string'
          ? { [keyOrUpdates]: value ?? '' }
          : keyOrUpdates;
      for (const [k, v] of Object.entries(entries)) {
        if (v) {
          next.set(k, v);
        } else {
          next.delete(k);
        }
      }
      next.delete('page');
      return next;
    });
  }

  function setPage(n: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (n <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(n));
      }
      return next;
    });
  }

  function clearFilters() {
    setSearchParams({});
  }

  return { filters, setFilter, setPage, clearFilters };
}
