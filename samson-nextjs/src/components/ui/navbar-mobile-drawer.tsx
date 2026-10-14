'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ABOUT_MENU_ITEMS, NAV_ITEMS } from './navbar-v1';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';
import { useBookingNav } from '@/modules/patients/contexts/booking-nav-context';

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
  const { requestAppt, isNavigatingBooking, appointmentLabel } = useBookingNav();
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - var(--menu-origin-x)) var(--menu-origin-y))' }}
      animate={reducedMotion ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - var(--menu-origin-x)) var(--menu-origin-y))' }}
      exit={reducedMotion ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - var(--menu-origin-x)) var(--menu-origin-y))' }}
      transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 w-screen h-screen bg-[#FDFDFD] z-40 px-8 flex flex-col justify-center items-center shadow-2xl lg:hidden overflow-y-auto [--menu-origin-x:44px] [--menu-origin-y:42px] sm:[--menu-origin-x:68px] sm:[--menu-origin-y:50px]"
      id="mobile-navigation-overlay"
    >
      <div className="flex flex-col gap-3.5 font-sans text-center text-base uppercase tracking-[0.2em] font-medium w-full max-w-xs mx-auto pt-16">
        {[...NAV_ITEMS.slice(0, 2), ...ABOUT_MENU_ITEMS, ...NAV_ITEMS.slice(3)].map((item) => {
          const isActive = isMainPage && activeSection === item.href.replace('#', '');
          const isAboutGroupActive = item.label === 'About Us' && ['about', 'why-choose-us', 'dentist', 'gallery', 'testimonials'].includes(activeSection);
          return (
            <div key={item.label} className="flex flex-col border-b border-gray-100/60">
              <a href={isMainPage ? item.href : `/${item.href}`} onClick={(e) => onNavClick(e, item.href)} className={`py-2 text-[14px] transition-colors ${isAboutGroupActive || isActive ? 'text-[#D94E4E]' : 'text-[#1D1E1E]/85 hover:text-[#D94E4E]'}`} style={{ fontWeight: isAboutGroupActive || isActive ? '600' : '500' }}>{item.label}</a>
            </div>
          );
        })}
        <div className="flex flex-col gap-4 pt-5 mt-2">
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => { onClose(); requestAppt(); }}
              disabled={isNavigatingBooking}
              className={`w-full px-6 py-3.5 bg-[#141515] text-white rounded-full text-[14px] font-semibold hover:bg-[#D94E4E] tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2 ${isNavigatingBooking ? 'opacity-50 cursor-wait' : ''}`}
            >
            {appointmentLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
