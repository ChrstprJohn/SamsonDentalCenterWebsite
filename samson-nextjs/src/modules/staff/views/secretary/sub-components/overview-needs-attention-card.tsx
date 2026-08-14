import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';

export interface OverviewAttentionItem {
  id: string;
  name: string;
  time: string;
}

interface OverviewNeedsAttentionCardProps {
  items: OverviewAttentionItem[];
  total: number;
}

export function OverviewNeedsAttentionCard({ items, total }: OverviewNeedsAttentionCardProps) {
  return (
    <Card className="border-red-500/30 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-5 pt-5 pb-0">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <AlertTriangle className="size-4 text-red-500" /> Needs Attention
          {total > 0 && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
              {total}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <Link
            href="/secretary-v2/appointments"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            View all <ChevronRight className="size-3" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5 pt-4 pb-5">
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs text-text-muted border border-dashed border-card-border rounded-xl">
            No unresolved no-shows.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3 border border-card-border/40 rounded-xl bg-red-500/[0.03]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                  <span className="text-[11px] text-text-muted">{item.time}</span>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border border-red-500/20 bg-red-500/10 text-red-500">
                  No-show
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}