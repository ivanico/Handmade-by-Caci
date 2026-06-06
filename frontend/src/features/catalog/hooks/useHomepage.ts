import { useQuery } from '@tanstack/react-query';
import { HOMEPAGE_ARRIVALS_LIMIT, HOMEPAGE_FEATURED_LIMIT } from '@/constants/ui';
import { catalogApi } from '../api/catalogApi';

export function useHomepage() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  const { data: featured } = useQuery({
    queryKey: ['products', { featured: true, limit: HOMEPAGE_FEATURED_LIMIT }],
    queryFn: () => catalogApi.getProducts({ featured: true, limit: HOMEPAGE_FEATURED_LIMIT }),
  });

  const { data: newArrivals } = useQuery({
    queryKey: ['products', { sort: 'newest', limit: HOMEPAGE_ARRIVALS_LIMIT }],
    queryFn: () => catalogApi.getProducts({ sort: 'newest', limit: HOMEPAGE_ARRIVALS_LIMIT }),
  });

  return { categories, featured, newArrivals };
}
