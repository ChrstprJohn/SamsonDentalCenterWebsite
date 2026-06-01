'use client';

import React from 'react';
import Image from 'next/image';

export function GallerySection() {
  return (
    <section id="gallery" className="py-20 md:py-28 px-6 border-t border-slate-105 dark:border-white/5 bg-white dark:bg-slate-900/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-500 dark:text-blue-400">Facilities Tour</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4">
            Modern Clinical Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Explore our state-of-the-art clinic design engineered to secure hygienic comfort and visual tranquility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-lg group">
            <Image
              src="/images/hero_dental_office.png"
              alt="Operatory Room"
              fill
              sizes="(max-w-768px) 100vw, 450px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-white text-sm font-semibold tracking-wide">Dental Operatory Suite</span>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-lg group">
            <Image
              src="/images/dental_waiting_room.png"
              alt="Waiting Lobby"
              fill
              sizes="(max-w-768px) 100vw, 450px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-white text-sm font-semibold tracking-wide">Luxurious Lobby & Waiting Lounge</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
