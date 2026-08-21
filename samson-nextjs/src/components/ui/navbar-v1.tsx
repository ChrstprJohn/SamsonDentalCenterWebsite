'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
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
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
] as const;

export const ABOUT_MENU_ITEMS = [
  { label: 'Why Choose Us', href: '#why-choose-us' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Testimonials', href: '#testimonials' },
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
    window.dispatchEvent(new CustomEvent('mobile-nav-toggle', { detail: { isOpen: isMobileOpen } }));
  }, [isMobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      if (!isMainPage) return;
      const sectionIds = ['home', 'services', 'about', 'why-choose-us', 'gallery', 'testimonials', 'faq', 'contact'];
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
    setIsMobileOpen(false);
    if (!isMainPage) {
      // If not on landing page, navigate to homepage anchor
      router.push(`/${href}`);
      return;
    }
    e.preventDefault();
    const targetId = href.replace('#', '');
    setActiveSection(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.scrollTo(element, { offset: -offset, duration: 1.2 });
      } else {
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementPosition = element.getBoundingClientRect().top - bodyRect;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      }
    }
  };

  const isDarkNav = !isMobileOpen;

  // Light mode logo is for white/light backgrounds (e.g., inside mobile drawer overlay).
  // Dark mode logo (or fallback light) is for dark backgrounds (e.g., default dark header bar).
  const lightLogoUrl = propLogoUrl ?? config?.websiteLogoUrl ?? '/images/SAMSONLOGO.png';
  const darkLogoUrl = config?.websiteLogoDarkUrl ?? config?.websiteLogoUrl ?? propLogoUrl ?? '/images/SAMSONLOGO.png';
  const logoUrl = isMobileOpen ? lightLogoUrl : darkLogoUrl;
  const clinicName = propClinicName ?? config?.clinicName ?? 'Samson Dental Center';

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out py-2.5 ${
          isMobileOpen
            ? 'bg-transparent backdrop-blur-none border-b border-transparent'
            : scrolled || !isMainPage
            ? 'bg-[#1D1E1E]/95 backdrop-blur-md border-b border-white/5 shadow-md'
            : 'bg-[#1D1E1E]/15 backdrop-blur-[3px] border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start relative">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className={`relative flex items-center h-16 sm:h-20 group focus:outline-none transition-colors duration-300 ${
                isDarkNav ? 'text-white' : 'text-[#1D1E1E]'
              }`}
            >
              <img
                src={logoUrl}
                alt={clinicName}
                className="h-16 sm:h-20 max-w-[280px] w-auto object-contain origin-left drop-shadow-sm transition-all duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center justify-center gap-1 min-[768px]:max-[1100px]:gap-0 font-sans text-[13px] min-[768px]:max-[1100px]:text-[11px] tracking-[0.1em] font-medium uppercase">
            {NAV_ITEMS.map((item) => {
              const isActive = isMainPage && activeSection === item.href.replace('#', '');
              const isAbout = item.label === 'About Us';
              const isAboutGroupActive = isAbout && ['about', 'why-choose-us', 'dentist', 'gallery', 'testimonials'].includes(activeSection);
              if (isAbout) {
                return (
                  <div key={item.label} className="relative group">
                    <a href={isMainPage ? item.href : `/${item.href}`} onClick={(e) => handleNavClick(e, item.href)} className={`relative inline-flex items-center px-4 py-2.5 min-[768px]:max-[1100px]:px-2 transition-colors duration-300 ${isDarkNav ? isAboutGroupActive ? 'text-[#D94E4E]' : 'text-white hover:text-[#D94E4E]' : isAboutGroupActive ? 'text-[#D94E4E]' : 'text-[#1D1E1E]/75 hover:text-[#D94E4E]'}`}>
                      <span>{item.label}</span><ChevronDown className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" strokeWidth={1.8} />
                      {isAboutGroupActive && <motion.div layoutId="activeNavHighlight" className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#D94E4E]" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
                    </a>
                    <div className="pointer-events-none absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 translate-y-2 rounded-xl border border-white/10 bg-[#1D1E1E]/95 p-2 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                      {ABOUT_MENU_ITEMS.map((subItem) => <a key={subItem.label} href={isMainPage ? subItem.href : `/${subItem.href}`} onClick={(e) => handleNavClick(e, subItem.href)} className="block rounded-lg px-4 py-3 text-left text-[11px] tracking-[0.12em] text-white/80 transition-colors hover:bg-white/10 hover:text-[#D94E4E]">{subItem.label}</a>)}
                    </div>
                  </div>
                );
              }
              return (
                <a
                  key={item.label}
                  href={isMainPage ? item.href : `/${item.href}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`transition-colors duration-300 relative px-4 py-2.5 min-[768px]:max-[1100px]:px-2 ${
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

          {/* Right: Actions Block */}
          <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-5">
              <Link href="/book" onClick={() => setIsMobileOpen(false)}>
                <button
                    className={`px-5 py-2.5 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-xs cursor-pointer flex items-center gap-2 ${
                    isDarkNav
                      ? 'bg-white text-[#141515] hover:bg-[#D94E4E] hover:text-white'
                      : 'bg-[#141515] text-white hover:bg-[#D94E4E]'
                  }`}
                >
                  Request Appointment
                  <ArrowRight className="w-3.5 h-3.5" />
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
