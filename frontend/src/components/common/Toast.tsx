import { useEffect, useState } from 'react';
import { TOAST_DURATION_MS } from '@/constants/ui';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type Props = { toast: ToastData; onDismiss: (id: string) => void };

const typeClasses: Record<ToastData['type'], string> = {
  success: 'bg-green-50 border border-green-200 text-green-800',
  error: 'bg-red-50 border border-red-200 text-red-800',
  info: 'bg-primary-light border border-primary text-gray-800',
};

export default function Toast({ toast, onDismiss }: Props) {
  const [leaving, setLeaving] = useState(false);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }

  useEffect(() => {
    const t = setTimeout(dismiss, TOAST_DURATION_MS - 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`rounded-md shadow-md px-4 py-3 text-sm flex items-center gap-3 ${typeClasses[toast.type]} transition-opacity duration-300 ${leaving ? 'opacity-0' : 'animate-fadeIn'}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={dismiss}
        className="opacity-60 hover:opacity-100 transition-opacity leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
