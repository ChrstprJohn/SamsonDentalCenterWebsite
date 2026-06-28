'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll } from 'framer-motion';

export function useJourneySection() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ['start start', 'end end'],
  });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest: number) => {
      const step = Math.min(Math.floor(latest * 6), 5);
      setActiveStep(step);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const scrollToStep = (step: number) => {
    if (!journeyRef.current) return;

    const rect = journeyRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const scrollHeight = journeyRef.current.offsetHeight;
    const targetScroll = scrollTop + (step / 5) * (scrollHeight - window.innerHeight);
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return {
    journeyRef,
    activeStep,
    scrollToStep,
  };
}
