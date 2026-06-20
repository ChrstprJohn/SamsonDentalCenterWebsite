'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Inter, Playfair_Display, Josefin_Sans } from 'next/font/google';
import { motion, AnimatePresence, useScroll } from 'motion/react';
import Link from 'next/link';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
});

import { servicesData } from './services/data';
import { 
  Menu, X, Phone, MapPin, Clock, Calendar, Check,
  ShieldCheck, ArrowRight, ArrowUpRight, MoveRight, Sparkles, Heart, Activity,
  Instagram, Facebook, Map, Star, Award
} from 'lucide-react';

// Custom Type for Form Submissions
interface BookingInquiry {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  message: string;
}

const journeySlides = [
  {
    header: "More personal than personal",
    text: "After a complex diagnosis, each patient is assigned a Treatment Plan Coordinator, or Personal Concierge. He or she takes care to ensure that the entire process is flawless and personalised — from scheduling appointments to the tiniest details that make your experience enjoyable and give you peace of mind."
  },
  {
    header: "Complete privacy",
    text: "Treatment takes place in quiet, enclosed premises. Here you can feel safe, free and comfortable, away from the gaze of others or any disturbance."
  },
  {
    header: "Complete Sensory Calming",
    text: "Through micro-diffusion of specialized organic essential oils and high-performance noise-canceling headsets, we neutralize standard clinical triggers. Enjoy heated herbal neck wraps, calming light therapy, and custom tea blends."
  },
  {
    header: "Microscopic Engineering",
    text: "Utilizing dental operating microscopes, our prosthodontists achieve sub-micron accuracy. Every restoration is crafted for a flush margin, preserving valuable tooth structure and guaranteeing longevity."
  },
  {
    header: "Bespoke Biological Materials",
    text: "We exclusively select premium biocompatible, metals-free ceramics and premium composite restorations that naturally mimic the visual refraction and structural elasticity of biological tooth tissue."
  },
  {
    header: "Facial Harmonization",
    text: "Each individual veneer layout is meticulously balanced with your facial structural vectors, lip mobility, and natural alignment axes. We reject generic templates to build cohesive oral masterpieces."
  }
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  // Navigation scroll state
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Gallery Filtering
  const [activeTab, setActiveTab] = useState<'all' | 'clinic' | 'smiles' | 'lounge'>('all');
  
  // Custom Form Booking states
  const [bookingForm, setBookingForm] = useState<BookingInquiry>({
    name: '',
    email: '',
    phone: '',
    service: 'Cosmetic Dentistry',
    date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auth Modal States
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // 3.5 Sanctuary Journey scroll references
  const journeyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"]
  });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!scrollYProgress) return;
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const step = Math.min(Math.floor(latest * 6), 5);
      setActiveStep(step);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Monitor desktop scrolling
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Track active section
      const sectionIds = ['home', 'services', 'journey', 'about', 'gallery', 'contact'];
      const scrollPosition = window.scrollY + 250; // offset for better scrolling feel
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Simple validation
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.date) {
      setErrorMsg('Please complete all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormSubmitted(true);
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nav items helper
  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'About Us', href: '#about' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' }
  ];

  // Services list helper
  const services = servicesData;

  // Gallery images with architectural aesthetics
  const galleryItems = [
    {
      id: 1,
      category: 'clinic',
      title: 'Architectural Treatment Suite',
      img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
      size: 'span-2 col-span-1'
    },
    {
      id: 2,
      category: 'lounge',
      title: 'Therapeutic Quiet Lounge',
      img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop',
      size: 'col-span-1'
    },
    {
      id: 3,
      category: 'clinic',
      title: 'Micro-surgical Operatory',
      img: 'https://images.unsplash.com/photo-1513412583855-8d64eb019787?q=80&w=800&auto=format&fit=crop',
      size: 'col-span-1'
    },
    {
      id: 4,
      category: 'smiles',
      title: 'Artisanal Natural Veneers',
      img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
      size: 'col-span-1'
    },
    {
      id: 5,
      category: 'lounge',
      title: 'Scent-infused Entry Chamber',
      img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
      size: 'col-span-1'
    }
  ];

  const filteredGallery = activeTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeTab);

  return (
    <div className={`relative min-h-screen bg-[#FDFDFD] text-[#1D1E1E] ${inter.variable} ${playfair.variable} ${josefin.variable}`}>
      
      {/* 1. Header / Navigation Bar */}
      <header 
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          mobileMenuOpen
            ? 'bg-transparent backdrop-blur-none border-b border-transparent py-5'
            : scrolled 
              ? 'bg-[#FDFDFD]/90 backdrop-blur-sm border-b border-[#EEEEEB] shadow-sm py-4' 
              : 'bg-[#1D1E1E]/15 backdrop-blur-[3px] border-b border-white/5 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <a 
            href="#home" 
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 group focus:outline-none transition-colors duration-300 ${
              (scrolled || mobileMenuOpen) ? 'text-[#1D1E1E]' : 'text-white'
            }`} 
            id="logo-anchor"
          >
            <span className="w-9 h-9 rounded-[15.6px] border border-current flex items-center justify-center font-serif text-[18px] italic font-normal tracking-none transition-transform group-hover:rotate-12 duration-300">
              S
            </span>
            <div className="flex flex-col text-[14px]">
              <span className="font-serif text-[21px] lg:text-[23px] tracking-[0.2em] font-bold leading-none uppercase font-sans">
                Samson
              </span>
              <span className="text-[9px] lg:text-[10px] tracking-[0.3em] uppercase opacity-75 font-sans font-bold leading-none mt-1.5">
                Dental Center
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 font-sans text-[13px] tracking-[0.1em] font-medium uppercase" id="desktop-nav">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`transition-colors duration-300 relative px-4 py-2.5 ${
                    scrolled 
                      ? isActive 
                        ? 'text-[#D94E4E]' 
                        : 'text-[#1D1E1E]/75 hover:text-[#D94E4E]'
                      : isActive 
                        ? 'text-[#D94E4E]' 
                        : 'text-white/80 hover:text-[#D94E4E]'
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

          {/* Actions Block (Desktop Auth & Mobile Menu) */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-5">
              <button 
                onClick={() => {
                  setAuthModal({ isOpen: true, mode: 'login' });
                  setAuthSuccess(false);
                  setAuthMessage(null);
                  setAuthEmail('');
                  setAuthPassword('');
                  setAuthName('');
                }}
                className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 cursor-pointer ${
                  scrolled 
                    ? 'text-gray-600 hover:text-[#D94E4E]' 
                    : 'text-white/80 hover:text-[#D94E4E]'
                }`}
              >
                Log In
              </button>
              <button 
                onClick={() => {
                  setAuthModal({ isOpen: true, mode: 'signup' });
                  setAuthSuccess(false);
                  setAuthMessage(null);
                  setAuthEmail('');
                  setAuthPassword('');
                  setAuthName('');
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-xs cursor-pointer ${
                  scrolled 
                    ? 'bg-[#141515] text-white hover:bg-[#D94E4E]' 
                    : 'bg-white text-[#141515] hover:bg-[#D94E4E] hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors focus:outline-none z-50 ${(scrolled || mobileMenuOpen) ? 'text-[#1D1E1E]' : 'text-white'}`}
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Smooth animate) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 w-screen h-screen bg-[#FDFDFD] z-40 px-8 flex flex-col justify-center items-center shadow-2xl lg:hidden overflow-y-auto"
            id="mobile-navigation-overlay"
          >
            <div className="flex flex-col gap-8 font-sans text-center text-base uppercase tracking-[0.2em] font-medium w-full max-w-xs mx-auto">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 transition-colors border-b border-gray-100/60 pb-1 text-[14px] pt-[5px] ${
                      isActive ? 'text-[#D94E4E]' : 'text-[#1D1E1E]/85 hover:text-[#D94E4E]'
                    }`}
                    style={{ fontWeight: isActive ? '600' : '500', fontSize: '14px', paddingTop: '5px' }}
                  >
                    {item.label}
                  </a>
                );
              })}
              <div className="flex flex-col gap-4 pt-6 mt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModal({ isOpen: true, mode: 'login' });
                    setAuthSuccess(false);
                    setAuthMessage(null);
                    setAuthEmail('');
                    setAuthPassword('');
                    setAuthName('');
                  }}
                  className="py-2.5 text-[14px] font-semibold uppercase tracking-[0.2em] hover:text-[#D94E4E] transition-colors cursor-pointer border border-gray-300 rounded-full"
                  style={{ fontSize: '14px' }}
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModal({ isOpen: true, mode: 'signup' });
                    setAuthSuccess(false);
                    setAuthMessage(null);
                    setAuthEmail('');
                    setAuthPassword('');
                    setAuthName('');
                  }}
                  className="px-6 py-3.5 bg-[#141515] text-white rounded-full text-[14px] font-semibold hover:bg-[#D94E4E] tracking-[0.2em] transition-all cursor-pointer"
                  style={{ fontSize: '14px' }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Section: Full bleed Unsplash architectural photo */}
      <section 
        id="home"
        className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-black"
      >
        {/* Background Image with elegant overlay overlay */}
        <div className="absolute inset-0 z-0">
          <picture>
            <img 
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop" 
              alt="Luxury modern architectural dental treatment facility, ambient warm light"
              className="w-full h-full object-cover object-center filter brightness-[0.65] saturate-[0.9] contrast-[1.02]"
            />
          </picture>
          {/* Enhanced contrast gradient overlay with custom smooth transition to stats block below */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-[#141515] z-0" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12 text-center text-white mt-10 lg:mt-2">

          {!mounted ? (
            <h1 
              className="font-serif text-[37px] md:text-[60px] lg:text-[75px] font-semibold tracking-tight text-center leading-tight lg:leading-[74.8px] max-w-4xl mx-auto"
              style={{ marginRight: '16px', fontWeight: '600', fontStyle: 'normal' }}
            >
              Unlock a World of
              <br />
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold lg:text-[75px] text-white" id="hero-radiant-smiles">
                Radiant Smiles
                <svg 
                  className="absolute left-0 -bottom-2 sm:-bottom-4 w-full h-2 sm:h-3 text-[#D94E4E] overflow-visible" 
                  viewBox="0 0 100 8" 
                  preserveAspectRatio="none"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0,4 Q12.5,1 25,4 T50,4 T75,4 T100,4" />
                </svg>
              </span>
            </h1>
          ) : (
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="font-serif text-[37px] md:text-[60px] lg:text-[75px] font-semibold tracking-tight text-center leading-tight lg:leading-[74.8px] max-w-4xl mx-auto"
              style={{ marginRight: '16px', fontWeight: '600', fontStyle: 'normal' }}
            >
              Unlock a World of
              <br />
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold lg:text-[75px] text-white" id="hero-radiant-smiles">
                Radiant Smiles
                <svg 
                  className="absolute left-0 -bottom-2 sm:-bottom-4 w-full h-2 sm:h-3 text-[#D94E4E] overflow-visible" 
                  viewBox="0 0 100 8" 
                  preserveAspectRatio="none"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0,4 Q12.5,1 25,4 T50,4 T75,4 T100,4" />
                </svg>
              </span>
            </motion.h1>
          )}

          <motion.p 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="mt-4 sm:mt-5 lg:mt-[38px] text-[13px] sm:text-sm md:text-base lg:text-[18px] leading-[23px] sm:leading-relaxed lg:leading-[32.5px] lg:font-normal lg:not-italic text-center text-white/95 max-w-2xl mx-auto font-light tracking-wide"
          >
            Exceptional Dental Care Powered by Expertise, Innovation and Advanced Technology. Trusted by companies and individuals for over 60 years.
          </motion.p>

          {/* Double Button Option with Micro-Interactions */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs lg:text-[14px] font-semibold uppercase tracking-widest"
          >
            <a 
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-950 rounded-full hover:bg-emerald-50 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              Book Appointment
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </a>
            <a 
              href="#services"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-xs flex items-center justify-center"
            >
              Explore Services
            </a>
          </motion.div>
        </div>


      </section>

      {/* Dedicated Trust & Stats Section (Sophisticated Deep Slate-Charcoal instead of pure black) */}
      <section id="trust-and-stats" className="relative w-full bg-[#141515] border-y border-[#D94E4E]/15 overflow-hidden z-20">
        
        {/* Mobile View: Rotating Luxury Marquee Banner with Edge Fade Masks */}
        <div className="block lg:hidden py-6 overflow-hidden relative" id="trust-marquee-ribbon">
          {/* Elegant horizontal gradient mask blocks matching section's background color */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#141515] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#141515] to-transparent pointer-events-none z-10" />

          <div className="animate-marquee flex flex-row items-center whitespace-nowrap shrink-0">
            {/* Main Loop Group */}
            <div className="flex items-center gap-x-10 sm:gap-x-12 px-5">
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">60+</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal">
                  Years of Pure Dental Expertise
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">4.9★</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal">
                  Google Rating (2.5k+ Reviews)
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">15k+</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[140px] sm:max-w-[170px] whitespace-normal">
                  Radiant Smiles Formed
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">100%</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[135px] sm:max-w-[165px] whitespace-normal">
                  Board-Certified Specialists
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">Elite</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal">
                  In-House Ceramic Smile Lab
                </span>
              </div>
            </div>

            {/* Duplicated Loop Group for seamless looping transitions */}
            <div className="flex items-center gap-x-10 sm:gap-x-12 px-5">
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">60+</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal">
                  Years of Pure Dental Expertise
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">4.9★</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal">
                  Google Rating (2.5k+ Reviews)
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">15k+</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[140px] sm:max-w-[170px] whitespace-normal">
                  Radiant Smiles Formed
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">100%</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[135px] sm:max-w-[165px] whitespace-normal">
                  Board-Certified Specialists
                </span>
              </div>
              
              <span className="text-[#D94E4E]/30 font-serif text-sm select-none self-center">✦</span>
              
              <div className="flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[#D94E4E] font-serif text-2xl sm:text-3xl font-light mb-1 select-none">Elite</span>
                <span className="font-sans text-[9px] sm:text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal">
                  In-House Ceramic Smile Lab
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Large/Medium Desktop View: Elegant Static Stat Grid */}
        <div className="hidden lg:block max-w-7xl mx-auto px-12 py-12" id="desktop-stats-grid">
          <div className="grid grid-cols-5 gap-4 divide-x divide-[#D94E4E]/15">
            {/* Stat Item 1 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-[#D94E4E] font-serif text-4xl font-light mb-2.5">60+</span>
              <span className="font-sans text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[180px]">
                Years of Pure Dental Expertise
              </span>
            </div>
            {/* Stat Item 2 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-[#D94E4E] font-serif text-4xl font-light mb-2.5">4.9★</span>
              <span className="font-sans text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[180px]">
                Google Rating (2.5k+ Reviews)
              </span>
            </div>
            {/* Stat Item 3 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-[#D94E4E] font-serif text-4xl font-light mb-2.5">15k+</span>
              <span className="font-sans text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[180px]">
                Radiant Smiles Formed
              </span>
            </div>
            {/* Stat Item 4 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-[#D94E4E] font-serif text-4xl font-light mb-2.5">100%</span>
              <span className="font-sans text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[180px]">
                Board-Certified Specialists
              </span>
            </div>
            {/* Stat Item 5 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-[#D94E4E] font-serif text-4xl font-light mb-2.5">Elite</span>
              <span className="font-sans text-[10.5px] tracking-[0.16em] text-white/80 font-medium uppercase leading-relaxed max-w-[180px]">
                In-House Ceramic Smile Lab
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* 3. Services / Specialty Care Section */}
      <section id="services" className="bg-[#FDFDFD] relative overflow-hidden">
        {/* Upper Part: Elegant White background with Header and image cards */}
        <div className="relative z-10 pt-24 sm:pt-32 pb-0">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          {/* Header Layout */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-24 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] tracking-[0.34em] text-[#D94E4E] uppercase font-bold block mb-4">
                Clinical Expertise
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1E1E]">
                Bespoke Treatment Programs
              </h2>
            </div>
            <p className="text-sm font-light text-gray-500 max-w-sm leading-relaxed">
              We approach every patient’s anatomy as a clinical masterpiece, designing custom therapeutic strategies that balance structural health and perfect facial balance.
            </p>
          </div>

          {/* First Block: Gorgeous Bento Grid (01 to 05) overlap section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative z-10">
              
              {/* Unified Service Cards - Consistent Size & Styling */}
              {services.slice(0, 5).map((svc, idx) => {
                const words = svc.title.split(' ');
                const getCardColSpan = (index: number) => {
                  if (index === 0) return "col-span-2 lg:col-span-4";
                  return "col-span-1 lg:col-span-1";
                };
                return (
                  <Link 
                    key={svc.id} 
                    href={`/services/${svc.id}`}
                    className={`group relative h-[250px] xs:h-[300px] sm:h-[380px] md:h-[400px] lg:h-[480px] rounded-[16px] sm:rounded-[24px] overflow-hidden shadow-md block ${getCardColSpan(idx)} bg-[#141515]`}
                  >
                    <img 
                      src={svc.image} 
                      alt={svc.title}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-750 ease-out filter brightness-[0.75] saturate-[0.95] contrast-[1.01]"
                    />
                    {/* Consistent Light-Dark overlay and contrast enhancement */}
                    <div className="absolute inset-0 bg-[#1D1E1E]/20 z-5 transition-opacity duration-350 group-hover:opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10" />
                    
                    {/* Top Details */}
                    <span className="absolute top-3 left-3 sm:top-6 sm:left-6 text-white font-josefin font-bold text-[18px] xs:text-[22px] sm:text-[26px] md:text-[30px] z-15">
                      0{idx + 1}
                    </span>
                    <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-7 h-7 sm:w-12 sm:h-12 bg-white text-[#141515] group-hover:bg-[#D94E4E] group-hover:text-white rounded-full flex items-center justify-center font-semibold shadow-md z-15 transition-all duration-300">
                      <MoveRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                    </div>

                    {/* Title (Bottom Left) - Pure White Font consistent with Hero */}
                    <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-15 max-w-[85%]">
                      <h3 className="font-josefin text-left text-[18px] xs:text-[22px] sm:text-[26px] md:text-[30px] font-bold text-white tracking-tight leading-tight">
                        {words.length === 2 ? (
                          <>
                            {words[0]}
                            <br />
                            {words[1]}
                          </>
                        ) : (
                          svc.title
                        )}
                      </h3>
                    </div>
                  </Link>
                );
              })}

            </div>
          </div>
        </div>

        {/* Lower Part / Background Switch: Deep cohesive dark charcoal match to the marquee */}
        {/* Negative margins allow the image grid cards to gorgeously overlap onto the dark section by ~12.5% (45px) */}
        <div className="bg-[#141515] relative pt-20 pb-24 sm:pb-32 mt-[-45px] z-0">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
            
            <div className="mb-8 border-b border-[#D94E4E]/15" />

            <div className="divide-y divide-[#D94E4E]/10">
              {services.slice(5, 10).map((svc, idx) => (
                <Link 
                  key={svc.id} 
                  href={`/services/${svc.id}`}
                  className="group flex items-center justify-between py-6 sm:py-8 transition-colors duration-300 hover:bg-[#1C1D1D]/70 px-4 sm:px-6 rounded-2xl block"
                >
                  {/* Index Left */}
                  <span className="text-2xl sm:text-3xl font-josefin font-bold text-white/90 group-hover:text-white transition-colors w-12 sm:w-24 text-left">
                    {idx + 6 < 10 ? `0${idx + 6}` : idx + 6}
                  </span>

                  {/* Title Center - Consistent with Hero typography */}
                  <h4 className="font-josefin text-lg sm:text-[30px] font-semibold tracking-tight text-white/95 group-hover:text-white transition-colors flex-1 text-center font-josefin">
                    {svc.title}
                  </h4>

                  {/* Right container matching width of left container to guarantee true centering of the title */}
                  <div className="w-12 sm:w-24 flex justify-end">
                    {/* Circular Arrow Button (pointing North-East initially, clockwise rot to East under hover) */}
                    <div className="w-11 h-11 bg-white/5 group-hover:bg-[#D94E4E] rounded-full border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-all duration-300">
                      <MoveRight className="w-5 h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>

      </section>

      {/* 3.5. Interactive Sanctuary Journey / Scroll Rotation Section */}
      <section 
        id="journey" 
        ref={journeyRef} 
        className="relative h-[480vh] bg-[#141515] select-none"
      >
        {/* Sticky Viewport Container */}
        <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-end overflow-hidden bg-[#141515] text-[#FDFDFD] z-10">
          
          {/* Subtle Premium Background Pattern/Illustration */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.1] z-0 overflow-hidden">
            <svg className="absolute w-full h-full text-[#D94E4E]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dotPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
                <pattern id="gridPattern" width="120" height="120" patternUnits="userSpaceOnUse">
                  <path d="M 120 0 L 0 0 0 120" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />
              <rect width="100%" height="100%" fill="url(#dotPattern)" opacity="0.3" />
              <circle cx="10%" cy="10%" r="20%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" opacity="0.5" />
              <circle cx="90%" cy="80%" r="35%" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <circle cx="90%" cy="80%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <circle cx="90%" cy="80%" r="25%" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.2" />
            </svg>
          </div>
          
          {/* Central Semicircle / Wheel and Content Assembly */}
          <div className="relative w-full max-w-7xl mx-auto flex flex-col justify-between items-center overflow-hidden pb-0 px-6 sm:px-12 h-full pt-16 sm:pt-20 lg:pt-24">
            
            {/* Header Block with responsive alignment padding */}
            <div className="w-full relative z-30 pt-4 sm:pt-6">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FDFDFD] leading-tight text-center lg:text-left mt-2 sm:mt-0">
                Your smile starts here
              </h2>
            </div>
            
            {/* Semicircle parent container - shortened to show only the top 40% of the circle, creating a flatter arc sticking to the bottom */}
            <div className="relative w-[340px] h-[136px] sm:w-[660px] sm:h-[264px] md:w-[850px] md:h-[340px] lg:w-full lg:max-w-7xl lg:h-auto lg:aspect-[5/2] overflow-visible z-10">
              
              {/* Static Semicircle Arc Reference Line (drawn as a full circle, matching the wheel layout) */}
              <div className="absolute bottom-[-204px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[340px] h-[340px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full border border-white/10 pointer-events-none z-0" />
 
              {/* The Active Top Vertical Connection Line (exactly matching the user illustration!) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-12 sm:h-20 bg-gradient-to-b from-[#D94E4E] to-[#D94E4E]/10 z-20 pointer-events-none" />
 
              {/* Rotating Wheel Container (rotates based on active index with its center lowered below the bottom of the section) */}
              <motion.div
                animate={{ rotate: -activeStep * 60 }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                className="absolute bottom-[-204px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[340px] h-[340px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full z-10"
              >
                {journeySlides.map((_, idx) => {
                   // Calculate point positions on the wheel
                   const angleDeg = 270 + idx * 60;
                   const angleRad = (angleDeg * Math.PI) / 180;
                   
                   // Position of small indicators on the arc (at exactly 50% radius)
                   const dotLeft = `${50 + 50 * Math.cos(angleRad)}%`;
                   const dotTop = `${50 + 50 * Math.sin(angleRad)}%`;
 
                   // Position of active indicator capsule, offset slightly outwards (54.5% radius)
                   const numLeft = `${50 + 54.5 * Math.cos(angleRad)}%`;
                   const numTop = `${50 + 54.5 * Math.sin(angleRad)}%`;
 
                   return (
                     <React.Fragment key={`point-${idx}`}>
                       {/* Small Dot resting on the curved track line */}
                       <div 
                         className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D94E4E] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none z-10"
                         style={{ left: dotLeft, top: dotTop }}
                       />
 
                       {/* Numeric Capsule Bubble */}
                       <div 
                         className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                         style={{ left: numLeft, top: numTop }}
                       >
                         <motion.button
                           onClick={() => {
                             const scrollPercent = idx / 5;
                             if (journeyRef.current) {
                               const rect = journeyRef.current.getBoundingClientRect();
                               const scrollTop = window.scrollY + rect.top;
                               const scrollHeight = journeyRef.current.offsetHeight;
                               const targetScroll = scrollTop + scrollPercent * (scrollHeight - window.innerHeight);
                               window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                             }
                           }}
                           animate={{
                             rotate: idx * 60, // Realistic rotational physics: always upright at top center, tilted elsewhere
                             scale: activeStep === idx ? 1.15 : 1.0,
                             backgroundColor: activeStep === idx ? "#D94E4E" : "rgba(20, 21, 21, 0.45)",
                             color: activeStep === idx ? "#FDFDFD" : "rgba(253, 253, 253, 0.7)",
                             borderColor: activeStep === idx ? "#D94E4E" : "rgba(255, 255, 255, 0.15)",
                             boxShadow: activeStep === idx ? "0 4px 24px rgba(217, 78, 78, 0.45)" : "none"
                           }}
                           transition={{ type: "spring", stiffness: 80, damping: 18 }}
                           className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center font-sans font-bold text-xs sm:text-sm tracking-tight cursor-pointer focus:outline-none transition-shadow"
                         >
                           {idx + 1}
                         </motion.button>
                       </div>
                     </React.Fragment>
                   );
                })}
              </motion.div>
 
              {/* Content Display: Rendered elegantly inside the upper crescent of the rotating loop, below the vertical line */}
              <div className="absolute bottom-[calc(110px+8vh)] sm:bottom-[calc(185px+8vh)] md:bottom-[calc(240px+8vh)] lg:bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-[90%] sm:max-w-xl md:max-w-2xl px-6 text-center z-20 h-[330px] sm:h-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center h-full sm:h-auto md:h-[500px] lg:h-auto justify-center"
                  >
                    <h3 className="font-serif text-2xl sm:text-3.5xl md:text-[30px] lg:text-[38px] text-[#FDFDFD] font-medium tracking-wide leading-tight mb-4 sm:mb-6 max-w-lg sm:max-w-xl md:max-w-2xl">
                      {journeySlides[activeStep].header}
                    </h3>
                    <p className="text-gray-300 font-sans text-xs sm:text-sm md:text-[14.5px] lg:text-[16px] font-light leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl">
                      {journeySlides[activeStep].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
 
            </div>
 
          </div>
 
        </div>
      </section>

      {/* 4. About Us / Our Philosophy Section */}
      <section id="about" className="py-24 sm:py-32 bg-[#FDFDFD] relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Visual Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                <picture>
                  <img 
                    src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop"
                    alt="Precision natural cosmetic veneers dental artist checking color shades"
                    className="w-full h-full object-cover object-center filter sepia-[0.1]"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Overlay architectural detail badge */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-emerald-950 text-white p-6 rounded-2xl max-w-xs shadow-xl font-sans">
                <p className="font-serif text-2xl font-light tracking-tight leading-none text-emerald-300">
                  15+ Years
                </p>
                <p className="text-[10px] tracking-widest font-semibold uppercase mt-2 text-white/80">
                  of biological dentistry excellence
                </p>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6">
              <span className="text-[10px] tracking-[0.34em] text-emerald-800 uppercase font-bold block mb-4">
                Redefined Sanctuary
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1D1E1E] leading-tight">
                Dental craftsmanship without anxiety.
              </h2>
              
              <div className="mt-8 space-y-6 text-[#4F5454] font-light leading-relaxed text-sm sm:text-[15px]">
                <p>
                  At Samson Dental Center, we dismiss the traditional aseptic, noisy clinical blueprint. We designed our studio to function as an upscale boutique wellness retreat, removing standard sensory triggers through state-of-the-art quiet instruments and specialized calming scents.
                </p>
                <p className="font-medium text-[#1D1E1E]">
                  &ldquo;Each veneer, crown, and realignment is designed in meticulous alignment with the natural symmetry principles found in classic design and physical architecture.&rdquo;
                </p>
                <p>
                  Led by expert cosmetic prosthodontists, we integrate state-of-the-art diagnostic imaging with microscopic accuracy to construct biological restorations that maintain structural longevity and organic beauty simultaneously.
                </p>
              </div>

              {/* Unique Features / Proof points */}
              <div className="mt-10 grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#1D1E1E]">Aroma Diffusion</h4>
                  <p className="text-[12px] text-gray-500 mt-1">Scent-infused air systems optimized to actively regulate elevated heart rate metrics.</p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#1D1E1E]">Ultra-Quiet Tech</h4>
                  <p className="text-[12px] text-gray-500 mt-1">Noise-reduction instruments producing 70% lower acoustic frequencies.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Pure Visual Gallery Section */}
      <section id="gallery" className="py-24 bg-[#F3F3EF]/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[10px] tracking-[0.34em] text-emerald-800 uppercase font-bold block mb-4">
              Modern Portfolio
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1D1E1E] max-w-2xl">
              Inside Our Sanctuary
            </h2>
            
            {/* Filter Pills with gentle animation */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 font-sans text-[11px] tracking-widest font-semibold uppercase">
              {[
                { id: 'all', label: 'All Spaces' },
                { id: 'clinic', label: 'Treatment Suites' },
                { id: 'smiles', label: 'Artisan Veneers' },
                { id: 'lounge', label: 'Reception Lounge' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                    activeTab === tab.id 
                      ? 'bg-emerald-950 text-white shadow-sm' 
                      : 'bg-white/60 text-gray-600 hover:bg-white hover:text-emerald-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid container with beautiful aspect ratios */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            id="gallery-grid"
          >
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group relative h-[320px] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <img 
                    src={item.img} 
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Minimal caption details on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-emerald-300 tracking-widest">
                        {item.category}
                      </span>
                      <h4 className="text-white font-serif text-lg font-light tracking-wide mt-1">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 6. Contact & Secure Booking Inquiry Section */}
      <section id="contact" className="py-24 sm:py-32 bg-[#FDFDFD] relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Information Column */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] tracking-[0.34em] text-emerald-800 uppercase font-bold block mb-4">
                  Reservations
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1D1E1E]">
                  Inquire Consultation
                </h2>
                <p className="mt-6 text-sm sm:text-[15px] font-light text-gray-600 leading-relaxed">
                  Reserve a time slot with our master clinicians for a detailed anatomical diagnostics overview. Our reservation concierges will follow up shortly to curate your bespoke visit.
                </p>

                {/* Practical coordinates */}
                <div className="mt-10 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-950 border border-gray-100 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400">Direct Desk</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">+1 (555) 234-8890</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-950 border border-gray-100 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400">Oasis Address</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">Suite 400, 120 Sansome Street, San Francisco</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-950 border border-gray-100 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400">Consultation Hours</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">Mon – Fri: 8:00 AM – 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accreditations bar */}
              <div className="mt-12 lg:mt-0 pt-8 border-t border-gray-100 flex items-center gap-6">
                <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-gray-400">Accredited Member:</span>
                <span className="text-xs font-serif italic text-emerald-950 tracking-wider">American Academy of Cosmetic Dentistry</span>
              </div>
            </div>

            {/* Reservation Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-[#F9F9F6] border border-gray-100 p-8 sm:p-10 rounded-3xl" id="booking-form-card">
                <AnimatePresence mode="wait">
                  {!formSubmitted ? (
                    <motion.form 
                      key="booking-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleBookingSubmit} 
                      className="space-y-6"
                    >
                      <h3 className="font-serif text-xl font-medium text-gray-900 mb-6 border-b border-gray-200/50 pb-4">
                        Secure Appointment Pathway
                      </h3>

                      {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-100 text-xs text-red-600 rounded-2xl">
                          {errorMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Your Full Name *</label>
                          <input 
                            type="text" 
                            name="name"
                            required
                            value={bookingForm.name}
                            onChange={handleInputChange}
                            placeholder="Eleanor Vance"
                            className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Email Address *</label>
                          <input 
                            type="email" 
                            name="email"
                            required
                            value={bookingForm.email}
                            onChange={handleInputChange}
                            placeholder="eleanor@domain.com"
                            className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Phone Number *</label>
                          <input 
                            type="tel" 
                            name="phone"
                            required
                            value={bookingForm.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Select Specialty Pathway *</label>
                          <select 
                            name="service"
                            value={bookingForm.service}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-800 transition-colors appearance-none"
                          >
                            <option value="Cosmetic Dentistry">Aesthetic Dentistry (Porcelain / Veneers)</option>
                            <option value="Restorative Care">Restorative Care (Structural biological implants)</option>
                            <option value="Preventative Wellness">Preventative Wellness (Therapy & Deep cleaning)</option>
                            <option value="Clear Orthodontics">Clear Alignment pathway</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Preferred Target Date *</label>
                        <input 
                          type="date" 
                          name="date"
                          required
                          value={bookingForm.date}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Inquiry notes or health records outline</label>
                        <textarea 
                          name="message"
                          rows={4}
                          value={bookingForm.message}
                          onChange={handleInputChange}
                          placeholder="Please note any sensory preferences, prior dentist notes, or targets..."
                          className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-800 transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-emerald-950 text-white rounded-2xl text-xs font-semibold tracking-widest uppercase hover:bg-emerald-900 transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          'Submitting Security Consultation...'
                        ) : (
                          <>
                            Submit Secure Request
                            <Check className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mx-auto">
                        <Check className="w-8 h-8" />
                      </div>
                      <h3 className="font-serif text-2xl font-light text-gray-900 mt-6">
                        Reservation Received
                      </h3>
                      <p className="text-sm font-light text-gray-500 max-w-md mx-auto leading-relaxed">
                        Thank you, <span className="font-medium text-gray-900">{bookingForm.name}</span>. Your details are secure. Our cosmetic reservation desk will contact you at <span className="font-medium text-gray-900">{bookingForm.phone}</span> within 24 working hours to finalize our diagnostics outline.
                      </p>
                      <button 
                        onClick={() => {
                          setFormSubmitted(false);
                          setBookingForm({
                            name: '',
                            email: '',
                            phone: '',
                            service: 'Cosmetic Dentistry',
                            date: '',
                            message: ''
                          });
                        }}
                        className="mt-8 px-6 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold rounded-full uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                      >
                        Submit another request
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#101915] text-[#DCE2DF]/80 border-t border-white/5 py-16 sm:py-20 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Logo & Philosophy column */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border border-[#DCE2DF] flex items-center justify-center font-serif text-sm font-bold text-[#E6EBE7]">S</span>
              <div className="flex flex-col">
                <span className="font-serif text-base tracking-[0.2em] font-medium leading-none text-[#E6EBE7] uppercase">Samson</span>
                <span className="text-[8px] tracking-[0.3em] uppercase opacity-75 leading-none mt-1">Dental Center</span>
              </div>
            </div>
            <p className="font-light text-[13px] leading-relaxed max-w-sm text-gray-300">
              A private treatment sanctuary shaping clinical tooth care around sensory peace, architectural proportions, and world-class cosmetic craft.
            </p>
            <div className="flex items-center gap-4 text-emerald-300">
              <a href="#" className="p-2 hover:text-[#E6EBE7] transition-all" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 hover:text-[#E6EBE7] transition-all" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick links to sections */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#E6EBE7] mb-6 tracking-wider">Navigation</h4>
            <ul className="space-y-4 font-medium tracking-wider uppercase text-[10px]">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-emerald-300 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Business & Location Details */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#E6EBE7] mb-6 tracking-wider">Coordinates</h4>
            <address className="not-italic space-y-4 font-light text-gray-300 leading-relaxed">
              <p>
                120 Sansome Street, Suite 400<br />
                San Francisco, CA 94104
              </p>
              <p>
                info@samsondental.com<br />
                +1 (555) 234-8890
              </p>
            </address>
          </div>

        </div>

        {/* Bottom copyright area */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400">
          <p>© {new Date().getFullYear()} Samson Dental Center. Created with ultimate care.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-all">Privacy Guideline</a>
            <a href="#" className="hover:text-white transition-all">Terms of Sanctuary Use</a>
          </div>
        </div>
      </footer>

      {/* Elegant Minimalist Auth Modal */}
      <AnimatePresence>
        {authModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="auth-modal-overlay">
            {/* Dark glass backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-[#FDFDFD] border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-2xl z-10 text-[#1D1E1E]"
              id="auth-modal-card"
            >
              {/* Close Button icon */}
              <button 
                onClick={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Logo / Title Area */}
              <div className="text-center mb-8">
                <span className="w-10 h-10 rounded-full border border-emerald-950 flex items-center justify-center font-serif text-sm font-bold tracking-widest text-[#1D1E1E] mx-auto mb-3">
                  S
                </span>
                <h3 className="font-serif text-2xl font-light tracking-tight text-gray-950">
                  {authModal.mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-xs text-gray-500 font-light mt-2 max-w-[260px] mx-auto leading-relaxed">
                  {authModal.mode === 'login' 
                    ? 'Access your private health records, session logs, and clinical diagrams.' 
                    : 'Embark on a personalized high-end clinical treatment pathway.'}
                </p>
              </div>

              {authSuccess ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-medium text-gray-950">
                    {authModal.mode === 'login' ? 'Successfully Logged In' : 'Account Initiated'}
                  </h4>
                  <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
                    {authModal.mode === 'login' 
                      ? `Welcome back! You have securely authenticated as ${authEmail}.`
                      : `Your patient registration path is active. We have sent a validation token to ${authEmail}.`}
                  </p>
                  <button 
                    onClick={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
                    className="mt-6 w-full py-3 bg-emerald-950 text-white rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-emerald-900 transition-all cursor-pointer shadow-sm"
                  >
                    Enter Sanctuary Portal
                  </button>
                </motion.div>
              ) : (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAuthSubmitting(true);
                    setAuthMessage(null);

                    // Basic Validation
                    if (!authEmail || !authPassword || (authModal.mode === 'signup' && !authName)) {
                      setAuthMessage('Please complete all required fields.');
                      setAuthSubmitting(false);
                      return;
                    }

                    try {
                      // Imitate auth request
                      await new Promise(resolve => setTimeout(resolve, 1200));
                      setAuthSuccess(true);
                    } catch {
                      setAuthMessage('Authentication error. Please try again.');
                    } finally {
                      setAuthSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  {authMessage && (
                    <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-xl">
                      {authMessage}
                    </div>
                  )}

                  {authModal.mode === 'signup' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-400">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Julian Vance"
                        className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-800 transition-colors"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-400">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="julian@domain.com"
                      className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-800 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-400">Password</label>
                    <input 
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-800 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3.5 bg-emerald-950 text-white rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-emerald-900 transition-all duration-300 shadow-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
                  >
                    {authSubmitting 
                      ? 'Processing Secure Connection...' 
                      : authModal.mode === 'login' ? 'Access Portal' : 'Register Profile'}
                  </button>

                  {/* Toggle Modes and Account Assistance Links */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModal(prev => ({
                          ...prev,
                          mode: prev.mode === 'login' ? 'signup' : 'login'
                        }));
                        setAuthMessage(null);
                        setAuthSuccess(false);
                      }}
                      className="hover:text-emerald-800 transition-colors focus:outline-none cursor-pointer"
                    >
                      {authModal.mode === 'login' ? 'Create an account' : 'Existing patients log in'}
                    </button>
                    {authModal.mode === 'login' && (
                      <a href="#" className="hover:text-[#1D1E1E] transition-colors">
                        Forgot Password?
                      </a>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Josefin_Sans } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Samson Dental Center | Modern & Minimalistic Dental Care',
  description: 'Sculpting radiant smiles with architectural precision. Experience top-tier aesthetic dentistry, preventive care, and bespoke restorative treatments at Samson Dental Center.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${josefin.variable}`}>
      <body suppressHydrationWarning className="bg-[#FCFCFB] text-[#1B1D1D] font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
@import "tailwindcss";

@theme {
  --font-serif: var(--font-serif);
  --font-sans: var(--font-sans);
  --font-josefin: var(--font-josefin);
}

/* Custom minimal utility for smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Luxury Marquee Animation */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  display: flex;
  width: max-content;
  animation: marquee 25s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
