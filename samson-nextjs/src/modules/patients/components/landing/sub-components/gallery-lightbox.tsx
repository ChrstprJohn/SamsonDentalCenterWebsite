'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryItems } from './gallery-data';
import type { PortfolioItem } from './gallery-data';

interface GalleryLightboxProps {
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

export function GalleryLightbox({ selectedIndex, onSelect }: GalleryLightboxProps) {
  const item: PortfolioItem | null = selectedIndex === null ? null : galleryItems[selectedIndex];

  return (
    <AnimatePresence>
      {item && selectedIndex !== null && (
        <motion.div onClick={() => onSelect(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 bottom-0 top-20 z-40 flex items-center justify-center bg-[#070808]/90 backdrop-blur-sm p-4 sm:p-8 select-none">
          <div className="relative w-full max-w-4xl h-full max-h-[68vh] flex flex-col justify-center items-center z-10 pointer-events-none">
            <motion.div onClick={(event) => event.stopPropagation()} key={selectedIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="relative w-full h-full flex flex-col items-center justify-center pointer-events-auto">
              {item.src && (
                <img src={item.src} alt={item.title} className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10" />
              )}
            </motion.div>
          </div>
          <LightboxArrow direction="previous" onClick={() => onSelect(selectedIndex === 0 ? galleryItems.length - 1 : selectedIndex - 1)} />
          <LightboxArrow direction="next" onClick={() => onSelect(selectedIndex === galleryItems.length - 1 ? 0 : selectedIndex + 1)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LightboxArrow({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  return (
    <button onClick={(event) => { event.stopPropagation(); onClick(); }} className={`hidden md:flex absolute ${isPrevious ? 'left-4 sm:left-8' : 'right-4 sm:right-8'} z-[60] w-12 h-12 rounded-full border border-white/10 hover:border-white/30 bg-[#161818]/60 backdrop-blur-md items-center justify-center text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D94E4E]`} aria-label={`${direction} Transformation`}>
      <Icon className="w-5 h-5" />
    </button>
  );
}
