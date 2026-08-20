'use client';

import type { PortfolioItem } from './gallery-data';

interface GalleryCardProps {
  item: PortfolioItem;
  index: number;
  aspectClass?: string;
  onSelect: (index: number) => void;
}

export function GalleryCard({ item, index, aspectClass = 'aspect-[960/635]', onSelect }: GalleryCardProps) {
  return (
    <div className={`relative w-full overflow-hidden cursor-pointer ${aspectClass} group bg-[#161818]`} onClick={() => onSelect(index)}>
      {item.src && (
        <img src={item.src} alt={item.title} loading="lazy" className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] ${item.src === '/new-assets/new-asset (10).png' ? 'object-top' : ''}`} />
      )}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
