import React from 'react';
import Link from 'next/link';
import { Send, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';

interface OverviewDeliveryCardProps {
  sent: number;
  total: number;
  failed: number;
  pending: number;
}

export function OverviewDeliveryCard({ sent, total, failed, pending }: OverviewDeliveryCardProps) {
  return (
    <Card className="border-card-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-0">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <Send className="size-4 text-primary-start" /> Deliveries Today
        </CardTitle>
        <CardAction>
          <Link
            href="/secretary-v2/delivery-logs"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            Logs <ChevronRight className="size-3" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5 pt-4 pb-5">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-black text-text-primary leading-none">{sent}</span>
          <span className="text-[11px] text-text-muted pb-0.5">of {total} sent</span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-secondary-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: total > 0 ? `${(sent / total) * 100}%` : '0%' }}
          />
        </div>

        <div className="flex gap-2 text-[10px] font-semibold">
          {failed > 0 && <span className="text-rose-500">{failed} failed</span>}
          {pending > 0 && <span className="text-amber-500">{pending} pending</span>}
          {failed === 0 && pending === 0 && (
            <span className="text-emerald-500">All delivered</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}