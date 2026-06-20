import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogFilters } from '@/hooks/useCatalogFilters';
import Button from '@/components/ui/Button';

type SetFilterFn = ((key: string, value: string) => void) & ((updates: Record<string, string>) => void);

type Props = {
  filters: CatalogFilters;
  setFilter: SetFilterFn;
  clearFilters: () => void;
};

const sectionTitle =
  'font-heading text-sm uppercase tracking-widest text-gray-400 border-b border-primary pb-1 mb-3';

const inputClass =
  'border-0 border-b border-gray-200 focus:border-primary rounded-none px-0 py-1 bg-transparent text-sm w-full outline-none transition-colors';

export default function CatalogSidebarFilters({ filters, setFilter, clearFilters }: Props) {
  const { t } = useTranslation();
  const [minDraft, setMinDraft] = useState(filters.minPrice);
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice);
  const [priceError, setPriceError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SORT_OPTIONS = [
    { label: t('catalog.newest'), value: 'newest' },
    { label: t('catalog.priceAsc'), value: 'price_asc' },
    { label: t('catalog.priceDesc'), value: 'price_desc' },
  ];

  useEffect(() => { setMinDraft(filters.minPrice); }, [filters.minPrice]);
  useEffect(() => { setMaxDraft(filters.maxPrice); }, [filters.maxPrice]);

  function applyPrice() {
    const min = minDraft ? Number(minDraft) : null;
    const max = maxDraft ? Number(maxDraft) : null;
    if (min !== null && max !== null && min > max) { setPriceError('Min must be less than Max'); return; }
    setPriceError('');
    setFilter({ min_price: minDraft, max_price: maxDraft });
  }

  function scheduledApply(newMin: string, newMax: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const min = newMin ? Number(newMin) : null;
      const max = newMax ? Number(newMax) : null;
      if (min !== null && max !== null && min > max) { setPriceError('Min must be less than Max'); return; }
      setPriceError('');
      setFilter({ min_price: newMin, max_price: newMax });
    }, 600);
  }

  function handlePriceKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') applyPrice();
  }

  const hasFilters = filters.category || filters.sort || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-8">
      <div>
        <h3 className={sectionTitle}>{t('catalog.price')}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-0.5">{t('catalog.min')}</label>
            <input type="number" min={0} placeholder="0" value={minDraft} className={inputClass}
              onChange={(e) => { const val = e.target.value; setMinDraft(val); setPriceError(''); scheduledApply(val, maxDraft); }}
              onBlur={applyPrice} onKeyDown={handlePriceKeyDown}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-0.5">{t('catalog.max')}</label>
            <input type="number" min={0} placeholder="Any" value={maxDraft} className={inputClass}
              onChange={(e) => { const val = e.target.value; setMaxDraft(val); setPriceError(''); scheduledApply(minDraft, val); }}
              onBlur={applyPrice} onKeyDown={handlePriceKeyDown}
            />
          </div>
          {priceError && <p className="text-xs text-red-500">{priceError}</p>}
        </div>
      </div>

      <div>
        <h3 className={sectionTitle}>{t('catalog.sortBy')}</h3>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setFilter('sort', opt.value)}
              className={filters.sort === opt.value
                ? 'border border-primary bg-primary-light text-gray-800 rounded-full px-3 py-1 text-xs'
                : 'border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 bg-transparent hover:bg-surface'}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full hover:bg-primary-light hover:text-primary-dark">
          {t('catalog.clearFilters')}
        </Button>
      )}
    </div>
  );
}
