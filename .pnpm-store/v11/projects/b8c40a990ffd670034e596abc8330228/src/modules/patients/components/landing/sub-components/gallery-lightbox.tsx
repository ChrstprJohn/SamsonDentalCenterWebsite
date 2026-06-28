'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { repeatedPortfolioItems } from './gallery-data';

interface GalleryLightboxProps {
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

export function GalleryLightbox({ selectedIndex, onSelect }: GalleryLightboxProps) {
  const item = selectedIndex === null ? null : repeatedPortfolioItems[selectedIndex];

  return (
    <AnimatePresence>
      {item && selectedIndex !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#070808]/95 backdrop-blur-md p-4 sm:p-10 select-none">
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => onSelect(null)} />
          <button onClick={() => onSelect(null)} className="hidden md:flex absolute top-6 right-6 z-[60] w-12 h-12 rounded-full border border-white/10 hover:border-white/30 bg-[#161818]/60 backdrop-blur-md items-center justify-center text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D94E4E]" aria-label="Close Lightbox">
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-5xl h-full max-h-[80vh] flex flex-col justify-center items-center z-10 pointer-events-none">
            <motion.div key={selectedIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="relative w-full h-full flex flex-col items-center justify-center pointer-events-auto">
              {item.type === 'video' ? (
                <video src={item.src} autoPlay muted loop playsInline controls className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10 bg-black" />
              ) : (
                <img src={item.src} alt={item.title} className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10" />
              )}
              <GalleryCaption item={item} />
            </motion.div>
          </div>
          <LightboxArrow direction="previous" onClick={() => onSelect(selectedIndex === 0 ? repeatedPortfolioItems.length - 1 : selectedIndex - 1)} />
          <LightboxArrow direction="next" onClick={() => onSelect(selectedIndex === repeatedPortfolioItems.length - 1 ? 0 : selectedIndex + 1)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GalleryCaption({ item }: { item: (typeof repeatedPortfolioItems)[number] }) {
  return (
    <div className="absolute bottom-[-60px] text-center w-full px-4">
      <h4 className="text-white font-serif text-lg sm:text-xl font-light tracking-wide">{item.title}</h4>
      <div className="flex justify-center gap-2 mt-2">
        {item.tags.map((tag) => <span key={tag} className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#BAC1C1] bg-[#161818] border border-white/5 px-2.5 py-1 rounded">{tag}</span>)}
      </div>
    </div>
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
