'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DoctorCard } from './sub-components/doctor-card';

const doctorsData = [
  {
    name: 'Dr. Christopher Samson',
    role: 'Lead Prosthodontist & Smile Designer',
    bio: 'Specializes in microscopic veneers, full-mouth biological reconstructions, and cranial symmetry harmonization.',
  },
  {
    name: 'Dr. Andrea Santos',
    role: 'Micro-Endodontic Specialist',
    bio: 'Expert in dental operating microscopes, root tubule disinfection, and highly precise root canal therapy.',
  },
  {
    name: 'Dr. Marcus Reyes',
    role: 'Periodontal Surgeon & Implantologist',
    bio: 'Dedicated to advanced bone tissue regeneration, computer-guided implant placement, and biological recovery.',
  },
];

const carouselImages = [6, 7, 8, 9, 10, 11, 12].map((n) => `/img/Img (${n}).jpg`);

function WideImageCarousel() {
  return (
    <>
    <div className="py-16 sm:py-32 bg-[#FDFDFD] relative w-full overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-10 sm:gap-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6"
      >
        <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
          <span className="text-xs tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
            Inside the Clinic
          </span>
          <h3 className="font-sans text-[clamp(1.5rem,1.25rem+1vw,2rem)] text-balance font-normal leading-[1.25] tracking-[-0.03em] text-[#1D1E1E]">
            A look around <br className="hidden lg:block" />
            Samson Dental Center.
          </h3>
        </div>
        <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-base font-normal leading-relaxed text-gray-500">
          Our clinic, our team, and the space where your smile is cared for.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        className="relative w-full overflow-hidden"
      >
        <style>{`#about-marquee { animation-duration: 45s; } #about-marquee img:nth-child(odd) { margin-top: 2rem; } #about-marquee img:nth-child(even) { margin-bottom: 2rem; }`}</style>
        <div className="absolute inset-y-0 left-0 w-[5%] sm:w-[8%] bg-gradient-to-r from-[#FDFDFD] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[5%] sm:w-[8%] bg-gradient-to-l from-[#FDFDFD] to-transparent z-10 pointer-events-none" />
        <div
          id="about-marquee"
          className="animate-marquee gap-2 sm:gap-3"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          {[...carouselImages, ...carouselImages].map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Clinic gallery ${(i % carouselImages.length) + 1}`}
              className="h-48 sm:h-64 w-auto object-cover shrink-0"
            />
          ))}
        </div>
      </motion.div>
    </div>
  </div>
    </>
  );
}

export function AboutSection() {
  return (
    <>
    <section id="about" className="py-12 sm:py-28 bg-[#FDFDFD] relative w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-14 sm:space-y-24">
        
        {/* Row 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Visual Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden border border-white/5 bg-[#1D1E1E]">
              <picture>
                <img
                  src="/hero-bg/HeroBg6.png"
                  alt="Samson Dental Center clinic care"
                  className="w-full h-full object-cover object-right filter sepia-[0.1]"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Overlay architectural detail badge (Sharp border matching services) */}
            <div className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:right-6 bg-[#1D1E1E] text-white p-4 sm:p-6 max-w-xs border border border-white/10 font-sans">
              <p className="font-serif text-xl sm:text-2xl font-light tracking-tight leading-none text-[#D94E4E]">
                Since 1964
              </p>
              <p className="text-[10px] tracking-widest font-semibold uppercase mt-2 text-white/80">
                Trusted dental care
              </p>
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-6"
          >
            <span className="text-xs tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
              About Us
            </span>
            <h2 className="font-sans text-[clamp(1.5rem,1.25rem+1vw,2rem)] text-balance font-normal leading-[1.25] tracking-[-0.03em] text-[#1D1E1E]">
              Trusted Dental Care in Baguio City.
            </h2>

            <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-6 text-gray-500 font-normal leading-relaxed text-base font-sans">
              <p>
                At Samson Dental Center, we combine our dentists’ expertise with attentive, personalized care. Patients in Baguio City trust us with their dental health and recommend our clinic to family and friends.
              </p>
              <p>
                We take time to understand your concerns and goals, then tailor your care—from preventive treatments to complex restorations. Our approach is built on trust, honest communication, and lasting relationships with our patients.
              </p>
            </div>

            {/* Unique Features */}
            <div className="mt-7 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-gray-100 font-sans">
              <div>
                <h4 className="text-[#1D1E1E] text-lg sm:text-xl font-semibold flex items-center gap-2">
                  Central Location
                </h4>
                <p className="text-base text-[#2C2E2E] font-medium mt-1.5 leading-relaxed">
                  5th Floor S Building, Upper Session Road, Baguio City
                </p>
              </div>
              <div>
                <h4 className="text-[#1D1E1E] text-lg sm:text-xl font-semibold flex items-center gap-2">
                  Opening Hours
                </h4>
                <p className="text-base text-[#2C2E2E] font-medium mt-2 leading-relaxed space-y-1">
                  <span className="block font-semibold">Monday – Saturday</span>
                  <span className="block whitespace-nowrap font-semibold">9:00am – 12:00pm</span>
                  <span className="block whitespace-nowrap font-semibold">1:00pm – 5:00pm</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>

    {/* Wide image carousel */}
    <WideImageCarousel />

    {/* Dentist section — hidden for now
    <section id="dentist" className="scroll-mt-28 bg-[#FDFDFD] py-12 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 font-sans">
        <div className="pt-1 sm:pt-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
            <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
              <span className="text-xs tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
                Our Dentist
              </span>
              <h3 className="font-sans text-[clamp(1.5rem,1.25rem+1vw,2rem)] text-balance font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.25]">
                Meet our dentists, the specialists{' '}
                <br className="hidden lg:block" />
                behind your smile.
              </h3>
            </div>
            <p className="text-base font-normal text-gray-500 max-w-sm md:max-w-[280px] lg:max-w-sm leading-relaxed font-sans pt-2 sm:pt-2">
              Your smile is in good hands with our dentists, from everyday checkups to advanced treatments, with every visit clear and comfortable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctorsData.map((doc) => (
              <DoctorCard key={doc.name} {...doc} />
            ))}
          </div>
        </div>
      </div>
    </section>
    */}
    </>
  );
}
