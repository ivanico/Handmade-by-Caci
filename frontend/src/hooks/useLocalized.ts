import { useTranslation } from 'react-i18next';

export function getLocalized<T extends Record<string, unknown>>(
  item: T,
  language: string,
  field: 'name' | 'description' = 'name'
): string {
  const mkKey = `${field}_mk` as keyof T;
  const enKey = field as keyof T;
  const mkVal = item[mkKey];
  const enVal = item[enKey];
  if (language === 'mk' && mkVal && typeof mkVal === 'string') return mkVal;
  return typeof enVal === 'string' ? enVal : '';
}

export function useLocalized<T extends Record<string, unknown>>(
  item: T,
  field: 'name' | 'description' = 'name'
): string {
  const { i18n } = useTranslation();
  return getLocalized(item, i18n.language, field);
}
