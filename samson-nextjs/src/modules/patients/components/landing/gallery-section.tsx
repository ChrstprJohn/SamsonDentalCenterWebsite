'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const portfolioItems = [
  {
    id: 1,
    type: 'video',
    src: 'https://lavadental.lv/cms/api/media/file/v1.webm',
    tags: ['Dental implants', 'Veneers'],
    title: 'Precision Implant & Veneer Restoration'
  },
  {
    id: 2,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/2p%C4%93c-7-960x635.avif',
    tags: ['Veneers'],
    title: 'Aesthetic Porcelain Veneers Transformation'
  },
  {
    id: 3,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/3p%C4%93c-1-960x635.avif',
    tags: ['Veneers'],
    title: 'Custom Shaded Anterior Veneers'
  },
  {
    id: 4,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/1p%C4%93c-2-960x635.avif',
    tags: ['ALL-ON-X'],
    title: 'Full Arch ALL-ON-X Rejuvenation'
  },
  {
    id: 5,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/1p%C4%93c-3-960x635.avif',
    tags: ['ALL-ON-X'],
    title: 'Comprehensive ALL-ON-X Rehabilitation'
  },
  {
    id: 6,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/2p%C4%93c-1-960x635.avif',
    tags: ['Endodontics', 'Veneers'],
    title: 'Integrated Endodontic & Veneer Restoration'
  },
  {
    id: 7,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/3p%C4%93c-2-960x635.avif',
    tags: ['Veneers'],
    title: 'Full Smile Veneer Perfecting'
  },
  {
    id: 8,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/3p%C4%93c-3-960x635.avif',
    tags: ['Veneers', 'Therapy'],
    title: 'Combined Veneers & Functional Therapy'
  },
  {
    id: 9,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/4p%C4%93c-960x635.avif',
    tags: ['Endodontics', 'Dental implants'],
    title: 'Advanced Implantology & Endodontics'
  },
  {
    id: 10,
    type: 'image',
    src: 'https://lavadental.lv/cms/api/media/file/1p%C4%93c-8-960x635.avif',
    tags: ['Professional hygiene', 'Veneers'],
    title: 'Professional Hygiene & Veneer Finish'
  }
];

// Dynamically generate a repeating chain of portfolio items (50 items total, 10 complete sets)
const repeatedPortfolioItems = Array.from({ length: 50 }, (_, index) => {
  const baseItem = portfolioItems[index % portfolioItems.length];
  return {
    ...baseItem,
    id: index + 1,
    title: baseItem.title,
  };
});

interface PortfolioCardProps {
  item: typeof repeatedPortfolioItems[0];
  globalIndex: number;
  aspectClass: string;
  onSelect: (index: number) => void;
}

