'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export interface NativeTimePopoverPickerProps {
  value: string;
  onChange: (timeString: string) => void;
  placeholder?: string;
  className?: string;
  /** Additional custom class for the input trigger box (e.g. rounded-xl, border-card-border). */
  triggerClassName?: string;
  disabled?: boolean;
  /** Earliest selectable time in 24-hour HH:MM format (inclusive). */
  minTime?: string;
  /** Latest selectable time in 24-hour HH:MM format (inclusive). */
  maxTime?: string;
  /** Time ranges in 24-hour HH:MM format that cannot be selected. */
  unavailableRanges?: Array<{ start: string; end: string }>;
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
  triggerClassName = '',
  disabled = false,
  availableHours,
  minTime = '00:00',
  maxTime = '24:00',
  unavailableRanges = [],
}: NativeTimePopoverPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<'top' | 'bottom'>('bottom');
  const [popoverLeft, setPopoverLeft] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert 12-hour (h, m, p) to 24-hour HH:MM format
  const to24Hour = (h: string, m: string, p: 'AM' | 'PM'): string => {
    let hourNum = parseInt(h, 10);
    if (p === 'PM' && hourNum < 12) hourNum += 12;
    if (p === 'AM' && hourNum === 12) hourNum = 0;
    return `${String(hourNum).padStart(2, '0')}:${m}`;
  };

  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Boundary times (open, close, break start/end) stay pickable at :00 even when
  // the hour sits in a break or on the exclusive close edge (e.g. 12:00 during lunch, 17:00 at close)
  const boundaryMinutes = new Set<number>();
  [minTime, maxTime, ...unavailableRanges.flatMap((r) => [r.start, r.end])].forEach((t) => {
    if (t) boundaryMinutes.add(toMinutes(t));
  });

  const isAvailable = (time: string) => {
    const minutes = toMinutes(time);
    if (minutes < toMinutes(minTime) || minutes > toMinutes(maxTime)) return false;
    if (boundaryMinutes.has(minutes)) return true;
    return !unavailableRanges.some(({ start, end }) => minutes >= toMinutes(start) && minutes < toMinutes(end));
  };

  // Convert any value (24-hour "HH:MM" or 12-hour "HH:MM AM/PM") to display 12-hour label
  const getDisplayLabel = (val: string): string => {
    if (!val) return placeholder;
    if (val.includes('AM') || val.includes('PM')) return val;
    const [hStr, mStr] = val.split(':');
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return val;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${mStr || '00'} ${period}`;
  };

  // Extract initial values or fallback to 08:00 AM
  const parseValue = (val: string): { hour: string; min: string; period: 'AM' | 'PM' } => {
    if (!val) return { hour: '08', min: '00', period: 'AM' };
    if (val.includes('AM') || val.includes('PM')) {
      const parts = val.split(' ');
      const period: 'AM' | 'PM' = parts[1]?.toUpperCase() === 'PM' ? 'PM' : 'AM';
      const timeParts = parts[0]?.split(':') || ['08', '00'];
      return {
        hour: timeParts[0] || '08',
        min: timeParts[1] || '00',
        period,
      };
    }
    const [hStr, mStr] = val.split(':');
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return { hour: '08', min: '00', period: 'AM' };
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return {
      hour: String(h12).padStart(2, '0'),
      min: mStr || '00',
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
  // Chronological 12-hour arrangement starting with early clinic morning hours (08, 09, 10, 11, 12, 01, 02, 03, 04, 05, 06, 07)
  const defaultHourOrder = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07'];
  const allHours = availableHours ?? defaultHourOrder;
  const periods: Array<'AM' | 'PM'> = ['AM', 'PM'];
  const hasAvailableMinute = (hour: string, period: 'AM' | 'PM', minute?: string) =>
    minute
      ? isAvailable(to24Hour(hour, minute, period))
      : fullMinuteList.some((candidate) => isAvailable(to24Hour(hour, candidate, period)));
  const hasAvailableHour = (hour: string) => periods.some((period) => hasAvailableMinute(hour, period));

  const selectFirstAvailableForHour = (hour: string) => {
    const candidates = periods.flatMap((period) =>
      fullMinuteList
        .filter((minute) => isAvailable(to24Hour(hour, minute, period)))
        .map((minute) => ({ minute, period }))
    );
    // Default to '00' minute if available, otherwise match current minute or first valid minute candidate
    const zeroMinCandidate = candidates.find(({ minute }) => minute === '00');
    const matchingCurrent = candidates.find(({ minute, period }) => minute === selectedMin && period === selectedPeriod);
    const next = zeroMinCandidate ?? matchingCurrent ?? candidates[0];
    if (!next) return;
    setSelectedHour(hour);
    setSelectedMin(next.minute);
    setSelectedPeriod(next.period);
    handleSelectTime(hour, next.minute, next.period);
  };

  const handleSelectTime = (h: string, m: string, p: 'AM' | 'PM') => {
    const time24 = to24Hour(h, m, p);
    onChange(time24);
  };

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
      // Clamp popover within viewport horizontally (container-relative for absolute positioning)
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const viewportLeft = Math.min(Math.max(rect.left, 8), document.documentElement.clientWidth - 176 - 16);
        setPopoverLeft(viewportLeft - containerRect.left);
      }

      // If no value is selected yet, pre-select the first available hour and default to 00 minute
      if (!value) {
        const firstAvailHour = allHours.find(hasAvailableHour);
        if (firstAvailHour) {
          const candidates = periods.flatMap((period) =>
            fullMinuteList
              .filter((minute) => isAvailable(to24Hour(firstAvailHour, minute, period)))
              .map((minute) => ({ minute, period }))
          );
          const zeroMin = candidates.find(({ minute }) => minute === '00') ?? candidates[0];
          if (zeroMin) {
            setSelectedHour(firstAvailHour);
            setSelectedMin(zeroMin.minute);
            setSelectedPeriod(zeroMin.period);
          }
        }
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Input Field */}
      <div
        onClick={togglePopover}
        className={`w-full bg-card border border-card-border px-4 py-2.5 ${triggerClassName || 'rounded-xl'} text-xs sm:text-sm font-normal flex items-center justify-between cursor-pointer hover:border-primary-ring transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
        }`}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground font-medium'}>
          {getDisplayLabel(value)}
        </span>
        <Clock className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* 3-Column Native Popover Dropdown (No header, clean look) */}
      {isOpen && (
        <div
          style={{ left: popoverLeft ?? 0 }}
          className={`absolute w-44 bg-white border border-gray-300 shadow-xl z-30 p-2 font-sans rounded-none ${
            popoverPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {/* 3 Columns Grid: Hour | Minute | AM/PM */}
          <div className="grid grid-cols-3 gap-1">
            {/* 1. Hour Column (Available hours 08 AM to 04 PM) */}
            <div
              data-lenis-prevent="true"
              className="h-[238px] overflow-y-auto flex flex-col gap-1 pr-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {allHours.filter(hasAvailableHour).map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => selectFirstAvailableForHour(h)}
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

            {/* 2. Minute Column (Any minute 00 to 59 allowed for 04 PM) */}
            <div
              data-lenis-prevent="true"
              className="h-[238px] overflow-y-auto flex flex-col gap-1 pr-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {fullMinuteList.filter((m) => hasAvailableMinute(selectedHour, selectedPeriod, m)).map((m) => {
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
              {periods.map((p) => {
                const isSelected = selectedPeriod === p;
                const isDisabled = !hasAvailableMinute(selectedHour, p);

                return (
                  <button
                    key={p}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      const newP = p as 'AM' | 'PM';
                      const minute = hasAvailableMinute(selectedHour, newP, selectedMin)
                        ? selectedMin
                        : fullMinuteList.find((candidate) => hasAvailableMinute(selectedHour, newP, candidate));
                      if (!minute) return;
                      setSelectedMin(minute);
                      setSelectedPeriod(newP);
                      handleSelectTime(selectedHour, minute, newP);
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
