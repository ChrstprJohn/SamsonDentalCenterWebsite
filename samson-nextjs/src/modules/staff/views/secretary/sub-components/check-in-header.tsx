'use client';

import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckInHeader({
  todayStr,
  stats,
  bypassWindow,
  setBypassWindow,
}: {
  todayStr: string;
  stats: any;
  bypassWindow?: boolean;
  setBypassWindow?: (val: boolean) => void;
}) {
  const cards = [
    ['Checked In', stats.totalCheckedInToday, 'text-indigo-500'],
    ['Pending Out', stats.pendingCheckout, 'text-amber-500'],
    ['Completed', stats.completedToday, 'text-emerald-500'],
    ['No-Shows', stats.noShowCountToday || 0, 'text-red-500'],
  ];

  return (
    <div className="relative overflow-hidden bg-card/65 backdrop-blur-md border border-card-border/60 rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Patient Flows</h1>
        </div>
        <p className="text-xs text-text-muted">
          Operation desk board for today: <strong className="text-text-secondary">{todayStr}</strong>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-end md:items-center gap-4 w-full md:w-auto">
        {setBypassWindow && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setBypassWindow(!bypassWindow)}
            className={`text-xs h-9 px-3 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
              bypassWindow
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-xs'
                : 'bg-secondary-bg text-text-secondary border-card-border hover:text-text-primary'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${bypassWindow ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{bypassWindow ? 'Window Bypassed (Testing)' : 'Enable Dev Check-In'}</span>
          </Button>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
          {cards.map(([label, value, color]) => (
            <div key={label as string} className="bg-secondary-bg/40 border border-card-border/30 rounded-2xl px-4 py-2 flex flex-col gap-0.5 min-w-[100px]">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</span>
              <span className={`text-base font-black ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
