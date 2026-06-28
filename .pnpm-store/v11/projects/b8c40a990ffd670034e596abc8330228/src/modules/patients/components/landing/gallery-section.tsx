'use client';

import React from 'react';
import { useGallerySection } from '../../hooks/landing/use-gallery-section';
import { GalleryGrid } from './sub-components/gallery-grid';
import { GalleryLightbox } from './sub-components/gallery-lightbox';

export function GallerySection() {
  const gallery = useGallerySection();

  return (
    <section id="gallery" className="relative overflow-hidden z-20 pt-16 pb-0 md:pt-24 md:pb-0 bg-[#FDFDFD]">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-x-0 top-0 bg-[#1D1E1E] h-[70%]" />
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
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-24 gap-6">
      <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
        <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
          Transformation Gallery
        </span>
        <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-white leading-[1.05]">
          Expert craftsmanship dedicated to restoring pristine harmony and natural smiles.
        </h2>
      </div>
      <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-white/70 max-w-sm leading-[1.65] font-sans pt-2">
        Witness the art and science of reconstructive facial surgery through our actual patient transformations, demonstrating pristine cosmetic harmony and clinical perfection.
      </p>
    </div>
  );
}
