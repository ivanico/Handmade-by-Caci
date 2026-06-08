import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminOrdersApi } from '@/features/admin/orders/api/adminOrdersApi';
import { ADMIN_ITEMS_PER_PAGE } from '@/constants/ui';

export function useAdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchInUrl = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchDraft, setSearchDraft] = useState(searchInUrl);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchDraft) {
          next.set('search', searchDraft);
        } else {
          next.delete('search');
        }
        next.delete('page');
        return next;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', searchInUrl, status, sort, page],
    queryFn: () =>
      adminOrdersApi
        .list({
          search: searchInUrl || undefined,
          status: status || undefined,
          sort,
          page,
          limit: ADMIN_ITEMS_PER_PAGE,
        })
        .then((r) => r.data),
  });

  function setStatus(s: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (s) next.set('status', s);
      else next.delete('status');
      next.delete('page');
      return next;
    });
  }

  function toggleSort() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', sort === 'newest' ? 'oldest' : 'newest');
      next.delete('page');
      return next;
    });
  }

  function setPage(n: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (n <= 1) next.delete('page');
      else next.set('page', String(n));
      return next;
    });
  }

  return {
    data,
    isLoading,
    filters: { search: searchDraft, status, sort, page },
    setSearch: setSearchDraft,
    setStatus,
    toggleSort,
    setPage,
  };
}
