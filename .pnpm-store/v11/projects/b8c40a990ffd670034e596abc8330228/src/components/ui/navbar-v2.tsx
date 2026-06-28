'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { AuthenticatedUserHeader } from '@/modules/patients/components/auth/authenticated-user-header';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';
import { NavbarMobileDrawer } from './navbar-mobile-drawer';

interface NavbarProps {
  user: AuthHeaderUser | null;
}

export const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
] as const;

export function NavbarV2({ user }: NavbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const router = useRouter();
  const pathname = usePathname();
  const isMainPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      if (!isMainPage) return;
      const sectionIds = ['home', 'services', 'about', 'gallery', 'contact'];
      const scrollPosition = window.scrollY + 250;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMainPage]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isMainPage) return;
    e.preventDefault();
    setIsMobileOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementPosition = element.getBoundingClientRect().top - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const isDarkNav = !scrolled && !isMobileOpen;

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 transition-all duration-500 ease-out rounded-full border ${
          isMobileOpen
            ? 'bg-[#141515]/95 border-white/10 py-4 px-6'
            : scrolled
            ? 'bg-[#FDFDFD]/90 backdrop-blur-md border-[#EEEEEB] shadow-sm py-2 px-6'
            : 'bg-white/10 backdrop-blur-md border-white/20 shadow-lg py-2.5 px-8'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          {/* Left: Logo */}
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 group focus:outline-none transition-colors duration-300 ${
              isDarkNav ? 'text-white' : 'text-[#1D1E1E]'
            }`}
          >
            <span className="w-9 h-9 rounded-full border border-current flex items-center justify-center font-serif text-[18px] italic font-normal tracking-none transition-transform group-hover:rotate-12 duration-300">
              S
            </span>
            <div className="flex flex-col text-left items-start">
              <span className="font-serif text-[16px] lg:text-[18px] tracking-[0.2em] font-bold leading-none uppercase font-sans">
                Samson
              </span>
              <span className="text-[8px] lg:text-[9px] tracking-[0.3em] uppercase opacity-75 font-sans font-bold leading-none mt-1">
                Dental Center
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          {isMainPage && (
            <nav className="hidden lg:flex items-center gap-2 font-sans text-[12px] tracking-[0.1em] font-semibold uppercase">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`transition-colors duration-300 relative px-3 py-2 ${
                      isDarkNav
                        ? isActive ? 'text-[#0070F3]' : 'text-white/80 hover:text-[#0070F3]'
                        : isActive ? 'text-[#0070F3]' : 'text-[#1D1E1E]/75 hover:text-[#0070F3]'
                    }`}
                    style={{ fontWeight: isActive ? '700' : '500' }}
                  >
                    <span className="relative z-10">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-5">
              {user ? (
                <>
                  <AuthenticatedUserHeader user={user} />
                  <Link href="/booking">
                    <button
                      className="px-5 py-2.5 rounded-lg bg-[#0070F3] text-white hover:bg-[#0059c6] text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Book Now
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={`text-[11px] font-semibold uppercase tracking-widest transition-colors duration-300 cursor-pointer ${
                      isDarkNav ? 'text-white/80 hover:text-[#0070F3]' : 'text-gray-600 hover:text-[#0070F3]'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link href="/auth/signup">
                    <button
                      className="px-5 py-2.5 rounded-lg bg-[#0070F3] text-white hover:bg-[#0059c6] text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors focus:outline-none z-50 ${
                isDarkNav ? 'text-white' : 'text-[#1D1E1E]'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <NavbarMobileDrawer
            user={user}
            isMainPage={isMainPage}
            activeSection={activeSection}
            onClose={() => setIsMobileOpen(false)}
            onNavClick={handleNavClick}
          />
        )}
      </AnimatePresence>
    </>
  );
}
