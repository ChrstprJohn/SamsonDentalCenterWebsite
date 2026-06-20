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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isMainPage = pathname === '/';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isMainPage) return;
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleBookNow = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      router.push('/booking');
    } else {
      router.push('/auth/login?redirect=/booking');
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 45,
        backgroundImage: 'linear-gradient(180deg, #031c14 -43.3%, rgba(3,28,20,0))',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        transition: 'opacity 0.5s cubic-bezier(0.33,0,0.11,1), transform 0.5s cubic-bezier(0.33,0,0.11,1)',
      }}
    >
      {/* Inner container — 12-col grid matching LAVA */}
      <div
        style={{
          width: 'min(1290px, 100% - clamp(1.5rem, 1.3636rem + 0.6061vw, 1.875rem) * 2)',
          marginInline: 'auto',
          padding: 'clamp(1.5rem, 1.1364rem + 1.6162vw, 2.5rem) 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 'clamp(1rem, 0.6818rem + 1.4141vw, 1.875rem)',
          alignItems: 'center',
        }}
      >
        {/* Logo — cols 1–2 */}
        <div style={{ gridColumn: '1 / span 2', gridRow: 1, zIndex: 11 }}>
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Samson Dental Center">
            <div
              className="text-[#ddefde] transition-opacity group-hover:opacity-80"
              style={{ fontSize: '22px' }}
            >
              🦷
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-black tracking-wider uppercase text-[#ddefde]"
                style={{
                  fontFamily: '"Josefin Sans", "Jost", sans-serif',
                  fontSize: 'clamp(0.8rem, 0.7499rem + 0.2226vw, 0.9377rem)',
                  letterSpacing: '0.15em',
                }}
              >
                SAMSON
              </span>
              <span
                className="font-semibold tracking-widest uppercase text-[#ddefde]/70"
                style={{
                  fontFamily: '"Josefin Sans", "Jost", sans-serif',
                  fontSize: 'clamp(0.64rem, 0.6169rem + 0.1026vw, 0.7035rem)',
                  letterSpacing: '0.2em',
                  marginTop: '2px',
                }}
              >
                DENTAL CENTER
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav — cols 3–11 centered */}
        {isMainPage && (
          <div
            className="hidden md:flex items-center justify-center"
            style={{ gridColumn: '3 / span 8', gridRow: 1 }}
          >
            <nav>
              <ul className="flex items-center" style={{ gap: 'clamp(1.5rem, 1.3636rem + 0.6061vw, 1.875rem)', listStyle: 'none', margin: 0, padding: 0 }}>
                {NAV_ITEMS.map((item) => (
                  <li key={item.href} className="relative group">
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="block text-[#ddefde]/80 hover:text-[#ddefde] transition-colors duration-300"
                      style={{
                        fontFamily: '"Josefin Sans", "Jost", sans-serif',
                        fontSize: 'clamp(0.64rem, 0.6169rem + 0.1026vw, 0.7035rem)',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        paddingBottom: '4px',
                      }}
                    >
                      {item.label}
                    </a>
                    {/* Hover underline progress bar */}
                    <span
                      className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#ddefde] transition-all duration-300 group-hover:w-full"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Right side — col 12: CTAs + mobile toggle */}
        <div
          className="flex items-center justify-end gap-3"
          style={{ gridColumn: '12 / span 1', gridRow: 1 }}
        >
          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <AuthenticatedUserHeader user={user} />
                <Button
                  size="sm"
                  onClick={handleBookNow}
                  className="font-bold bg-[#ddefde] hover:bg-[#c8e3c9] text-[#031c14] shadow-sm active:scale-95 transition-all duration-200 cursor-pointer rounded-full px-5"
                  style={{ fontFamily: '"Josefin Sans", "Jost", sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  Book Now
                </Button>
              </>
            ) : (
              <button
                onClick={handleBookNow}
                className="flex items-center gap-1.5 text-[#ddefde]/80 hover:text-[#ddefde] transition-colors duration-300 cursor-pointer"
                aria-label="Login or Book"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="size-[22px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="size-2.5 opacity-70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 text-[#ddefde] hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              /* X icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path fill="currentColor" d="M28.508 9.414 9.416 28.506l-1.414-1.414L27.093 8z"/>
                <path fill="currentColor" d="m8 9.414 19.092 19.092 1.414-1.414L9.414 8z"/>
              </svg>
            ) : (
              /* Hamburger icon matching LAVA exactly */
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path fill="currentColor" d="M4.5 13h27v2h-27zM4.5 21h27v2h-27z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-[#ddefde]/10"
          style={{ background: '#031c14' }}
        >
          <div className="px-6 py-6 flex flex-col gap-6">
            {isMainPage && (
              <div className="flex flex-col gap-5">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-[#ddefde]/80 hover:text-[#ddefde] transition-colors"
                    style={{
                      fontFamily: '"Josefin Sans", "Jost", sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <hr className="border-[#ddefde]/10" />
            <div className="flex flex-col gap-3">
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#ddefde]/5">
                  <AuthenticatedUserHeader user={user} />
                  <Button size="sm" onClick={handleBookNow} className="bg-[#ddefde] text-[#031c14] font-bold rounded-full">
                    Book Now
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">Login</Button>
                  </Link>
                  <Button className="w-full bg-[#ddefde] text-[#031c14] font-bold rounded-full" onClick={handleBookNow}>
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
