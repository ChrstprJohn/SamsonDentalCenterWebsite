'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from './navbar';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header.hook';
import { AuthenticatedUserHeader } from '@/modules/patients/components/auth/authenticated-user-header';

interface NavbarMobileDrawerProps {
  user: AuthHeaderUser | null;
  isMainPage: boolean;
  activeSection: string;
  onClose: () => void;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function NavbarMobileDrawer({
  user,
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
        {isMainPage &&
          NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.replace('#', '');
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => onNavClick(e, item.href)}
                className={`py-2.5 transition-colors border-b border-gray-100/60 pb-1 text-[14px] pt-[5px] ${
                  isActive ? 'text-[#D94E4E]' : 'text-[#1D1E1E]/85 hover:text-[#D94E4E]'
                }`}
                style={{ fontWeight: isActive ? '600' : '500' }}
              >
                {item.label}
              </a>
            );
          })}
        <div className="flex flex-col gap-4 pt-6 mt-4">
          {user ? (
            <div className="flex flex-col gap-4 items-center">
              <AuthenticatedUserHeader user={user} />
              <Link href="/booking" onClick={onClose} className="w-full">
                <button className="w-full px-6 py-3.5 bg-[#141515] text-white rounded-full text-[14px] font-semibold hover:bg-[#D94E4E] tracking-[0.2em] transition-all cursor-pointer">
                  Book Now
                </button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" onClick={onClose} className="w-full">
                <button className="w-full py-2.5 text-[14px] font-semibold uppercase tracking-[0.2em] text-[#1D1E1E] hover:text-[#D94E4E] transition-colors cursor-pointer border border-gray-300 rounded-full">
                  Log In
                </button>
              </Link>
              <Link href="/auth/signup" onClick={onClose} className="w-full">
                <button className="w-full px-6 py-3.5 bg-[#141515] text-white rounded-full text-[14px] font-semibold hover:bg-[#D94E4E] tracking-[0.2em] transition-all cursor-pointer">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
