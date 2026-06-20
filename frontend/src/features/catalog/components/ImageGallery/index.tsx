import { useRef, useState } from 'react';
import type { ImageRef } from '@/types/common';
import ImageGalleryThumbnails from './ImageGallery.Thumbnails';

type Props = {
  images: ImageRef[];
  name: string;
  tag?: string;
};

export default function ImageGallery({ images, name, tag }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const isTouching = useRef(false);

  if (images.length === 0) {
    return (
      <div className="flex-1 aspect-[4/5] bg-stone-100 rounded-[8px] flex items-center justify-center">
        <span className="text-gray-300 text-6xl">✦</span>
      </div>
    );
  }

  const active = images[activeIndex];
  const src = `${import.meta.env.VITE_API_BASE_URL}${active.url}`;

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function handleMouseEnter() {
    if (!isTouching.current) setZoom(true);
  }

  function handleMouseLeave() {
    setZoom(false);
    isTouching.current = false;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isTouching.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  }

  function handleTouchStart(e: React.TouchEvent) {
    isTouching.current = true;
    touchStartX.current = e.touches[0].clientX;
    setZoom(false);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  }

  return (
    <div className="flex gap-4">
      {images.length > 1 && (
        <ImageGalleryThumbnails
          images={images}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      )}

      <div
        className="relative flex-1 overflow-hidden rounded-[8px] aspect-[4/5] bg-white group sm:cursor-crosshair select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={active.id}
          src={src}
          alt={active.alt_text ?? name}
          className="w-full h-full object-cover animate-fadeIn"
          style={{
            transform: zoom ? 'scale(2)' : 'scale(1)',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transition: zoom ? 'none' : 'transform 100ms ease-out',
          }}
        />

        {tag && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-white text-xs tracking-wider uppercase text-gray-900 rounded-[4px] font-medium">
            {tag}
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white transition-colors rounded-full opacity-0 group-hover:opacity-100 text-gray-900 text-xl leading-none"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white transition-colors rounded-full opacity-0 group-hover:opacity-100 text-gray-900 text-xl leading-none"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIndex ? 'bg-primary-dark' : 'bg-gray-400/50'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
