'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';
import { NavbarMobileDrawer } from './navbar-mobile-drawer';

import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

interface NavbarProps {
  user?: AuthHeaderUser | null;
  config?: ClinicConfigResponseDto | null;
  logoUrl?: string | null;
  clinicName?: string;
}

export const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
] as const;

export function NavbarV1({
  config,
  logoUrl: propLogoUrl,
  clinicName: propClinicName,
}: NavbarProps) {
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

  const logoUrl = propLogoUrl ?? config?.websiteLogoUrl ?? '/images/SamsonLogo-transparent.png';
  const clinicName = propClinicName ?? config?.clinicName ?? 'Samson Dental Center';

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isMobileOpen
            ? 'bg-transparent backdrop-blur-none border-b border-transparent py-6'
            : scrolled
            ? 'bg-[#1D1E1E]/90 backdrop-blur-sm border-b border-white/5 shadow-md py-5'
            : 'bg-[#1D1E1E]/15 backdrop-blur-[3px] border-b border-white/5 py-6.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start relative">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className={`relative flex items-center h-12 group focus:outline-none transition-colors duration-300 ${
                isDarkNav ? 'text-white' : 'text-[#1D1E1E]'
              }`}
            >
              <img
                src={logoUrl}
                alt={clinicName}
                className="h-16 sm:h-17 md:h-18 w-auto max-w-none object-contain origin-left drop-shadow-sm transition-all duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          {isMainPage && (
            <nav className="hidden lg:flex items-center justify-center gap-2 font-sans text-[13px] tracking-[0.1em] font-medium uppercase">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`transition-colors duration-300 relative px-4 py-2.5 ${
                      isDarkNav
                        ? isActive ? 'text-[#D94E4E]' : 'text-white hover:text-[#D94E4E]'
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

          {/* Right: Actions Block */}
          <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-5">
              <Link href="/book" onClick={() => setIsMobileOpen(false)}>
                <button
                  className={`px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-xs cursor-pointer flex items-center gap-1.5 ${
                    isDarkNav
                      ? 'bg-white text-[#141515] hover:bg-[#D94E4E] hover:text-white'
                      : 'bg-[#141515] text-white hover:bg-[#D94E4E]'
                  }`}
                >
                  Request Appointment
                  <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
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
