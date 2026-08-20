'use client';

import { motion, type MotionValue } from 'framer-motion';
import { GalleryCard } from './gallery-card';
import { galleryItems } from './gallery-data';

interface GalleryGridProps {
  galleryRef: React.RefObject<HTMLDivElement | null>;
  translateFirst: MotionValue<number>;
  translateSecond: MotionValue<number>;
  translateThird: MotionValue<number>;
  onSelect: (index: number) => void;
}

export function GalleryGrid({ galleryRef, translateFirst, translateSecond, translateThird, onSelect }: GalleryGridProps) {
  const columns = buildColumns(3);
  const mobileColumns = buildColumns(2);

  return (
    <div ref={galleryRef} className="w-full relative overflow-hidden">
      <div className="grid grid-cols-2 md:hidden gap-1">
        {mobileColumns.map((column, colIndex) => (
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

function buildColumns(columnCount: number) {
  return Array.from({ length: columnCount }, (_, colIndex) =>
    galleryItems
      .map((item, index) => ({ item, index, aspectClass: item.tags.length >= 2 ? 'aspect-[960/1270]' : 'aspect-[960/635]' }))
      .filter((entry) => entry.index % columnCount === colIndex)
  );
}
