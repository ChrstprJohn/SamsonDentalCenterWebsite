'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGallerySection } from '../../hooks/landing/use-gallery-section';
import { GalleryGrid } from './sub-components/gallery-grid';
import { GalleryLightbox } from './sub-components/gallery-lightbox';

export function GallerySection() {
  const gallery = useGallerySection();

  return (
    <section id="gallery" className="relative overflow-hidden z-20 pt-16 sm:pt-32 bg-[#FDFDFD]">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-x-0 top-0 bg-[#1D1E1E] h-[42%]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12">
        <GalleryHeader />
        <GalleryGrid
          galleryRef={gallery.galleryRef}
          translateFirst={gallery.translateFirst}
          translateSecond={gallery.translateSecond}
          translateThird={gallery.translateThird}
          onSelect={gallery.setSelectedPortfolioIndex}
        />
      </div>

      <GalleryLightbox
        selectedIndex={gallery.selectedPortfolioIndex}
        onSelect={gallery.setSelectedPortfolioIndex}
      />
    </section>
  );
}

function GalleryHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-20 md:mb-24 gap-4 sm:gap-6"
    >
      <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
        <span className="text-xs tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
          Clinic Gallery
        </span>
        <h2 className="font-sans text-[clamp(1.5rem,1.25rem+1vw,2rem)] text-balance font-normal leading-[1.25] tracking-[-0.03em] text-white">
          A compilation of our work and{' '}
          <br className="hidden lg:block" />
          the results we deliver.
        </h2>
      </div>
      <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-base font-normal leading-relaxed text-white/70">
        We showcase real cases treated at our clinic, highlighting the quality of our dental care and the outcomes our patients achieve.
      </p>
    </motion.div>
  );
}
