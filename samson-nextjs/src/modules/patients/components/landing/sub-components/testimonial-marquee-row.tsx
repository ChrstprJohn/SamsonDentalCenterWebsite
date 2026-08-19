'use client';

import { Quote, Star } from 'lucide-react';

export interface TestimonialItem {
  name: string;
  pathway: string;
  text: string;
  rating: number;
}

interface TestimonialMarqueeRowProps {
  items: TestimonialItem[];
  rowId: string;
  reverse?: boolean;
}

export function TestimonialMarqueeRow({ items, rowId, reverse = false }: TestimonialMarqueeRowProps) {
  return (
    <div className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
      {items.map((item, idx) => (
        <TestimonialCard key={`${rowId}-${idx}`} item={item} />
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="w-[330px] sm:w-[420px] shrink-0 mx-2.5 flex flex-col justify-between border border-gray-200/60 bg-white p-6 sm:p-7 rounded-none hover:border-[#D94E4E]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-josefin whitespace-normal cursor-pointer shadow-md">
      <div>
        <div className="text-[#D94E4E] mb-3 opacity-80">
          <Quote className="w-4 h-4 rotate-180" />
        </div>
        <p className="text-gray-700 font-normal text-[clamp(13px,0.3vw+12px,15px)] leading-[1.65] italic">
          &ldquo;{item.text}&rdquo;
        </p>
      </div>

      <div className="mt-5 pt-5 border-t border-gray-200/50 flex items-center justify-between text-[clamp(13px,0.3vw+12px,15px)]">
        <div className="flex items-center">
          <div className="flex w-8 h-8 sm:w-9 sm:h-9 shrink-0 mr-3 items-center justify-center rounded-full border border-gray-100 bg-[#FDF0F0] text-[11px] font-semibold text-[#D94E4E]">
            {item.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h4 className="text-[#1D1E1E] font-semibold text-[clamp(13px,0.3vw+12px,15px)] leading-none">{item.name}</h4>
            <p className="text-gray-400 font-medium text-[clamp(10px,0.2vw+10px,12px)] mt-1 leading-none">
              {item.pathway}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-center">
          <span className="text-[#1D1E1E] font-semibold text-[clamp(11px,0.2vw+10px,13px)] leading-none">{item.rating.toFixed(1)}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 -mt-px ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
