import { useState } from 'react';
import type { Category } from '@/types/common';
import type { CatalogFilters } from '@/hooks/useCatalogFilters';
import Button from '@/components/ui/Button';
import CatalogSidebarFilters from './CatalogSidebar.Filters';

type SetFilterFn = ((key: string, value: string) => void) & ((updates: Record<string, string>) => void);

type Props = {
  categories: Category[];
  filters: CatalogFilters;
  setFilter: SetFilterFn;
  clearFilters: () => void;
};

export default function CatalogSidebar({ categories, filters, setFilter, clearFilters }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[260px] shrink-0">
        <div className="sticky top-4">
          <CatalogSidebarFilters
            filters={filters}
            setFilter={setFilter}
            clearFilters={clearFilters}
          />
        </div>
      </aside>

      {/* Mobile: Filters button */}
      <div className="md:hidden">
        <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>
          Filters
        </Button>
      </div>

      {/* Mobile: bottom-sheet drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg text-gray-900">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
                ✕
              </Button>
            </div>
            <CatalogSidebarFilters
              filters={filters}
              setFilter={(keyOrUpdates: string | Record<string, string>, value?: string) => {
                if (typeof keyOrUpdates === 'string') setFilter(keyOrUpdates, value!);
                else setFilter(keyOrUpdates);
                setDrawerOpen(false);
              }}
              clearFilters={() => {
                clearFilters();
                setDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
