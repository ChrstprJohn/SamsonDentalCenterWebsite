'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { ABOUT_MENU_ITEMS, NAV_ITEMS } from './navbar-v1';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';

interface NavbarMobileDrawerProps {
  user?: AuthHeaderUser | null;
  isMainPage: boolean;
  activeSection: string;
  onClose: () => void;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function NavbarMobileDrawer({
  isMainPage,
  activeSection,
  onClose,
  onNavClick,
}: NavbarMobileDrawerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 w-screen h-screen bg-[#FDFDFD] z-40 px-8 flex flex-col justify-center items-center shadow-2xl lg:hidden overflow-y-auto"
      id="mobile-navigation-overlay"
    >
      <div className="flex flex-col gap-8 font-sans text-center text-base uppercase tracking-[0.2em] font-medium w-full max-w-xs mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = isMainPage && activeSection === item.href.replace('#', '');
          const isAbout = item.label === 'About Us';
          const isAboutGroupActive = isAbout && ['about', 'dentist', 'gallery', 'testimonials'].includes(activeSection);
          return (
            <div key={item.label} className="flex flex-col border-b border-gray-100/60">
              <a href={isMainPage ? item.href : `/${item.href}`} onClick={(e) => onNavClick(e, item.href)} className={`py-2.5 text-[14px] transition-colors ${isAboutGroupActive || (!isAbout && isActive) ? 'text-[#D94E4E]' : 'text-[#1D1E1E]/85 hover:text-[#D94E4E]'}`} style={{ fontWeight: isAboutGroupActive || (!isAbout && isActive) ? '600' : '500' }}>{item.label}{isAbout && <ChevronDown className="inline-block h-5 w-5 align-middle" strokeWidth={1.8} />}</a>
              {isAbout && <div className="flex flex-col gap-2 pb-3 pl-4 text-left text-[11px] tracking-[0.14em] text-[#1D1E1E]/60">{ABOUT_MENU_ITEMS.map((subItem) => <a key={subItem.label} href={isMainPage ? subItem.href : `/${subItem.href}`} onClick={(e) => onNavClick(e, subItem.href)} className="py-1 hover:text-[#D94E4E]">{subItem.label}</a>)}</div>}
            </div>
          );
        })}
        <div className="flex flex-col gap-4 pt-6 mt-4">
          <div className="flex flex-col gap-4 items-center">
            <Link href="/book" onClick={onClose} className="w-full">
              <button className="w-full px-6 py-3.5 bg-[#141515] text-white rounded-full text-[14px] font-semibold hover:bg-[#D94E4E] tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2">
                Request Appointment
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
