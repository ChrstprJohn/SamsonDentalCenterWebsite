'use client';

import React from 'react';
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

export function AboutSection() {
  return (
    <>
    <section id="about" className="py-12 sm:py-28 bg-[#FDFDFD] relative w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-14 sm:space-y-24">
        
        {/* Row 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Visual Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden border border-white/5 bg-[#1D1E1E]">
              <picture>
                <img
                  src="/hero-bg/HeroBg11.png"
                  alt="Precision natural cosmetic veneers dental artist checking color shades"
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
          </div>

          {/* Content Column */}
          <div className="lg:col-span-6">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
              About Us
            </span>
            <h2 className="font-sans text-[18px] sm:text-[clamp(22px,2vw+12px,36px)] font-normal tracking-[-0.04em] text-[#1D1E1E] leading-[1.1]">
              Quality dental care in the heart of Baguio.
            </h2>

            <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-6 text-[#4F5454] font-light leading-relaxed text-[12px] sm:text-[15px] font-sans">
              <p>
                Samson Dental Center is a dental clinic located on the 5th Floor of S Building along Upper Session Road in Baguio City. The clinic welcomes patients by appointment and provides a convenient location for professional dental care in the city center.
              </p>
              <p className="font-medium text-[#1D1E1E] italic border-l-2 border-[#D94E4E] pl-4">
                &ldquo;Our team is here to make every visit clear, comfortable, and centered on your individual dental needs.&rdquo;
              </p>
              <p>
                For appointments and inquiries, contact Samson Dental Center directly or submit an appointment request through this website. The clinic is open Monday through Saturday, from 9:00 AM to 12:00 PM and 1:00 PM to 5:00 PM.
              </p>
            </div>

            {/* Unique Features */}
            <div className="mt-7 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-100 font-sans">
              <div>
                <h4 className="text-[#1D1E1E] text-sm font-semibold">Central Location</h4>
                <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed font-light">Find us at 5th Floor S Building, Upper Session Road, Baguio City.</p>
              </div>
              <div>
                <h4 className="text-[#1D1E1E] text-sm font-semibold">By Appointment</h4>
                <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed font-light">Call ahead or send an appointment request so our team can assist you.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    {/* Dentist section — hidden for now
    <section id="dentist" className="scroll-mt-28 bg-[#FDFDFD] py-12 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 font-sans">
        <div className="pt-1 sm:pt-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
            <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
                Our Dentist
              </span>
              <h3 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.3] sm:leading-[1.2] md:leading-[1.15]">
                Meet our dentists, the specialists{' '}
                <br className="hidden lg:block" />
                behind your smile.
              </h3>
            </div>
            <p className="text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 max-w-sm md:max-w-[280px] lg:max-w-sm leading-relaxed font-sans pt-2 sm:pt-2">
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
