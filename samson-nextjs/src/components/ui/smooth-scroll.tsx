'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export function SmoothScroll() {
  const pathname = usePathname();
  const animationFrame = useRef<number | null>(null);
  // ponytail: popstate flag so back/forward keeps browser scroll position instead of yanking to top
  const isBackForwardNav = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isBackForwardNav.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const initLenis = () => {
    if (typeof window === 'undefined' || pathname === '/book' || !(window as any).Lenis) return;
    if ((window as any).lenis) {
      (window as any).lenis.resize();
      return;
    }

    const lenis = new (window as any).Lenis({
      duration: 1.2,
      wheelMultiplier: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
      autoResize: true,
    });
    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      animationFrame.current = requestAnimationFrame(raf);
    }
    animationFrame.current = requestAnimationFrame(raf);
  };

  useEffect(() => {
    initLenis();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (pathname === '/book') {
        if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
        (window as any).lenis?.destroy();
        delete (window as any).lenis;
      } else {
        initLenis();
      }
      const isBackForward = isBackForwardNav.current;
      isBackForwardNav.current = false;
      if (!isBackForward) {
        window.scrollTo(0, 0);
      }
      const resizeLenis = () => {
        const anchor = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
        if ((window as any).lenis) {
          if (!isBackForward) {
            (window as any).lenis.scrollTo(anchor ?? 0, { immediate: true, offset: anchor ? -80 : 0 });
          }
          (window as any).lenis.resize();
        } else if (anchor && !isBackForward) {
          anchor.scrollIntoView({ block: 'start' });
        }
        if (anchor && !isBackForward) {
          anchor.focus({ preventScroll: true });
        }
      };
      resizeLenis();
      const timer1 = setTimeout(resizeLenis, 80);
      const timer2 = setTimeout(resizeLenis, 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [pathname]);

  return (
    <Script
      src="https://unpkg.com/lenis@1.1.20/dist/lenis.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        initLenis();
      }}
    />
  );
}
