'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { immediate: true });
        (window as any).lenis.resize();
      }
    }
  }, [pathname]);

  useEffect(() => {
    // If Lenis is already loaded globally via Script onLoad
    if (typeof window !== 'undefined' && (window as any).Lenis) {
      const lenis = new (window as any).Lenis({
        duration: 1.4,
        wheelMultiplier: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: 'vertical',
        smoothWheel: true,
      });
      (window as any).lenis = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }, []);

  return (
    <Script
      src="https://unpkg.com/lenis@1.1.20/dist/lenis.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        const lenis = new (window as any).Lenis({
          duration: 1.4,
          wheelMultiplier: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          gestureOrientation: 'vertical',
          smoothWheel: true,
        });
        (window as any).lenis = lenis;

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }}
    />
  );
}
