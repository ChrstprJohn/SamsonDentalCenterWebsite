import React from 'react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 px-6 border-t border-slate-105 dark:border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-500 dark:text-blue-400">About Samson Dental</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            A Higher Standard of Dental Care
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            At Samson Dental Center, our focus is delivering elite-level clinical dentistry within a relaxing, premium setting. Our practitioners stay at the absolute forefront of surgical, cosmetic, and diagnostic dentistry techniques.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/30">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-450">99.8%</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patient Satisfaction</span>
            </div>
            <div className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/30">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-450">15+</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Years Active Experience</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Our Core Dental Philosophies</h3>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg text-blue-500">🛡️</div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1">State-of-the-Art Precision</h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">We utilize ultra-precise diagnostic models, standard intra-oral scanners, and atomic holding parameters to minimize error.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg text-blue-500">🤍</div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Relaxed Comfort Architecture</h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">Every operatory is crafted around sensory relaxation to secure absolute peace during active procedures.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
