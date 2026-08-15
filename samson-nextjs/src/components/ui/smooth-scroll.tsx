'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export function SmoothScroll() {
  const pathname = usePathname();

  const initLenis = () => {
    if (typeof window === 'undefined' || !(window as any).Lenis) return;
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

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
  };

  useEffect(() => {
    initLenis();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      const resizeLenis = () => {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(0, { immediate: true });
          (window as any).lenis.resize();
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
