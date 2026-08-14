import React from 'react';
import Link from 'next/link';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';

export interface OverviewUpcomingItem {
  id: string;
  name: string;
  time: string;
  service: string;
  status: string;
}

interface OverviewUpcomingCardProps {
  items: OverviewUpcomingItem[];
  total: number;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Scheduled',
  RESCHEDULE_REQUESTED: 'Reschedule',
  CHECKED_IN: 'Checked in',
};

export function OverviewUpcomingCard({ items, total }: OverviewUpcomingCardProps) {
  return (
    <Card className="border-card-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-5 pt-5 pb-0">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <CalendarClock className="size-4 text-primary-start" /> Upcoming Today
          <span className="rounded-full bg-primary-start/10 px-2 py-0.5 text-[10px] font-bold text-primary-start">
            {total}
          </span>
        </CardTitle>
        <CardAction>
          <Link
            href="/secretary-v2/appointments"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            See all <ChevronRight className="size-3" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5 pt-4 pb-5">
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs text-text-muted border border-dashed border-card-border rounded-xl">
            No appointments scheduled for today.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3 border border-card-border/40 rounded-xl hover:bg-secondary-bg/40 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                  <span className="text-[11px] text-text-muted">
                    {item.time} • {item.service}
                  </span>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border border-card-border bg-card text-text-secondary">
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}