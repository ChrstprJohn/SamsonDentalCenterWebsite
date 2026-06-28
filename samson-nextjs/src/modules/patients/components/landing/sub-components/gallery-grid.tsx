'use client';

import { motion, type MotionValue } from 'framer-motion';
import { GalleryCard } from './gallery-card';
import { repeatedPortfolioItems } from './gallery-data';

interface GalleryGridProps {
  galleryRef: React.RefObject<HTMLDivElement | null>;
  translateFirst: MotionValue<number>;
  translateSecond: MotionValue<number>;
  translateThird: MotionValue<number>;
  onSelect: (index: number) => void;
}

export function GalleryGrid({ galleryRef, translateFirst, translateSecond, translateThird, onSelect }: GalleryGridProps) {
  const columns = buildColumns();

  return (
    <div ref={galleryRef} className="w-full relative overflow-hidden">
      <div className="grid grid-cols-2 md:hidden gap-1">
        {columns.slice(0, 2).map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-1">
            {column.map((entry) => <GalleryCard key={`m-${entry.index}`} {...entry} onSelect={onSelect} />)}
          </div>
        ))}
      </div>

      <div className="hidden md:grid grid-cols-3 gap-1.5 w-full bg-transparent">
        {[translateFirst, translateSecond, translateThird].map((translate, colIndex) => (
          <motion.div key={colIndex} style={{ y: translate }} className="flex flex-col gap-1.5">
            {columns[colIndex].map((entry) => <GalleryCard key={`d-${entry.index}`} {...entry} onSelect={onSelect} />)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function buildColumns() {
  const visible = repeatedPortfolioItems.slice(0, 18);
  return [0, 1, 2].map((colIndex) =>
    visible
      .map((item, index) => ({ item, index, aspectClass: index % 5 === 0 ? 'aspect-[960/1270]' : 'aspect-[960/635]' }))
      .filter((_, index) => index % 3 === colIndex)
  );
}
