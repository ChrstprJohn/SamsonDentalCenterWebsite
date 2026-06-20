'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const galleryItems = [
  {
    id: 1,
    category: 'clinic',
    title: 'Architectural Treatment Suite',
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    category: 'lounge',
    title: 'Therapeutic Quiet Lounge',
    img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    category: 'clinic',
    title: 'Micro-surgical Operatory',
    img: 'https://images.unsplash.com/photo-1513412583855-8d64eb019787?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 4,
    category: 'smiles',
    title: 'Artisanal Natural Veneers',
    img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 5,
    category: 'lounge',
    title: 'Scent-infused Entry Chamber',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
  },
];

export function GallerySection() {
  const [activeTab, setActiveTab] = useState<'all' | 'clinic' | 'smiles' | 'lounge'>('all');

  const filteredGallery =
    activeTab === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeTab);

  return (
    <section id="gallery" className="py-24 bg-[#F3F3EF]/40 relative overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[10px] tracking-[0.34em] text-emerald-800 uppercase font-bold block mb-4">
            Modern Portfolio
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1D1E1E] max-w-2xl">
            Inside Our Sanctuary
          </h2>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 font-sans text-[11px] tracking-widest font-semibold uppercase">
            {[
              { id: 'all', label: 'All Spaces' },
              { id: 'clinic', label: 'Treatment Suites' },
              { id: 'smiles', label: 'Artisan Veneers' },
              { id: 'lounge', label: 'Reception Lounge' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-950 text-white shadow-sm'
                    : 'bg-white/60 text-gray-600 hover:bg-white hover:text-emerald-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Container */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          id="gallery-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group relative h-[320px] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {/* Minimal caption details on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-emerald-300 tracking-widest">
                      {item.category}
                    </span>
                    <h4 className="text-white font-serif text-lg font-light tracking-wide mt-1">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
