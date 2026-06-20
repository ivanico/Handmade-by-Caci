import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CheckoutPayload } from '../api/checkoutApi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Props = {
  onSubmit: (data: CheckoutPayload) => void;
  isSubmitting: boolean;
  error: string;
};

interface FormState {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  line1: string;
  line2: string;
  city: string;
  postal_code: string;
  country: string;
  notes: string;
}

const initial: FormState = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  line1: '',
  line2: '',
  city: '',
  postal_code: '',
  country: 'MK',
  notes: '',
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function CheckoutForm({ onSubmit, isSubmitting, error }: Props) {
  const [form, setForm] = useState<FormState>(initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { t } = useTranslation();

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!form.customer_name.trim()) errors.customer_name = t('checkout.required');
    if (!form.customer_email.trim()) errors.customer_email = t('checkout.required');
    else if (!/\S+@\S+\.\S+/.test(form.customer_email)) errors.customer_email = t('checkout.invalidEmail');
    if (!form.line1.trim()) errors.line1 = t('checkout.required');
    if (!form.city.trim()) errors.city = t('checkout.required');
    if (!form.postal_code.trim()) errors.postal_code = t('checkout.required');
    if (!form.country.trim()) errors.country = t('checkout.required');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      customer_phone: form.customer_phone.trim() || undefined,
      shipping_address: {
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country.trim(),
      },
      notes: form.notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h2 className="font-heading text-lg text-gray-900">{t('checkout.shippingDetails')}</h2>

      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label={`${t('checkout.fullName')} *`} value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} error={fieldErrors.customer_name} autoComplete="name" />
        </div>
        <Input label={`${t('checkout.email')} *`} type="email" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} error={fieldErrors.customer_email} autoComplete="email" />
        <Input label={t('checkout.phone')} type="tel" value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} autoComplete="tel" />
        <div className="sm:col-span-2">
          <Input label={`${t('checkout.addressLine1')} *`} value={form.line1} onChange={(e) => set('line1', e.target.value)} error={fieldErrors.line1} autoComplete="address-line1" />
        </div>
        <div className="sm:col-span-2">
          <Input label={t('checkout.addressLine2')} value={form.line2} onChange={(e) => set('line2', e.target.value)} autoComplete="address-line2" />
        </div>
        <Input label={`${t('checkout.city')} *`} value={form.city} onChange={(e) => set('city', e.target.value)} error={fieldErrors.city} autoComplete="address-level2" />
        <Input label={`${t('checkout.postalCode')} *`} value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} error={fieldErrors.postal_code} autoComplete="postal-code" />
        <Input label={`${t('checkout.country')} *`} value={form.country} onChange={(e) => set('country', e.target.value)} error={fieldErrors.country} autoComplete="country" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">{t('checkout.notes')}</label>
        <textarea
          id="notes" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)}
          placeholder={t('checkout.notesPlaceholder')}
          className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full resize-none"
        />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
        {t('checkout.placeOrder')}
      </Button>
    </form>
  );
}
