import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/features/catalog/api/productApi';

export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProduct(slug),
    retry: false,
  });
}
