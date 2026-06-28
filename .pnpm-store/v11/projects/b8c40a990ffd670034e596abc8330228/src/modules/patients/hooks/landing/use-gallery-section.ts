'use client';

import { useRef, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';

export function useGallerySection() {
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: galleryRef, offset: ['start 80px', 'end start'] });
  const translateFirst = useTransform(scrollYProgress, [0, 0.8, 1], [0, -200, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 0.8, 1], [0, 110, 110]);
  const translateThird = useTransform(scrollYProgress, [0, 0.8, 1], [0, -200, -200]);

  return {
    galleryRef,
    selectedPortfolioIndex,
    setSelectedPortfolioIndex,
    translateFirst,
    translateSecond,
    translateThird,
  };
}
