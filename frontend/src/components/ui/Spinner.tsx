import { cn } from '@/utils/cn';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

export default function Spinner({ size = 'md', className }: Props) {
  return (
    <span
      className={cn(
        'border-2 border-primary border-t-transparent rounded-full animate-spin inline-block',
        sizes[size],
        className,
      )}
      aria-label="Loading"
    />
  );
}
