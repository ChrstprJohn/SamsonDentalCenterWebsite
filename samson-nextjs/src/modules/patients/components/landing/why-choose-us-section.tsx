import React from 'react';
import {
  Award,
  MapPin,
  CircleDollarSign,
  Clock,
  HeartPulse,
  Cpu,
  Smile,
  ShieldCheck,
  Check,
} from 'lucide-react';

const whyChooseUsFeatures = [
  {
    icon: Award,
    title: 'Multi-Generational Expertise',
    text: 'Built on over six decades of clinical practice, combining generations of family trust with modern dental care.',
  },
  {
    icon: MapPin,
    title: 'Central & Accessible Location',
    text: 'Conveniently located on Upper Session Road, making it easy to pop in for routine visits or scheduled care.',
  },
  {
    icon: CircleDollarSign,
    title: 'Transparent & Fair Pricing',
    text: "Clear treatment estimates up front with no surprise costs, helping you plan your family's care with confidence.",
  },
  {
    icon: Clock,
    title: 'Minimal Wait Times',
    text: 'We respect your schedule with punctual appointments and attentive care designed to get you back to your day smoothly.',
  },
  {
    icon: HeartPulse,
    title: 'Emergency Dental Care',
    text: 'Fast, reliable treatment for unexpected toothaches, chipped teeth, or sudden pain when you need immediate relief.',
  },
  {
    icon: Cpu,
    title: 'Modern Technology',
    text: 'Up-to-date digital tools and equipment for faster diagnostics, gentler treatments, and quicker recovery times.',
  },
  {
    icon: Smile,
    title: 'Gentle & Anxiety-Free',
    text: 'A warm, supportive environment with gentle techniques designed to keep nervous patients and young kids at ease.',
  },
  {
    icon: ShieldCheck,
    title: 'Complete Family Care',
    text: "From simple checkups to complex treatments, we handle every stage of your family's oral health under one roof.",
  },
];

const differentiators = [
  {
    title: 'Quality Care',
    text: 'Our quality of dental care is outstanding. Our main clinic is located at a new modern facility in S Building, Upper Session Road , Baguio City.',
  },
  {
    title: 'Fast Service',
    text: 'We make efforts to accommodate you and your scheduling needs and desires.',
  },
  {
    title: 'Affordable Prices',
    text: 'Our prices are substantially affordable. Please call us to know more about our pricing.',
  },
  {
    title: 'Patient Priority',
    text: 'We strive to make the patient our priority. We will work hard to see you promptly and achieve your satisfaction.',
  },
];

export function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="py-16 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-10 sm:gap-20">
        
        {/* Main Section Header & Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
              Why Choose Us
            </span>
            <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
              Pioneering dental advancements, <br className="hidden sm:block" />
              expertise, and dedicated care.
            </h2>
          </div>
          <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
            With roots dating back to 1964 and now in our third generation, Samson Dental Center unites clinical expertise, state-of-the-art facilities, and patient-first care under one roof.
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {whyChooseUsFeatures.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group border border-gray-100 bg-white p-5 sm:p-7 transition-all duration-300 hover:border-[#D94E4E]/30 hover:shadow-md flex flex-col justify-between h-full rounded-sm"
            >
              <div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300 mb-4 sm:mb-5">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-[#1D1E1E] text-[15px] sm:text-[17px] font-semibold tracking-tight min-h-0 sm:min-h-[48px] flex items-center">
                  {title}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-[12px] sm:text-[14px] text-gray-500 leading-relaxed font-light">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Differentiator Section: What Makes Us Different */}
        <div className="pt-8 sm:pt-12 border-t border-gray-100">
          {/* 2-Column: Left (Badge, Title, Overview & Bullets) & Right (Images Showcase) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left side: Badge + Main Heading + Intro + Checklist Bullets */}
            <div className="lg:col-span-6 flex flex-col gap-6 sm:gap-7">
              <div>
                <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
                  Our Difference
                </span>
                <h3 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
                  State of the Art and Professional <br className="hidden sm:block" />
                  Dental Care Tailored to Your Needs
                </h3>
                <p className="mt-3 sm:mt-5 text-[12px] sm:text-[14px] text-[#4F5454] sm:text-gray-500 font-light leading-relaxed">
                  The work of our highly competent doctors of varying disciplines of dentistry, coupled with the use of the latest equipment and technologies ensures that each patient is treated like royalty. Our complete team functions on the sole purpose of ensuring complete patient care and satisfaction, and this dedication is what sets us apart from our counterparts.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:gap-6 pt-2 border-t border-gray-100">
                {differentiators.map(({ title, text }) => (
                  <div key={title} className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#D94E4E]/10 text-[#D94E4E] flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <h5 className="text-[#1D1E1E] text-[14px] sm:text-[16px] font-semibold">
                        {title}
                      </h5>
                      <p className="mt-1 text-[12px] sm:text-[14px] text-[#4F5454] sm:text-gray-500 font-light leading-relaxed">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Image Showcase */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden border border-gray-100 bg-[#1D1E1E]">
                  <img
                    src="/img/Img (4).jpg"
                    alt="Samson Dental Care Clinic Facility"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden border border-gray-100 bg-[#1D1E1E]">
                  <img
                    src="/img/Img (7).jpg"
                    alt="Samson Dental Care Equipment"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
                <div className="relative aspect-[4/3] overflow-hidden border border-gray-100 bg-[#1D1E1E]">
                  <img
                    src="/img/Img (9).jpg"
                    alt="Samson Dental Modern Facility"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative aspect-[4/5] overflow-hidden border border-gray-100 bg-[#1D1E1E]">
                  <img
                    src="/img/Img (12).jpg"
                    alt="Samson Dental Center Patient Care"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}