const PortfolioCard = ({ 
  item, 
  globalIndex, 
  aspectClass, 
  onSelect 
}: PortfolioCardProps) => {
  return (
    <div 
      className={`relative w-full overflow-hidden cursor-pointer ${aspectClass} group bg-[#161818]`}
      onClick={() => onSelect(globalIndex)}
    >
      {item.type === 'video' ? (
        <video
          src={item.src}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      ) : (
        <img
          src={item.src}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      )}
      
      {/* Light highlight overlay on hover */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Floating clean sharp tags at bottom-left */}
      <div 
        id={`card-tags-${globalIndex}`}
        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 hidden md:flex flex-wrap gap-[6px] sm:gap-2 pointer-events-none"
      >
        {item.tags.map(tag => (
          <span 
            key={tag}
            className="bg-[#F5F5F7] text-[#1D1E1E] text-[8px] sm:text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm rounded-[1px] select-none"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export function GallerySection() {
  const [portfolioVisibleSets, setPortfolioVisibleSets] = useState(3); // Start with 3 sets (15 items) by default
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<number | null>(null);

  // Gallery Parallax scroll references
  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: galleryScrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start 80px", "end start"]
  });

  const translateFirst = useTransform(galleryScrollYProgress, [0, 0.8, 1], [0, -200, -200]);
  const translateSecond = useTransform(galleryScrollYProgress, [0, 0.8, 1], [0, 110, 110]);
  const translateThird = useTransform(galleryScrollYProgress, [0, 0.8, 1], [0, -200, -200]);

  return (
    <section 
      id="gallery" 
      className="relative overflow-hidden z-20 pt-16 pb-0 md:pt-24 md:pb-0 bg-[#FDFDFD]"
    >
      {/* Background split */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-x-0 top-0 bg-[#1D1E1E] h-[70%]" />
        {/* ponytail: static noise overlay prevents browser repainting on scroll */}
        <div 
          className="absolute inset-x-0 top-0 h-[70%] opacity-[0.06] mix-blend-overlay pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12">
        
        {/* Header Layout */}
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

        {/* Image grid top container - targets parallax scroll only from here */}
        <div ref={galleryRef} className="w-full relative overflow-hidden">
          
          {/* Mobile 2-Column Responsive Layout - Contained and padded */}
          {(() => {
            const mobileLeft: Array<{ item: typeof repeatedPortfolioItems[0]; globalIndex: number; aspectClass: string }> = [];
            const mobileRight: Array<{ item: typeof repeatedPortfolioItems[0]; globalIndex: number; aspectClass: string }> = [];

            for (let setIdx = 0; setIdx < portfolioVisibleSets; setIdx++) {
              const startIndex = setIdx * 5;
              const isEven = setIdx % 2 === 0;
              
              if (isEven) {
                if (startIndex + 0 < repeatedPortfolioItems.length) {
                  mobileLeft.push({ 
                    item: repeatedPortfolioItems[startIndex + 0], 
                    globalIndex: startIndex + 0,
                    aspectClass: "aspect-[960/1270]"
                  });
                }
                if (startIndex + 3 < repeatedPortfolioItems.length) {
                  mobileLeft.push({ 
                    item: repeatedPortfolioItems[startIndex + 3], 
                    globalIndex: startIndex + 3,
                    aspectClass: "aspect-[960/635]"
                  });
                }

                if (startIndex + 1 < repeatedPortfolioItems.length) {
                  mobileRight.push({ 
                    item: repeatedPortfolioItems[startIndex + 1], 
                    globalIndex: startIndex + 1,
                    aspectClass: "aspect-[960/635]"
                  });
                }
                if (startIndex + 2 < repeatedPortfolioItems.length) {
                  mobileRight.push({ 
                    item: repeatedPortfolioItems[startIndex + 2], 
                    globalIndex: startIndex + 2,
                    aspectClass: "aspect-[960/635]"
                  });
                }
                if (startIndex + 4 < repeatedPortfolioItems.length) {
                  mobileRight.push({ 
                    item: repeatedPortfolioItems[startIndex + 4], 
                    globalIndex: startIndex + 4,
                    aspectClass: "aspect-[960/635]"
                  });
                }
              } else {
                if (startIndex + 0 < repeatedPortfolioItems.length) {
                  mobileLeft.push({ 
                    item: repeatedPortfolioItems[startIndex + 0], 
                    globalIndex: startIndex + 0,
                    aspectClass: "aspect-[960/635]"
                  });
                }
                if (startIndex + 1 < repeatedPortfolioItems.length) {
                  mobileLeft.push({ 
                    item: repeatedPortfolioItems[startIndex + 1], 
                    globalIndex: startIndex + 1,
                    aspectClass: "aspect-[960/635]"
                  });
                }
                if (startIndex + 2 < repeatedPortfolioItems.length) {
                  mobileLeft.push({ 
                    item: repeatedPortfolioItems[startIndex + 2], 
                    globalIndex: startIndex + 2,
                    aspectClass: "aspect-[960/635]"
                  });
                }

                if (startIndex + 4 < repeatedPortfolioItems.length) {
                  mobileRight.push({ 
                    item: repeatedPortfolioItems[startIndex + 4], 
                    globalIndex: startIndex + 4,
                    aspectClass: "aspect-[960/1270]"
                  });
                }
                if (startIndex + 3 < repeatedPortfolioItems.length) {
                  mobileRight.push({ 
                    item: repeatedPortfolioItems[startIndex + 3], 
                    globalIndex: startIndex + 3,
                    aspectClass: "aspect-[960/635]"
                  });
                }
              }
            }

            return (
              <div id="mobile-gallery-cols" className="flex md:hidden w-full gap-1 bg-transparent overflow-hidden">
                {/* Left Column of Mobile */}
                <div className="flex-1 flex flex-col gap-1">
                  {mobileLeft.map(({ item, globalIndex, aspectClass }) => (
                    <PortfolioCard 
                      key={`mob-l-${globalIndex}`}
                      item={item} 
                      globalIndex={globalIndex} 
                      aspectClass={aspectClass} 
                      onSelect={setSelectedPortfolioIndex} 
                    />
                  ))}
                </div>

                {/* Right Column of Mobile */}
                <div className="flex-1 flex flex-col gap-1">
                  {mobileRight.map(({ item, globalIndex, aspectClass }) => (
                    <PortfolioCard 
                      key={`mob-r-${globalIndex}`}
                      item={item} 
                      globalIndex={globalIndex} 
                      aspectClass={aspectClass} 
                      onSelect={setSelectedPortfolioIndex} 
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Desktop 3-Column Alternating Grid Layout */}
          {(() => {
            const col1Items: Array<{ item: typeof repeatedPortfolioItems[0]; globalIndex: number; aspectClass: string }> = [];
            const col2Items: Array<{ item: typeof repeatedPortfolioItems[0]; globalIndex: number; aspectClass: string }> = [];
            const col3Items: Array<{ item: typeof repeatedPortfolioItems[0]; globalIndex: number; aspectClass: string }> = [];

            for (let setIndex = 0; setIndex < portfolioVisibleSets; setIndex++) {
              const startIndex = setIndex * 5;
              const setSubset = repeatedPortfolioItems.slice(startIndex, startIndex + 5);
              
              // Set 0 has tall on Left. Set 1 and Set 2 have tall on Right.
              const isTallLeft = (setIndex === 0);

              if (isTallLeft) {
                if (setSubset[0]) col1Items.push({ item: setSubset[0], globalIndex: startIndex + 0, aspectClass: "aspect-[960/1270]" });
                if (setSubset[1]) col2Items.push({ item: setSubset[1], globalIndex: startIndex + 1, aspectClass: "aspect-[960/635]" });
                if (setSubset[3]) col2Items.push({ item: setSubset[3], globalIndex: startIndex + 3, aspectClass: "aspect-[960/635]" });
                if (setSubset[2]) col3Items.push({ item: setSubset[2], globalIndex: startIndex + 2, aspectClass: "aspect-[960/635]" });
                if (setSubset[4]) col3Items.push({ item: setSubset[4], globalIndex: startIndex + 4, aspectClass: "aspect-[960/635]" });
              } else {
                if (setSubset[0]) col1Items.push({ item: setSubset[0], globalIndex: startIndex + 0, aspectClass: "aspect-[960/635]" });
                if (setSubset[2]) col1Items.push({ item: setSubset[2], globalIndex: startIndex + 2, aspectClass: "aspect-[960/635]" });
                if (setSubset[1]) col2Items.push({ item: setSubset[1], globalIndex: startIndex + 1, aspectClass: "aspect-[960/635]" });
                if (setSubset[3]) col2Items.push({ item: setSubset[3], globalIndex: startIndex + 3, aspectClass: "aspect-[960/635]" });
                if (setSubset[4]) col3Items.push({ item: setSubset[4], globalIndex: startIndex + 4, aspectClass: "aspect-[960/1270]" });
              }
            }

            // Append extra visual tail images to Column 1 and Column 3 to ensure they don't show blank space when shifted highly upwards.
            const extraStartIndex = portfolioVisibleSets * 5;
            
            // Col 1 extra image (1 image)
            const col1Extra = repeatedPortfolioItems[extraStartIndex % repeatedPortfolioItems.length];
            col1Items.push({ item: col1Extra, globalIndex: extraStartIndex % repeatedPortfolioItems.length, aspectClass: "aspect-[960/635]" });

            // Col 3 extra image (1 image)
            const col3Extra = repeatedPortfolioItems[(extraStartIndex + 1) % repeatedPortfolioItems.length];
            col3Items.push({ item: col3Extra, globalIndex: (extraStartIndex + 1) % repeatedPortfolioItems.length, aspectClass: "aspect-[960/635]" });

            return (
              <div className="hidden md:grid grid-cols-3 gap-1.5 w-full bg-transparent">
                {/* Column 1 (Left Column) - Glides highly upwards */}
                <motion.div style={{ y: translateFirst }} className="flex flex-col gap-1.5">
                  {col1Items.map(({ item, globalIndex, aspectClass }, idx) => (
                    <PortfolioCard 
                      key={`col1-${globalIndex}-${idx}`} 
                      item={item} 
                      globalIndex={globalIndex} 
                      aspectClass={aspectClass} 
                      onSelect={setSelectedPortfolioIndex} 
                    />
                  ))}
                </motion.div>

                {/* Column 2 (Center Column) - Glides slightly downwards */}
                <motion.div style={{ y: translateSecond }} className="flex flex-col gap-1.5">
                  {col2Items.map(({ item, globalIndex, aspectClass }, idx) => (
                    <PortfolioCard 
                      key={`col2-${globalIndex}-${idx}`} 
                      item={item} 
                      globalIndex={globalIndex} 
                      aspectClass={aspectClass} 
                      onSelect={setSelectedPortfolioIndex} 
                    />
                  ))}
                </motion.div>

                {/* Column 3 (Right Column) - Glides highly upwards */}
                <motion.div style={{ y: translateThird }} className="flex flex-col gap-1.5">
                  {col3Items.map(({ item, globalIndex, aspectClass }, idx) => (
                    <PortfolioCard 
                      key={`col3-${globalIndex}-${idx}`} 
                      item={item} 
                      globalIndex={globalIndex} 
                      aspectClass={aspectClass} 
                      onSelect={setSelectedPortfolioIndex} 
                    />
                  ))}
                </motion.div>
              </div>
            );
          })()}
        </div>

      </div>

      {/* Lightbox Modal Slider Component */}
      <AnimatePresence>
        {selectedPortfolioIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#070808]/95 backdrop-blur-md p-4 sm:p-10 select-none"
          >
            <div 
              className="absolute inset-0 cursor-zoom-out" 
              onClick={() => setSelectedPortfolioIndex(null)} 
            />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPortfolioIndex(null)}
              className="hidden md:flex absolute top-6 right-6 z-[60] w-12 h-12 rounded-full border border-white/10 hover:border-white/30 bg-[#161818]/60 backdrop-blur-md items-center justify-center text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D94E4E]"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slider Content Wrapper */}
            <div className="relative w-full max-w-5xl h-full max-h-[80vh] flex flex-col justify-center items-center z-10 pointer-events-none">
              
              {/* Inner Stage Card */}
              <motion.div
                key={selectedPortfolioIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex flex-col items-center justify-center pointer-events-auto"
              >
                {repeatedPortfolioItems[selectedPortfolioIndex].type === 'video' ? (
                  <video
                    src={repeatedPortfolioItems[selectedPortfolioIndex].src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10 bg-black"
                  />
                ) : (
                  <img
                    src={repeatedPortfolioItems[selectedPortfolioIndex].src}
                    alt={repeatedPortfolioItems[selectedPortfolioIndex].title}
                    className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10"
                  />
                )}

                {/* Caption details at bottom */}
                <div className="absolute bottom-[-60px] text-center w-full px-4">
                  <h4 className="text-white font-serif text-lg sm:text-xl font-light tracking-wide">
                    {repeatedPortfolioItems[selectedPortfolioIndex].title}
                  </h4>
                  <div className="flex justify-center gap-2 mt-2">
                    {repeatedPortfolioItems[selectedPortfolioIndex].tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#BAC1C1] bg-[#161818] border border-white/5 px-2.5 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Precise Navigation arrows */}
            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPortfolioIndex((prev) => 
                  prev !== null ? (prev === 0 ? repeatedPortfolioItems.length - 1 : prev - 1) : 0
                );
              }}
              className="hidden md:flex absolute left-4 sm:left-8 z-[60] w-12 h-12 rounded-full border border-white/10 hover:border-white/30 bg-[#161818]/60 backdrop-blur-md items-center justify-center text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D94E4E]"
              aria-label="Previous Transformation"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPortfolioIndex((prev) => 
                  prev !== null ? (prev === repeatedPortfolioItems.length - 1 ? 0 : prev + 1) : 0
                );
              }}
              className="hidden md:flex absolute right-4 sm:right-8 z-[60] w-12 h-12 rounded-full border border-white/10 hover:border-white/30 bg-[#161818]/60 backdrop-blur-md items-center justify-center text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D94E4E]"
              aria-label="Next Transformation"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
