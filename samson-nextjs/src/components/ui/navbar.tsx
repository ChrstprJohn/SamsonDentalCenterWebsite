'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './button';
import { AuthenticatedUserHeader } from '@/modules/patients/components/auth/authenticated-user-header';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header.hook';

interface NavbarProps {
  user: AuthHeaderUser | null;
}

const NAV_ITEMS = [
  { label: 'Home', href: '#hero' },
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
] as const;

export function Navbar({ user }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isMainPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isMainPage) return; // Allow normal route redirection if not on landing page

    e.preventDefault();
    setIsMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80; // Navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleBookNow = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      router.push('/user'); // Or future: wizard page directly
    } else {
      router.push('/auth/login?redirect=/user');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-md border-b border-slate-100 dark:border-white/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            🦷
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            Samson Dental
          </span>
        </Link>

        {/* Desktop Menu */}
        {isMainPage && (
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* CTAs / Auth Header */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <AuthenticatedUserHeader user={user} />
              <Button size="sm" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Button size="sm" onClick={handleBookNow}>
                Book Now
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-350 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-slate-100 dark:border-white/5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-6 py-6 flex flex-col gap-6">
            {isMainPage && (
              <div className="flex flex-col gap-4">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <hr className="border-slate-100 dark:border-white/5" />
            <div className="flex flex-col gap-3">
              {user ? (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                  <AuthenticatedUserHeader user={user} />
                  <Button size="sm" onClick={handleBookNow}>
                    Book Now
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Button className="w-full" onClick={handleBookNow}>
                    Book Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
