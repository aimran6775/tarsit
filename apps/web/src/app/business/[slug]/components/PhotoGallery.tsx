'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  featured: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  businessName: string;
}

export function PhotoGallery({ photos, businessName }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
      <div className="relative">
        <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900">
          <Image
            src={photos[activeIndex]?.url || ''}
            alt={`${businessName} photo ${activeIndex + 1}`}
            fill
            className="object-cover"
          />
        </div>
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex(i => (i - 1 + photos.length) % photos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveIndex(i => (i + 1) % photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === activeIndex ? 'border-purple-500' : 'border-transparent'
              }`}
            >
              <Image
                src={photo.url}
                alt={`Thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
