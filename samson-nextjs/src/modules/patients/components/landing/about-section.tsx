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

const carouselImages = [6, 7, 8, 9, 10, 11, 12].map((n) => `/img/Img (${n}).jpg`);

function WideImageCarousel() {
  return (
    <>
    <div className="py-16 sm:py-32 bg-[#FDFDFD] relative w-full overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-10 sm:gap-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
        <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
          <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
            Inside the Clinic
          </span>
          <h3 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
            A look around <br className="hidden lg:block" />
            Samson Dental Center.
          </h3>
        </div>
        <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
          Our clinic, our team, and the space where your smile is cared for.
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
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
      </div>
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
          <div className="lg:col-span-6 relative">
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
          </div>

          {/* Content Column */}
          <div className="lg:col-span-6">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
              About Us
            </span>
            <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
              Welcome to Samson Dental Center. <br className="hidden sm:block" />
              Trusted Dental Care in Baguio City.
            </h2>

            <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-6 text-[#4F5454] font-light leading-relaxed text-[12px] sm:text-[15px] font-sans">
              <p>
                Patients in Baguio City choose our dental clinic because they know they can trust our dentists’ expertise and commitment to providing excellent care. Our patients consistently refer their families and friends to us, thanks to the exceptional, personalized service and positive experiences they have with our team.
              </p>
              <p>
                We take the time to carefully understand each patient’s unique dental health needs and goals. Our dentists draw on their extensive knowledge and skills to deliver high-quality, tailored treatments that improve oral health and appearance. Just as importantly, we prioritize building lifelong relationships with our patients, founded on trust, honesty, and a genuine concern for their wellbeing.
              </p>
              <p>
                From preventative care to complex restorations, you can count on our dental clinic to provide the compassionate, professional service you deserve. Experience the difference our dedication to exceptional dentistry can make – contact us today to schedule your appointment.
              </p>
            </div>

            {/* Unique Features */}
            <div className="mt-7 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-100 font-sans">
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-gray-100/80">
                <h4 className="text-[#1D1E1E] text-base font-semibold flex items-center gap-2">
                  Central Location
                </h4>
                <p className="text-[13px] text-[#2C2E2E] font-medium mt-1.5 leading-relaxed">
                  5th Floor S Building, Upper Session Road, Baguio City
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-gray-100/80">
                <h4 className="text-[#1D1E1E] text-base font-semibold flex items-center gap-2">
                  Opening Hours
                </h4>
                <p className="text-[13px] text-[#2C2E2E] font-medium mt-1.5 leading-relaxed">
                  Monday – Saturday<br />
                  <span className="text-[#595E5E] font-normal text-[12.5px]">9:00am – 12:00pm &amp; 1:00pm – 5:00pm</span>
                </p>
              </div>
            </div>
          </div>
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
