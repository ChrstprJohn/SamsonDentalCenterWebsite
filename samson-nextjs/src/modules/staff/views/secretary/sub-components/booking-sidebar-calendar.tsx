'use client';

import { Calendar } from '@/components/ui/calendar';
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar';

interface BookingSidebarCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function BookingSidebarCalendar({
  selectedDate,
  onSelectDate,
}: BookingSidebarCalendarProps) {
  const date = selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined;

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              onSelectDate(`${y}-${m}-${day}`);
            }
          }}

          className="[&_[role=gridcell]]:w-[33px] [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
