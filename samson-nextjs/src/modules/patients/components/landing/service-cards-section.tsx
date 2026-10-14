'use client';

import { CATEGORY_META } from './mock-category-services-section';
import { ArrowRight } from 'lucide-react';
import { useBookingNav } from '../../contexts/booking-nav-context';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function ServiceCardsSection() {
  const { contactClinic, isBookingOpen } = useBookingNav();
  const router = useRouter();
  return (
    <section id="services" className="scroll-mt-24 bg-[#FDFDFD] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-20 md:mb-24 gap-4 sm:gap-6">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="text-xs tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">Our Services</span>
            <h2 className="font-sans text-[clamp(1.5rem,1.25rem+1vw,2rem)] text-balance font-normal leading-[1.25] tracking-[-0.03em] text-[#1D1E1E]">
              Explore the range of services{' '}<br className="hidden lg:block" />we offer at our clinic.
            </h2>
          </div>
          <p className="max-w-sm pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-base font-normal leading-relaxed text-gray-500">{isBookingOpen ? 'Explore our dental services below. Request a consultation to find the right care for you.' : 'Explore our dental services below. To arrange a visit, contact our clinic.'}</p>
        </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {CATEGORY_META.map((category, index) => (
              <article key={category.id} className={`flex flex-col items-center text-center text-[#1D1E1E] lg:pr-6 ${index % 5 !== 4 ? 'lg:border-r lg:border-gray-200' : ''}`}>
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-5 overflow-hidden rounded-full border border-gray-200 bg-white">
                  <Image src={`/images/service-categories/clinical/${category.id}.png`} alt="" fill sizes="(min-width: 640px) 144px, 112px" className="object-cover" />
                </div>
                <div className="w-full max-w-[220px]">
                  <h3 className="text-sm font-semibold uppercase leading-snug tracking-wide text-balance">{category.category}</h3>
                  <p className="mt-2 text-[13px] sm:text-sm leading-relaxed text-[#1D1E1E]/75">{category.description}</p>
                </div>
              </article>
            ))}
          </div>
        <div className="mt-10 sm:mt-14 py-6 sm:py-8 border-y border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-8">
          <div>
            <h3 className="text-lg font-medium text-[#1D1E1E]">Not sure which service you need?</h3>
            <p className="mt-2 max-w-lg text-base leading-relaxed text-gray-600">{isBookingOpen ? 'Book a consultation to discuss your concerns and find the right treatment for you.' : 'Call or email our clinic to discuss your concerns and arrange a consultation.'}</p>
          </div>
          <button type="button" onClick={isBookingOpen ? () => router.push('/book?category=Consultation') : contactClinic} className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#1D1E1E] hover:bg-[#D94E4E] text-white font-sans text-sm font-semibold tracking-wider uppercase transition-colors shrink-0 cursor-pointer">
            {isBookingOpen ? 'Book a Consultation' : 'Contact the Clinic'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
