import { useTranslation } from 'react-i18next';

interface LocalizableItem {
  name?: string | null;
  name_mk?: string | null;
  description?: string | null;
  description_mk?: string | null;
}

export function getLocalized(
  item: LocalizableItem,
  language: string,
  field: 'name' | 'description' = 'name'
): string {
  const mkVal = field === 'name' ? item.name_mk : item.description_mk;
  const enVal = field === 'name' ? item.name : item.description;
  if (language === 'mk' && mkVal && typeof mkVal === 'string') return mkVal;
  return typeof enVal === 'string' ? enVal : '';
}

export function useLocalized(item: LocalizableItem, field: 'name' | 'description' = 'name'): string {
  const { i18n } = useTranslation();
  return getLocalized(item, i18n.language, field);
}
