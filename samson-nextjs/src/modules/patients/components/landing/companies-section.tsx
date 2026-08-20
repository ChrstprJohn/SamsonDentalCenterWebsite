'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

const companies = [
  { years: '1965 – 1966', name: 'First Company Retainer Dentist of Saint Louis Boys High School' },
  { years: '1968 – 1978', name: 'Company Dentist of Baguio Benguet Incorporated' },
  { years: '1970 – 2000', name: 'Retainer Dentist of the Philippine National Bank (PNB)' },
  { years: '1970 – 2003', name: 'Retainer Dentist of Development Bank of the Philippines (DBP)' },
  { years: '1978 – 1982', name: 'First Retainer Dentist of Pines Hotel' },
  { years: '1986 – 1988', name: 'Company Retainer Dentist of Export Processing Zone Authority (EPZA)' },
  { years: '1988 – 1997', name: 'Company Retainer Dentist of Baguio Country Club' },
  { years: '1997 – 2006', name: 'Dental Network Health Company' },
  { years: '1988 – 2008', name: 'MOOG Controls Corporation Philippines, Baguio City' },
  { years: '1986 – Present', name: 'Texas Instrument Philippines, Baguio City' },
  { years: '2006 – Present', name: 'Health Partners' },
];

const formerSubsidiaries = [
  'Heald Lumber Company',
  'Ampusungan Saw Mill',
  'Benguet Laboratories',
  'Irisan Lime Kelm',
];

export function CompaniesSection() {
  return (
    <section id="companies" className="py-16 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-10 sm:gap-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
              Institutional Partners
            </span>
            <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
              Decades of Trusted Care for Leading Institutions
            </h2>
          </div>
          <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
            Since 1965, Samson Dental Center has been the primary dental healthcare provider for top educational, financial, hospitality, and industrial organizations across Baguio City.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] sm:left-[23px] top-3 bottom-3 w-px bg-[#D94E4E]/40 z-20" />
          {companies.map(({ years, name }) => (
<div key={name} className="group relative flex items-start gap-3 sm:gap-5 py-3 sm:py-4 px-3 sm:px-4 transition-colors duration-300 hover:bg-[#F5F2EE]">
              <span className="relative flex items-center justify-center w-3.5 h-3.5 shrink-0 mt-1">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#D94E4E] bg-[#FDFDFD] group-hover:bg-[#D94E4E] z-30 transition-colors duration-300" />
              </span>
              <div className="flex flex-col lg:flex-row lg:items-baseline gap-0.5 lg:gap-5 min-w-0 lg:flex-1">
                <span className="font-sans text-[12px] lg:text-[15px] tracking-[0.1em] text-gray-500 font-medium whitespace-nowrap lg:w-[110px] lg:shrink-0">
                  {years}
                </span>
                <span className="font-sans text-[15px] lg:text-[17px] font-semibold lg:font-medium text-[#1D1E1E] leading-relaxed lg:ml-auto lg:text-right">
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-6">
            <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
              <h3 className="font-sans text-[16px] sm:text-[clamp(18px,1vw+12px,24px)] font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.2]">
                Former Subsidiary Branches
              </h3>
            </div>
            <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
              Former business ventures of the Samson family that laid the groundwork for the clinic.
            </p>
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {formerSubsidiaries.map((name) => (
              <div key={name} className="group border border-gray-100 bg-white p-5 sm:p-6 flex items-center gap-4 transition-colors duration-300 hover:border-[#D94E4E]/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-sans text-[13px] sm:text-[15px] font-medium text-[#1D1E1E]">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}