'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

export function SmoothScroll() {
  useEffect(() => {
    // If Lenis is already loaded globally via Script onLoad
    if (typeof window !== 'undefined' && (window as any).Lenis) {
      const lenis = new (window as any).Lenis({
        duration: 1.8,
        wheelMultiplier: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: 'vertical',
        smoothWheel: true,
      });

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
          duration: 1.8,
          wheelMultiplier: 1.6,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          gestureOrientation: 'vertical',
          smoothWheel: true,
        });

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }}
    />
  );
}
