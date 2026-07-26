'use client';

import { Search, ChevronDown } from 'lucide-react';

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
    <div className="p-4 border-b border-border shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base font-medium text-foreground">Check-In & Out</h1>
          <p className="text-xs text-muted-foreground">{formatted}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient, service, doctor..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-[200px] h-8 pl-7 pr-3 text-xs bg-background border border-border rounded-md text-foreground outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="relative">
            <select
              value={filterDoctorId}
              onChange={(e) => onDoctorFilterChange(e.target.value)}
              className="appearance-none w-[130px] h-8 pl-3 pr-7 text-xs bg-background border border-border rounded-md text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer"
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
