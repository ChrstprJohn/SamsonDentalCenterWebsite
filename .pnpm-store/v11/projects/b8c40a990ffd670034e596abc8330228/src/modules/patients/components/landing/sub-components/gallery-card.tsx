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
      {item.type === 'video' ? (
        <video src={item.src} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
      ) : (
        <img src={item.src} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
      )}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 hidden md:flex flex-wrap gap-[6px] sm:gap-2 pointer-events-none">
        {item.tags.map((tag) => (
          <span key={tag} className="bg-[#F5F5F7] text-[#1D1E1E] text-[8px] sm:text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm rounded-[1px] select-none">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
