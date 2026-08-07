'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export interface NativeTimePopoverPickerProps {
  value: string;
  onChange: (timeString: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /**
   * List of available 2-digit hour strings (12-hour format, e.g. ['08', '09', '10', '11', '12', '01', '02', '03', '04'])
   */
  availableHours?: string[];
}

export function NativeTimePopoverPicker({
  value,
  onChange,
  placeholder = 'Select Preferred Time...',
  className = '',
  disabled = false,
  availableHours = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05'],
}: NativeTimePopoverPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract initial values or fallback to 08:00 AM
  const parseValue = (val: string): { hour: string; min: string; period: 'AM' | 'PM' } => {
    if (!val) return { hour: '08', min: '00', period: 'AM' };
    const parts = val.split(' ');
    const period: 'AM' | 'PM' = parts[1]?.toUpperCase() === 'PM' ? 'PM' : 'AM';
    const timeParts = parts[0]?.split(':') || ['08', '00'];
    return {
      hour: timeParts[0] || '08',
      min: timeParts[1] || '00',
      period,
    };
  };

  const initialVal = parseValue(value);
  const [selectedHour, setSelectedHour] = useState(initialVal.hour);
  const [selectedMin, setSelectedMin] = useState(initialVal.min);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initialVal.period);

  // Sync internal state if prop value changes externally
  useEffect(() => {
    if (value) {
      const parsed = parseValue(value);
      setSelectedHour(parsed.hour);
      setSelectedMin(parsed.min);
      setSelectedPeriod(parsed.period as 'AM' | 'PM');
    }
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 1-minute interval list (00 to 59)
  const fullMinuteList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Toggle popover with smart top/bottom position calculation
  const togglePopover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 260) {
        setPopoverPosition('top');
      } else {
        setPopoverPosition('bottom');
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSelectTime = (h: string, m: string, p: 'AM' | 'PM') => {
    const formatted = `${h}:${m} ${p}`;
    onChange(formatted);
  };

  const displayTime = value || '08:00 AM';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Input Field (Defaults to fixed 08:00 AM if empty) */}
      <div
        onClick={togglePopover}
        className={`w-full bg-white border border-[#E4E4DC] px-4 py-3 text-xs sm:text-sm font-semibold text-gray-800 flex items-center justify-between cursor-pointer hover:border-[#D94E4E] transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
        }`}
      >
        <span className="text-gray-900 font-extrabold">
          {displayTime}
        </span>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>

      {/* 3-Column Native Popover Dropdown (No header, clean look) */}
      {isOpen && (
        <div
          className={`absolute left-0 w-44 bg-white border border-gray-300 shadow-xl z-30 p-2 font-sans rounded-none ${
            popoverPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {/* 3 Columns Grid: Hour | Minute | AM/PM */}
          <div className="grid grid-cols-3 gap-1">
            {/* 1. Hour Column (Fixed List starting at 08 AM) */}
            <div
              data-lenis-prevent="true"
              className="h-[238px] overflow-y-auto flex flex-col gap-1 pr-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {availableHours.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setSelectedHour(h);
                      let newP = selectedPeriod;
                      if (['08', '09', '10', '11'].includes(h)) newP = 'AM';
                      else newP = 'PM';
                      setSelectedPeriod(newP);
                      handleSelectTime(h, selectedMin, newP);
                    }}
                    className={`w-full h-8 shrink-0 flex items-center justify-center text-sm font-semibold rounded-xs transition-colors ${
                      isSelected
                        ? 'bg-[#0075FF] text-white font-bold'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* 2. Minute Column (Fixed 1-Min Scroll 00-59) */}
            <div
              data-lenis-prevent="true"
              className="h-[238px] overflow-y-auto flex flex-col gap-1 pr-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {fullMinuteList.map((m) => {
                const isSelected = selectedMin === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMin(m);
                      handleSelectTime(selectedHour, m, selectedPeriod);
                    }}
                    className={`w-full h-8 shrink-0 flex items-center justify-center text-sm font-semibold rounded-xs transition-colors ${
                      isSelected
                        ? 'bg-[#0075FF] text-white font-bold'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            {/* 3. AM / PM Column */}
            <div
              data-lenis-prevent="true"
              className="h-[238px] overflow-y-auto flex flex-col gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {['AM', 'PM'].map((p) => {
                const isSelected = selectedPeriod === p;
                const isDisabled =
                  (p === 'AM' && ['12', '01', '02', '03', '04', '05'].includes(selectedHour)) ||
                  (p === 'PM' && ['08', '09', '10', '11'].includes(selectedHour));

                return (
                  <button
                    key={p}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      const newP = p as 'AM' | 'PM';
                      setSelectedPeriod(newP);
                      handleSelectTime(selectedHour, selectedMin, newP);
                    }}
                    className={`w-full h-8 shrink-0 flex items-center justify-center text-sm font-semibold lowercase rounded-xs transition-colors ${
                      isSelected
                        ? 'bg-[#0075FF] text-white font-bold'
                        : isDisabled
                        ? 'text-gray-300 cursor-not-allowed opacity-40'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {p.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
