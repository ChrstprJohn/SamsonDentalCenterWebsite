'use client';

import { Quote } from 'lucide-react';

interface TestimonialItem {
  name: string;
  pathway: string;
  text: string;
  rating: string;
  avatar: string;
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
    <div className="w-[260px] sm:w-[320px] shrink-0 mx-2.5 flex flex-col justify-between border border-gray-200/60 bg-[#F9F9F6] p-5 sm:p-6 rounded-none hover:border-[#D94E4E]/30 transition-all duration-300 font-sans whitespace-normal cursor-pointer shadow-sm">
      <div>
        <div className="text-[#D94E4E] mb-2.5 opacity-80">
          <Quote className="w-3.5 h-3.5 rotate-180" />
        </div>
        <p className="text-gray-600 font-light text-xs sm:text-[13px] leading-relaxed italic">
          &ldquo;{item.text}&rdquo;
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between text-[11px]">
        <div className="flex items-center">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mr-2.5 border border-gray-100"
          />
          <div>
            <h4 className="text-[#1D1E1E] font-semibold text-xs sm:text-[13px] leading-none">{item.name}</h4>
            <p className="text-gray-400 font-medium text-[8px] sm:text-[9px] tracking-wider uppercase mt-1 leading-none">
              {item.pathway}
            </p>
          </div>
        </div>
        <span className="text-[#D94E4E] font-semibold tracking-wider text-[9px] sm:text-[10px]">
          {item.rating}
        </span>
      </div>
    </div>
  );
}
