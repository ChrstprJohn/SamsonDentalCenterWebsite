'use client';

import React from 'react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 px-6 border-t border-card-border bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <span className="text-xs uppercase font-bold tracking-widest text-accent-blue-text">About Samson Dental</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary leading-tight">
            A Higher Standard of Dental Care
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            At Samson Dental Center, our focus is delivering elite-level clinical dentistry within a relaxing, premium setting. Our practitioners stay at the absolute forefront of surgical, cosmetic, and diagnostic dentistry techniques.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col gap-2 p-5 rounded-2xl border border-card-border bg-card">
              <span className="text-3xl font-extrabold text-accent-blue-text">99.8%</span>
              <span className="text-xs font-semibold text-text-muted">Patient Satisfaction</span>
            </div>
            <div className="flex flex-col gap-2 p-5 rounded-2xl border border-card-border bg-card">
              <span className="text-3xl font-extrabold text-accent-blue-text">15+</span>
              <span className="text-xs font-semibold text-text-muted">Years Active Experience</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-8">
          <h3 className="text-xl font-bold text-text-primary">Our Core Dental Philosophies</h3>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-blue-bg flex items-center justify-center text-lg text-accent-blue-text">🛡️</div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">State-of-the-Art Precision</h4>
              <p className="text-xs text-text-secondary leading-relaxed">We utilize ultra-precise diagnostic models, standard intra-oral scanners, and atomic holding parameters to minimize error.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-blue-bg flex items-center justify-center text-lg text-accent-blue-text">🤍</div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Relaxed Comfort Architecture</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Every operatory is crafted around sensory relaxation to secure absolute peace during active procedures.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
