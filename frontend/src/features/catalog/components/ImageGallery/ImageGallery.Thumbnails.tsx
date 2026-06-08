import { cn } from '@/utils/cn';
import type { ImageRef } from '@/types/common';

type Props = {
  images: ImageRef[];
  activeIndex: number;
  onSelect: (i: number) => void;
};

export default function ImageGalleryThumbnails({ images, activeIndex, onSelect }: Props) {
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
      {images.map((img, i) => (
        <button
          key={img.id}
          onClick={() => onSelect(i)}
          className={cn(
            'shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-150',
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
