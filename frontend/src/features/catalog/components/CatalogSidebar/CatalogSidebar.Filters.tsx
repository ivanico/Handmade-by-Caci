import { useState, useEffect } from 'react';
import type { Category } from '@/types/common';
import type { CatalogFilters } from '@/hooks/useCatalogFilters';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type Props = {
  categories: Category[];
  filters: CatalogFilters;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
};

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
];

export default function CatalogSidebarFilters({ categories, filters, setFilter, clearFilters }: Props) {
  const [minDraft, setMinDraft] = useState(filters.minPrice);
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice);
  const [priceError, setPriceError] = useState('');

  useEffect(() => { setMinDraft(filters.minPrice); }, [filters.minPrice]);
  useEffect(() => { setMaxDraft(filters.maxPrice); }, [filters.maxPrice]);

  function applyPrice() {
    const min = minDraft ? Number(minDraft) : null;
    const max = maxDraft ? Number(maxDraft) : null;
    if (min !== null && max !== null && min > max) {
      setPriceError('Min must be less than Max');
      return;
    }
    setPriceError('');
    setFilter({ min_price: minDraft, max_price: maxDraft });
  }

  function handlePriceKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') applyPrice();
  }

  const hasFilters = filters.category || filters.sort || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-heading text-base font-semibold text-gray-900 mb-3">Categories</h3>
        <ul className="space-y-2">
          {categories.filter((c) => c.is_active).map((cat) => (
            <li key={cat.id}>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                <input
                  type="checkbox"
                  className="accent-primary rounded"
                  checked={filters.category === cat.slug}
                  onChange={() =>
                    setFilter('category', filters.category === cat.slug ? '' : cat.slug)
                  }
                />
                {cat.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-heading text-base font-semibold text-gray-900 mb-3">Price</h3>
        <div className="space-y-2">
          <Input
            label="Min"
            type="number"
            min={0}
            placeholder="0"
            value={minDraft}
            onChange={(e) => { setMinDraft(e.target.value); setPriceError(''); }}
            onBlur={applyPrice}
            onKeyDown={handlePriceKeyDown}
          />
          <Input
            label="Max"
            type="number"
            min={0}
            placeholder="Any"
            value={maxDraft}
            onChange={(e) => { setMaxDraft(e.target.value); setPriceError(''); }}
            onBlur={applyPrice}
            onKeyDown={handlePriceKeyDown}
          />
          {priceError && <p className="text-xs text-red-500">{priceError}</p>}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-heading text-base font-semibold text-gray-900 mb-3">Sort By</h3>
        <fieldset className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
              <input
                type="radio"
                name="sort"
                className="accent-primary"
                value={opt.value}
                checked={filters.sort === opt.value}
                onChange={() => setFilter('sort', opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </fieldset>
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          Clear filters
        </Button>
      )}
    </div>
  );
}
