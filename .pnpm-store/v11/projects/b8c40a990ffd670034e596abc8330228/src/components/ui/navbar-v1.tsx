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

export function NavbarV1({ user }: NavbarProps) {
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
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.scrollTo(element, { offset: -offset });
      } else {
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementPosition = element.getBoundingClientRect().top - bodyRect;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      }
    }
  };

  const isDarkNav = !isMobileOpen;

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isMobileOpen
            ? 'bg-transparent backdrop-blur-none border-b border-transparent py-5'
            : scrolled
            ? 'bg-[#1D1E1E]/90 backdrop-blur-sm border-b border-white/5 shadow-md py-4'
            : 'bg-[#1D1E1E]/15 backdrop-blur-[3px] border-b border-white/5 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 group focus:outline-none transition-colors duration-300 ${
              isDarkNav ? 'text-white' : 'text-[#1D1E1E]'
            }`}
          >
            <span className="w-9 h-9 rounded-[15.6px] border border-current flex items-center justify-center font-serif text-[18px] italic font-normal tracking-none transition-transform group-hover:rotate-12 duration-300">
              S
            </span>
            <div className="flex flex-col text-[14px]">
              <span className="font-serif text-[21px] lg:text-[23px] tracking-[0.2em] font-bold leading-none uppercase font-sans">
                Samson
              </span>
              <span className="text-[9px] lg:text-[10px] tracking-[0.3em] uppercase opacity-75 font-sans font-bold leading-none mt-1.5">
                Dental Center
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {isMainPage && (
            <nav className="hidden lg:flex items-center gap-2 font-sans text-[13px] tracking-[0.1em] font-medium uppercase">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`transition-colors duration-300 relative px-4 py-2.5 ${
                      isDarkNav
                        ? isActive ? 'text-[#D94E4E]' : 'text-white/80 hover:text-[#D94E4E]'
                        : isActive ? 'text-[#D94E4E]' : 'text-[#1D1E1E]/75 hover:text-[#D94E4E]'
                    }`}
                    style={{ fontWeight: isActive ? '600' : '500' }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavHighlight"
                        className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#D94E4E]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Actions Block */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-5">
              {user ? (
                <AuthenticatedUserHeader user={user} isDarkNav={isDarkNav} />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 cursor-pointer ${
                      isDarkNav ? 'text-white/80 hover:text-[#D94E4E]' : 'text-gray-600 hover:text-[#D94E4E]'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link href="/auth/signup">
                    <button
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-xs cursor-pointer ${
                        isDarkNav
                          ? 'bg-white text-[#141515] hover:bg-[#D94E4E] hover:text-white'
                          : 'bg-[#141515] text-white hover:bg-[#D94E4E]'
                      }`}
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
