'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContactCalendarProps {
  currentMonth: Date;
  availableDates: string[];
  targetDate: string;
  isLoadingDays: boolean;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: string) => void;
}

export function ContactCalendar({
  currentMonth,
  availableDates,
  targetDate,
  isLoadingDays,
  onMonthChange,
  onDateSelect,
}: ContactCalendarProps) {
  const blanks = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  return (
    <div className="p-5 bg-white border border-gray-200/80 shadow-2xs rounded-none">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 font-sans">
        <button
          type="button"
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-1.5 hover:bg-[#D94E4E]/10 transition-colors text-gray-600 hover:text-[#D94E4E] cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="font-sans text-base sm:text-lg font-normal tracking-[-0.04em] text-[#141515]">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-1.5 hover:bg-[#D94E4E]/10 transition-colors text-gray-600 hover:text-[#D94E4E] cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {isLoadingDays ? (
        <div className="text-center text-xs text-gray-400 py-12 animate-pulse font-sans">Scanning available dates...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-sans">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
            <div key={`${dayName}-${idx}`} className="text-xs font-semibold text-gray-700 py-1.5">
              {dayName}
            </div>
          ))}
          {Array.from({ length: blanks }).map((_, idx) => <div key={`blank-${idx}`} className="h-10 sm:h-12" />)}
          {Array.from({ length: days }).map((_, idx) => {
            const day = idx + 1;
            const date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isAvailable = availableDates.includes(date);
            const isSelected = targetDate === date;
            return (
              <button
                key={date}
                type="button"
                disabled={!isAvailable}
                onClick={() => onDateSelect(date)}
                className={`h-10 sm:h-12 flex items-center justify-center font-josefin text-xs sm:text-sm transition-all border rounded-none ${
                  isSelected
                    ? 'bg-[#1D1E1E] text-white border-[#1D1E1E] font-semibold shadow-xs'
                    : isAvailable
                    ? 'text-[#141515] bg-white border-gray-200 hover:border-[#1D1E1E] hover:bg-gray-50 cursor-pointer font-normal'
                    : 'text-gray-300 border-transparent bg-gray-50/50 opacity-40 cursor-not-allowed'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
