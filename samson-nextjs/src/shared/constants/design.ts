/**
 * 🎨 Samson Dental Design System Constants & Animation Tokens
 * Centralizes UI constants to ensure visual consistency and easy customization.
 */

export const DESIGN_TOKENS = {
  // ⚡ Framer Motion Animation Settings
  animations: {
    // Premium spring physics for interactive elements/modals
    spring: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      mass: 1,
    },
    // Gentle spring for standard transitions
    springGentle: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
    // Smooth transition curve for fades & slides
    smoothEase: {
      type: "tween" as const,
      ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      duration: 0.8,
    },
    // Delays for cascading entrance animations
    stagger: {
      baseDelay: 0.1,
      badge: 0.1,
      title: 0.2,
      text: 0.3,
      cta: 0.4,
      visual: 0.5,
    },
    // Keyframes for floating visual elements (like cards/images)
    floating: {
      animate: {
        y: [0, -10, 0],
      },
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  },

  // 📐 Layout & Containers
  layout: {
    sectionPadding: "relative min-h-[90vh] flex items-center pt-32 pb-20 md:py-40 px-6 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500",
    containerMaxWidth: "max-w-7xl mx-auto w-full relative z-10",
    gridHeroLayout: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center",
    textWrapper: "lg:col-span-7 flex flex-col gap-8 text-center lg:text-left",
    visualWrapper: "lg:col-span-5 relative flex items-center justify-center",
  },

  // 📝 Typography & Elements
  styles: {
    badge: "inline-flex self-center lg:self-start px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 shadow-sm backdrop-blur-md transition-all hover:bg-primary/15 hover:scale-105 cursor-default",
    heroTitle: "text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.05]",
    heroText: "text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium",
    heroImageContainer: "relative w-full max-w-[480px] aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl p-3 bg-gradient-to-tr from-primary/10 via-background to-primary/5 backdrop-blur-3xl transition-all duration-500 hover:shadow-primary/20 hover:border-primary/30",
    heroImageInner: "relative w-full h-full rounded-[2rem] overflow-hidden shadow-inner",
  },
};
