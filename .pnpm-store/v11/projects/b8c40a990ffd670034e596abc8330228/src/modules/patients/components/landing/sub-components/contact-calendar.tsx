'use client';

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
    <div className="p-4 bg-white border border-[#E4E4DC] rounded-none">
      <div className="flex justify-between items-center text-xs text-gray-900 mb-3 font-semibold bg-gray-50 p-2 border border-gray-100">
        <button type="button" onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="px-2 py-1 hover:bg-gray-100 font-bold">
          Prev
        </button>
        <div className="uppercase tracking-wider font-sans font-bold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="px-2 py-1 hover:bg-gray-100 font-bold">
          Next
        </button>
      </div>

      {isLoadingDays ? (
        <div className="text-center text-xs text-gray-400 py-6 animate-pulse font-sans">Scanning available dates...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayName, idx) => (
            <div key={`${dayName}-${idx}`} className="font-bold text-gray-400 py-1 font-sans">{dayName}</div>
          ))}
          {Array.from({ length: blanks }).map((_, idx) => <div key={`blank-${idx}`} className="py-2" />)}
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
                className={`py-2 text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#D94E4E] text-white border-[#D94E4E] shadow-sm font-bold'
                    : isAvailable
                    ? 'text-gray-900 bg-emerald-500/5 border-emerald-500/20 hover:bg-[#D94E4E]/5 hover:border-[#D94E4E]/50 cursor-pointer font-bold'
                    : 'text-gray-300 border-transparent opacity-30 cursor-not-allowed'
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
