import type { ImageRef } from '@/types/common';

type Props = {
  primaryImage: ImageRef | null;
  hoverImage?: ImageRef;
  name: string;
};

export default function ProductCardImage({ primaryImage, hoverImage, name }: Props) {
  if (!primaryImage) {
    return (
      <div className="aspect-square bg-stone-100 flex items-center justify-center rounded-sm">
        <span className="text-gray-300 text-4xl">✦</span>
      </div>
    );
  }

  const src = `${import.meta.env.VITE_API_BASE_URL}${primaryImage.url}`;

  if (hoverImage) {
    const hoverSrc = `${import.meta.env.VITE_API_BASE_URL}${hoverImage.url}`;
    return (
      <div className="aspect-square overflow-hidden bg-stone-100 relative">
        <img
          src={src}
          alt={primaryImage.alt_text ?? name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 opacity-100 group-hover:opacity-0"
        />
        <img
          src={hoverSrc}
          alt={hoverImage.alt_text ?? name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 opacity-0 group-hover:opacity-100"
        />
      </div>
    );
  }

  return (
    <div className="aspect-square overflow-hidden bg-stone-100">
      <img
        src={src}
        alt={primaryImage.alt_text ?? name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
