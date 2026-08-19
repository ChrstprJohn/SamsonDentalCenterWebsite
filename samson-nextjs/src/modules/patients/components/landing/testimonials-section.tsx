'use client';

import React from 'react';
import { TestimonialMarqueeRow, type TestimonialItem } from './sub-components/testimonial-marquee-row';
import type { LandingReview } from '@/modules/reviews/queries/get-featured-landing-reviews.query';

export function TestimonialsSection({ reviews }: { reviews: LandingReview[] }) {
  if (reviews.length === 0) return null;

  const items: TestimonialItem[] = reviews.map((review) => ({
    name: review.patientName,
    pathway: review.serviceName || 'Patient review',
    text: review.comment,
    rating: review.rating,
  }));
  const row1 = items.filter((_, index) => index % 2 === 0);
  const row2 = items.filter((_, index) => index % 2 === 1);

  return (
    <section id="testimonials" className="py-16 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100 overflow-hidden">
      <style>{`@keyframes marquee-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } } #testimonials .animate-marquee { animation-duration: 50s; } .animate-marquee-reverse { animation: marquee-reverse 50s linear infinite; } .animate-marquee-reverse:hover { animation-play-state: paused; }`}</style>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-10 sm:gap-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">Patient Testimonials</span>
            <h2 className="font-sans text-[18px] sm:text-[clamp(20px,2vw+10px,32px)] font-normal leading-[1.05] tracking-[-0.04em] text-[#1D1E1E]">Real feedback from patients who experienced our services.</h2>
          </div>
          <p className="max-w-sm pt-1 font-sans text-[12px] sm:pt-2 sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-[1.65] text-gray-500">Read what our patients say about their experience, from the quality of treatment to the comfort of their visit.</p>
        </div>
        <div className="relative w-full overflow-hidden flex flex-col gap-4 py-2 bg-transparent select-none">
          <div className="absolute inset-y-0 left-0 w-3 sm:w-6 bg-gradient-to-r from-[#FDFDFD] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-3 sm:w-6 bg-gradient-to-l from-[#FDFDFD] to-transparent z-10 pointer-events-none" />
          {row1.length > 0 && <TestimonialMarqueeRow items={[...row1, ...row1, ...row1]} rowId="row1" />}
          {row2.length > 0 && <TestimonialMarqueeRow items={[...row2, ...row2, ...row2]} rowId="row2" reverse />}
        </div>
      </div>
    </section>
  );
}
