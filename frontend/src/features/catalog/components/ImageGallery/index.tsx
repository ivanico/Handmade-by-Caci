import { useState } from 'react';
import type { ImageRef } from '@/types/common';
import ImageGalleryThumbnails from './ImageGallery.Thumbnails';

type Props = {
  images: ImageRef[];
  name: string;
};

export default function ImageGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-stone-100 rounded-md flex items-center justify-center">
        <span className="text-gray-300 text-6xl">✦</span>
      </div>
    );
  }

  const active = images[activeIndex];
  const src = `${import.meta.env.VITE_API_BASE_URL}${active.url}`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  }

  return (
    <div className="relative">
      {/* Main image — object-contain so the full image is visible */}
      <div
        className="aspect-square rounded-md overflow-hidden bg-stone-100 cursor-crosshair select-none"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          key={active.id}
          src={src}
          alt={active.alt_text ?? name}
          className="w-full h-full object-contain animate-fadeIn"
          style={{
            transform: zoom ? 'scale(2)' : 'scale(1)',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transition: zoom ? 'none' : 'transform 100ms ease-out, opacity 100ms ease-out',
          }}
        />
      </div>

      {images.length > 1 && (
        <ImageGalleryThumbnails
          images={images}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      )}
    </div>
  );
}
