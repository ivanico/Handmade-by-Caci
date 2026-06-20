import type { ImageRef } from '@/types/common';

type Props = {
  primaryImage: ImageRef | null;
  hoverImage?: ImageRef;
  name: string;
};

export default function ProductCardImage({ primaryImage, hoverImage, name }: Props) {
  if (!primaryImage) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-gray-300 text-4xl">✦</span>
      </div>
    );
  }

  const src = `${import.meta.env.VITE_API_BASE_URL}${primaryImage.thumbnail_url ?? primaryImage.url}`;

  if (hoverImage) {
    const hoverSrc = `${import.meta.env.VITE_API_BASE_URL}${hoverImage.thumbnail_url ?? hoverImage.url}`;
    return (
      <>
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
      </>
    );
  }

  return (
    <img
      src={src}
      alt={primaryImage.alt_text ?? name}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );
}
