'use client';

import { Search, ChevronDown } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function CheckInHeader({
  todayStr,
  searchTerm,
  onSearchChange,
  doctors,
  filterDoctorId,
  onDoctorFilterChange,
}: {
  todayStr: string;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  doctors: any[];
  filterDoctorId: string;
  onDoctorFilterChange: (v: string) => void;
}) {
  const formatted = todayStr
    ? new Date(todayStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="p-3 sm:p-4 border-b border-border shrink-0">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
            <h1 className="text-sm sm:text-base font-medium text-foreground whitespace-nowrap">Check-In & Out</h1>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block lg:block md:hidden">{formatted}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-[110px] sm:w-[140px] md:w-[150px] lg:w-[150px] xl:w-[260px] h-7 xl:h-8 pl-7 pr-2.5 text-xs bg-background border border-border rounded-md text-foreground outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="relative hidden sm:block">
            <select
              value={filterDoctorId}
              onChange={(e) => onDoctorFilterChange(e.target.value)}
              className="appearance-none w-[100px] md:w-[110px] lg:w-[110px] xl:w-[140px] h-7 xl:h-8 pl-3 pr-7 text-xs bg-background border border-border rounded-md text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">All Doctors</option>
              {doctors.map((d: any) => (
                <option key={d.id} value={d.id}>Dr. {d.lastName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/50 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
