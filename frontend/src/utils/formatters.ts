export function formatPrice(amount: number | string): string {
  return new Intl.NumberFormat('mk-MK', {
    style: 'currency',
    currency: 'MKD',
  }).format(Number(amount));
}
