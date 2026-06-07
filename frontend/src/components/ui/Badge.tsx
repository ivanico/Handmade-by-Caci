import { cn } from '@/utils/cn';

type Variant = 'success' | 'error' | 'warning' | 'info' | 'muted';

type Props = {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  muted: 'bg-gray-100 text-gray-600',
};

export default function Badge({ variant = 'muted', children, className }: Props) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium inline-block',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
