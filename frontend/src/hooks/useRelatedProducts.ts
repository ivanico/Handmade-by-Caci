import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import type { ProductListItem } from '@/types/common';

export function useRelatedProducts(categorySlug: string | undefined, excludeId: number) {
  return useQuery<ProductListItem[]>({
    queryKey: ['related-products', categorySlug, excludeId],
    queryFn: async () => {
      const data = await catalogApi.getProducts({ category: categorySlug, limit: 8 });
      return data.items.filter((p) => p.id !== excludeId).slice(0, 4);
    },
    enabled: !!categorySlug,
  });
}
