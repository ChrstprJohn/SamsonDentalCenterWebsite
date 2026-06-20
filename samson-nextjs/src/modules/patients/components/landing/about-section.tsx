'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

/* ─── Design tokens ──────────────────────────────────────── */
const H_FONT = '"Josefin Sans","Jost",sans-serif';
const CLR_PRI = '#031c14';  // dark green (background)
const CLR_SEC = '#ddefde';  // cream (text / light bg)

/* ─── Image data ─────────────────────────────────────────── */
const CAROUSEL_IMAGES = [
  { src: '/images/about-clinic-01.png', alt: 'Dental clinic interior' },
  { src: '/images/about-clinic-02.png', alt: 'Treatment area' },
  { src: '/images/about-team-01.png',   alt: 'Our professional team' },
  { src: '/images/about-procedure-01.png', alt: 'Dental procedure' },
  { src: '/images/about-smile-01.png',  alt: 'Beautiful smile result' },
];

const GALLERY_IMAGES = [
  { src: '/images/about-clinic-01.png',    h: '380px', parallax: false },
  { src: '/images/about-smile-01.png',     h: '240px', parallax: true  },
  { src: '/images/about-team-01.png',      h: '320px', parallax: false },
  { src: '/images/about-procedure-01.png', h: '280px', parallax: true  },
  { src: '/images/about-clinic-02.png',    h: '340px', parallax: false },
  { src: '/images/hero_dental_office.png', h: '280px', parallax: false },
  { src: '/images/about-team-01.png',      h: '380px', parallax: true  },
  { src: '/images/about-smile-01.png',     h: '300px', parallax: false },
  { src: '/images/about-clinic-01.png',    h: '300px', parallax: true  },
];

/* ─── Manifest Carousel (autoplay image switcher) ─────────── */
const MANIFEST_IMAGES = [
  '/images/about-clinic-01.png',
  '/images/about-team-01.png',
  '/images/about-clinic-02.png',
  '/images/about-procedure-01.png',
  '/images/about-smile-01.png',
  '/images/hero_dental_office.png',
];

function ManifestCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(c => (c + 1) % MANIFEST_IMAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: '412 / 512', width: '100%', maxWidth: '380px' }}
    >
      {MANIFEST_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <Image src={src} alt="Samson Dental" fill className="object-cover" />
        </div>
      ))}
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {MANIFEST_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? 22 : 8,
              height: 8,
              background: i === idx ? CLR_PRI : 'rgba(3,28,20,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Experience Wheel ───────────────────────────────────── */
const STEPS = [
  { title: 'More personal than personal', body: 'Each patient is assigned a dedicated Treatment Plan Coordinator ensuring the entire process is flawless and personalised — from scheduling visits to the tiniest details.' },
  { title: 'A result you can see in advance', body: 'We create a 3D digital smile design before treatment starts. You see, know, and influence the end result — feeling confident about every next step.' },
  { title: 'Peace & safety at every appointment', body: 'The light, interior design, silence, and the attitude of our team create an environment where you can relieve stress and forget previous perceptions of dentistry.' },
  { title: 'All in one place', body: 'Therapists, prosthodontists, implantologists, aestheticians and hygienists are all here under one roof. Faster, more precise, more efficient treatment.' },
  { title: 'Trusted for over 60 years', body: 'We have been trusted by thousands of patients and companies for over six decades. Our legacy is built on excellence, compassion, and life-changing smiles.' },
  { title: 'Complete privacy', body: 'Treatment takes place in quiet, enclosed premises. Here you can feel safe, free, and comfortable — away from any disturbance.' },
];

function ExperienceWheel() {
  const [active, setActive] = useState(0);
  const RADIUS = 175;
  const step = STEPS[active];

  return (
    <div style={{ background: CLR_PRI, paddingTop: 'clamp(6rem,5.4545rem + 2.4242vw,7.5rem)', paddingBottom: 'clamp(6rem,5.4545rem + 2.4242vw,7.5rem)' }}>
      <div style={{ width: 'min(1290px, 100% - clamp(1.5rem,1.3636rem + 0.6061vw,1.875rem) * 2)', marginInline: 'auto' }}>
        <h2
          style={{ fontFamily: H_FONT, fontSize: 'clamp(1.9531rem,1.5867rem + 1.6285vw,2.9607rem)', fontWeight: 700, lineHeight: 1.1, color: CLR_SEC, marginBottom: '3rem' }}
        >
          Your smile starts here
        </h2>
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* SVG Wheel */}
          <div className="shrink-0" style={{ width: 400, height: 400 }}>
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="200" cy="200" r="170" stroke={CLR_SEC} strokeOpacity="0.12" fill="none" strokeWidth="1" />
              {STEPS.map((_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const x = 200 + RADIUS * Math.cos(angle);
                const y = 200 + RADIUS * Math.sin(angle);
                const isActive = i === active;
                return (
                  <g key={i} onClick={() => setActive(i)} style={{ cursor: 'pointer' }}>
                    <circle cx={x} cy={y} r={isActive ? 20 : 13} fill={isActive ? CLR_SEC : 'transparent'} stroke={CLR_SEC} strokeOpacity={isActive ? 1 : 0.35} strokeWidth="1" style={{ transition: 'all 0.4s' }} />
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={isActive ? CLR_PRI : CLR_SEC} style={{ fontSize: '11px', fontFamily: H_FONT, fontWeight: 700, opacity: isActive ? 1 : 0.5, transition: 'all 0.4s' }}>{i + 1}</text>
                  </g>
                );
              })}
              {STEPS.map((_, i) => {
                const a1 = (i * 60 - 90) * (Math.PI / 180);
                const a2 = ((i + 1) * 60 - 90) * (Math.PI / 180);
                return <line key={i} x1={200 + RADIUS * Math.cos(a1)} y1={200 + RADIUS * Math.sin(a1)} x2={200 + RADIUS * Math.cos(a2)} y2={200 + RADIUS * Math.sin(a2)} stroke={CLR_SEC} strokeOpacity="0.15" strokeWidth="1" />;
              })}
            </svg>
          </div>
          {/* Content */}
          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1">
            <p style={{ color: '#dbc093', marginBottom: '0.75rem', fontFamily: H_FONT, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Step {active + 1} of {STEPS.length}
            </p>
            <h3 style={{ fontFamily: H_FONT, fontSize: 'clamp(1.25rem,1.0986rem + 0.6727vw,1.6663rem)', fontWeight: 700, lineHeight: 1.2, color: CLR_SEC, marginBottom: '1.25rem' }}>
              {step.title}
            </h3>
            <p style={{ color: `${CLR_SEC}b3`, fontSize: 'clamp(1rem,0.9091rem + 0.404vw,1.25rem)', lineHeight: 1.6 }}>
              {step.body}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── CSS for scroll-driven animations ───────────────────── */
const SCROLL_CSS = `
  /* ══════════════════════════════════════════════════════════
     ABOUT PROCESS — CSS Scroll-Driven Animations
     Matches lavadental.lv/en structure exactly
     ══════════════════════════════════════════════════════════ */

  /* Root: declare the timeline scope so header + carousel can share it */
  .ap-root {
    timeline-scope: --about-process-carousel-tl, --about-process-carousel-end-tl;
  }

  /* Body: clip overflow so strip doesn't cause horizontal scroll */
  .ap-body {
    overflow-x: clip;
  }

  /* ── Header: sticky, centered, full-viewport-height ─────── */
  .ap-header {
    min-height: 100svh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6rem 0;
    text-align: center;
    overflow: clip;
  }

  /* ── Title enters from view-timeline of the header itself ── */
  .ap-header-title {
    /* Fallback: always visible */
    opacity: 1;
    transform: none;
  }

  @supports (animation-timeline: scroll()) and (animation-range: 0% 100%) {
    /* Header exits (fades + slides up) as carousel enters viewport */
    .ap-header {
      position: sticky;
      top: 0;
      animation: ap-header-leave ease-in forwards;
      animation-timeline: --about-process-carousel-tl;
      animation-range: 0 50vh;
    }

    /* Title animates in as header itself enters viewport */
    .ap-header-title {
      animation: ap-title-enter linear forwards;
      animation-timeline: view();
      animation-range: 0 100vh;
    }
  }

  /* ── Carousel wrapper: sticky 100vh panel ────────────────── */
  .ap-carousel {
    height: 100vh;
    position: sticky;
    top: 0;
    width: 100vw;
    overflow-x: clip;
  }

  /* ── Items strip: horizontal flex ────────────────────────── */
  .ap-items {
    height: 100vh;
    display: flex;
  }

  @supports (animation-timeline: scroll()) and (animation-range: 0% 100%) {
    .ap-items {
      width: 500vw;
      margin-left: -50vw;
      will-change: transform;
      animation: ap-carousel-move linear forwards;
      animation-timeline: --about-process-carousel-tl;
      animation-range: contain 0 contain 100%;
    }
  }

  /* ── Each carousel item ─────────────────────────────────── */
  .ap-item {
    flex: 0 0 100vw;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: clip;
  }

  @supports (animation-timeline: scroll()) and (animation-range: 0% 100%) {
    .ap-item {
      margin-left: -25vw;
    }
  }

  /* Hide all items if scroll-driven animations not supported */
  @supports not ((animation-timeline: scroll()) and (animation-range: 0% 100%)) {
    .ap-item {
      display: none;
    }
    /* Keep empty item visible as placeholder */
    .ap-item--empty {
      display: flex;
    }
  }

  /* ── Spacer: defines the scroll timeline (400vh) ─────────── */
  .ap-spacer {
    /* Fallback: zero height */
    height: 0;
  }

  @supports (animation-timeline: scroll()) and (animation-range: 0% 100%) {
    .ap-spacer {
      height: 400vh;
      view-timeline-name: --about-process-carousel-tl;
      view-timeline-axis: block;
      margin-top: -100vh;
    }
  }

  /* ── Keyframes ──────────────────────────────────────────── */
  @keyframes ap-header-leave {
    to {
      opacity: 0;
      transform: translateY(-40px);
    }
  }

  @keyframes ap-title-enter {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ap-carousel-move {
    to {
      transform: translate(calc(-100% + 275vw));
    }
  }

  /* ── Slogan overlay on main item ────────────────────────── */
  .ap-slogan-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    background: rgba(3, 28, 20, 0.38);
  }

  /* ── Gallery section ─────────────────────────────────────── */
  .ap-gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    align-items: start;
  }
`;

/* ─── Container width helper ─────────────────────────────── */
const CONTAINER_W = 'min(1290px, 100% - clamp(1.5rem,1.3636rem + 0.6061vw,1.875rem) * 2)';
const CONTAINER_PAD = 'clamp(6rem,5.4545rem + 2.4242vw,7.5rem)';

/* ─── Main About Section ─────────────────────────────────── */
export function AboutSection() {
  return (
    <section id="about">
      {/* Inject CSS scroll-driven animations */}
      <style dangerouslySetInnerHTML={{ __html: SCROLL_CSS }} />

      {/* ════════════════════════════════════════════════════════
          PART 1 — about-process (sticky header + carousel)
          ════════════════════════════════════════════════════════ */}
      <div className="ap-root" style={{ background: CLR_PRI }}>

        {/* ── Header: "We change the experience" ─────────────── */}
        <div className="ap-header">
          <div style={{ width: CONTAINER_W, marginInline: 'auto', padding: '0 1rem' }}>
            <p
              className="ap-header-title"
              style={{
                fontFamily: H_FONT,
                fontSize: 'clamp(1.9531rem,1.5867rem + 1.6285vw,2.9607rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                color: CLR_SEC,
                textAlign: 'center',
              }}
            >
              <span style={{ display: 'block' }}>We change the experience and</span>
              <span style={{ display: 'block' }}>help you regain confidence</span>
            </p>
          </div>
        </div>

        {/* ── Body: carousel + spacer ─────────────────────────── */}
        <div className="ap-body">

          {/* Sticky carousel: 100vh panel that stays fixed */}
          <div className="ap-carousel">
            {/* Flex strip of images — 500vw wide, translated by scroll */}
            <div className="ap-items">

              {/* Empty spacer item (keeps images offset correctly) */}
              <div className="ap-item ap-item--empty" style={{ background: CLR_PRI }} />

              {/* Image 01 */}
              <div className="ap-item">
                <Image
                  src={CAROUSEL_IMAGES[0].src}
                  alt={CAROUSEL_IMAGES[0].alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              {/* Image 02 */}
              <div className="ap-item">
                <Image
                  src={CAROUSEL_IMAGES[1].src}
                  alt={CAROUSEL_IMAGES[1].alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              {/* Image 03 (left offset) */}
              <div className="ap-item ap-item--left">
                <Image
                  src={CAROUSEL_IMAGES[2].src}
                  alt={CAROUSEL_IMAGES[2].alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              {/* Image 04 MAIN — has slogan overlay */}
              <div className="ap-item ap-item--main">
                <Image
                  src={CAROUSEL_IMAGES[3].src}
                  alt={CAROUSEL_IMAGES[3].alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                {/* Slogan overlay */}
                <div className="ap-slogan-wrap">
                  <div style={{ width: CONTAINER_W, marginInline: 'auto', padding: '0 1rem' }}>
                    <p
                      style={{
                        fontFamily: H_FONT,
                        fontSize: 'clamp(1.9531rem,1.5867rem + 1.6285vw,2.9607rem)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: CLR_SEC,
                        maxWidth: '1028px',
                        textShadow: '0 4px 32px rgba(3,28,20,0.9)',
                      }}
                    >
                      So that you feel good every step of the way.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image 05 (right offset) */}
              <div className="ap-item ap-item--right">
                <Image
                  src={CAROUSEL_IMAGES[4].src}
                  alt={CAROUSEL_IMAGES[4].alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

            </div>{/* /ap-items */}
          </div>{/* /ap-carousel */}

          {/* Spacer: 400vh — this drives the --about-process-carousel-tl timeline */}
          <div className="ap-spacer" />

        </div>{/* /ap-body */}

        {/* ── Gallery: 3-col parallax grid ───────────────────── */}
        <div style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
          <div style={{ width: CONTAINER_W, marginInline: 'auto' }}>
            <motion.p
              style={{
                color: `${CLR_SEC}66`,
                fontFamily: H_FONT,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '2.5rem',
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our studio
            </motion.p>

            <div className="ap-gallery-grid">
              {GALLERY_IMAGES.map((img, i) => {
                const isParallax = img.parallax;
                return (
                  <motion.div
                    key={i}
                    style={{
                      position: 'relative',
                      height: img.h,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginTop: isParallax ? 'clamp(4rem,25svh,8rem)' : undefined,
                    }}
                    initial={{ opacity: 0, y: 70 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.75,
                      delay: (i % 3) * 0.08,
                      ease: [0.33, 0, 0.11, 1],
                    }}
                  >
                    <Image
                      src={img.src}
                      alt={`Gallery ${i + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>{/* /ap-root */}

      {/* ════════════════════════════════════════════════════════
          PART 2 — Manifest (cream bg: image carousel + text)
          ════════════════════════════════════════════════════════ */}
      <div style={{ background: CLR_SEC, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: CONTAINER_W, marginInline: 'auto', paddingTop: CONTAINER_PAD, paddingBottom: CONTAINER_PAD }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="w-full max-w-sm mx-auto lg:mx-0">
              <ManifestCarousel />
            </div>
            <motion.div
              className="flex flex-col gap-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.33, 0, 0.11, 1] }}
            >
              <div style={{ width: 32, height: 2, background: CLR_PRI }} />
              <p style={{ color: CLR_PRI, fontSize: 'clamp(1.25rem,1.0986rem + 0.6727vw,1.6663rem)', fontWeight: 500, lineHeight: 1.55 }}>
                In our care, you&apos;ll receive not only treatment and a perfect smile, but also openness and support all the way to the result. Our mission is to change the perception of dentistry.
              </p>
              <div style={{ color: `${CLR_PRI}b3`, fontSize: 'clamp(1rem,0.9091rem + 0.404vw,1.25rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p>Music, ambiance and a finely designed interior together with a specially tailored atmosphere will enable you to experience a completely different dentistry — comfortable, calm and inspiring.</p>
                <p>We want your experience with us to be like flying in first class — personal, convenient and with no worries or stress.</p>
              </div>
              <div className="flex gap-8 pt-4" style={{ borderTop: `1px solid ${CLR_PRI}26` }}>
                {[['60+', 'Years of Excellence'], ['98%', 'Patient Satisfaction'], ['15k+', 'Smiles Created']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div style={{ fontFamily: H_FONT, fontSize: 'clamp(1.5625rem,1.323rem + 1.0644vw,2.2211rem)', fontWeight: 900, color: CLR_PRI }}>{val}</div>
                    <div style={{ fontFamily: H_FONT, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: `${CLR_PRI}8c` }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          PART 3 — Experience Wheel (dark green)
          ════════════════════════════════════════════════════════ */}
      <ExperienceWheel />

      {/* ════════════════════════════════════════════════════════
          PART 4 — CTA Reveal (cream bg)
          ════════════════════════════════════════════════════════ */}
      <div style={{ background: CLR_SEC }}>
        <div style={{ width: CONTAINER_W, marginInline: 'auto', paddingTop: CONTAINER_PAD, paddingBottom: CONTAINER_PAD }}>
          <motion.p
            style={{ fontFamily: H_FONT, fontSize: 'clamp(1.9531rem,1.5867rem + 1.6285vw,2.9607rem)', fontWeight: 700, lineHeight: 1.1, color: CLR_PRI, marginBottom: '3rem' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.33, 0, 0.11, 1] }}
          >
            That&apos;s us —<br />Samson Dental Center.
          </motion.p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '4/3' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Image src="/images/about-clinic-01.png" alt="Samson Dental Center" fill className="object-cover" />
              <div className="absolute inset-0" style={{ background: `${CLR_PRI}33` }} />
            </motion.div>
            <motion.div
              className="flex flex-col gap-6 rounded-3xl p-8 md:p-10"
              style={{ background: CLR_PRI }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h3 style={{ fontFamily: H_FONT, fontSize: 'clamp(1.25rem,1.0986rem + 0.6727vw,1.6663rem)', fontWeight: 700, lineHeight: 1.2, color: CLR_SEC }}>
                Make an appointment and step towards your perfect smile!
              </h3>
              <p style={{ color: `${CLR_SEC}b3`, fontSize: 'clamp(1rem,0.9091rem + 0.404vw,1.25rem)' }}>
                Our team is ready to guide you from your first consultation to your final stunning result. No stress, no wait — just exceptional care.
              </p>
              <a
                href="#contact"
                onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: CLR_SEC,
                  color: CLR_PRI,
                  borderRadius: '9999px',
                  padding: '14px 36px',
                  fontFamily: H_FONT,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  alignSelf: 'flex-start',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#c8e3c9')}
                onMouseOut={e => (e.currentTarget.style.background = CLR_SEC)}
              >
                Book a Consultation
              </a>
            </motion.div>
          </div>
        </div>
      </div>

    </section>
  );
}
