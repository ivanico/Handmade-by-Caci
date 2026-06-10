import { cn } from '@/utils/cn';
import type { ImageRef } from '@/types/common';

type Props = {
  images: ImageRef[];
  activeIndex: number;
  onSelect: (i: number) => void;
};

export default function ImageGalleryThumbnails({ images, activeIndex, onSelect }: Props) {
  return (
    <div className="hidden sm:flex flex-col gap-3 w-20 shrink-0">
      {images.map((img, i) => (
        <button
          key={img.id}
          onClick={() => onSelect(i)}
          className={cn(
            'relative aspect-square overflow-hidden rounded-[6px] border-2 transition-colors',
            i === activeIndex ? 'border-primary-dark' : 'border-transparent hover:border-border',
          )}
          aria-label={img.alt_text ?? `Image ${i + 1}`}
        >
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}${img.url}`}
            alt={img.alt_text ?? ''}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
