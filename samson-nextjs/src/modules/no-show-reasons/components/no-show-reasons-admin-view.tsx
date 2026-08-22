'use client';

import React, { useTransition } from 'react';
import { Trash2, CalendarX2, ExternalLink, ChevronLeft, ChevronRight, MessageSquareQuote, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';
import { formatShortDate, formatTimeAgo } from '@/shared/utils/date.util';
import { deleteNoShowReasonAction } from '../actions/delete-no-show-reason.action';
import type { NoShowReasonListItem } from '../queries/get-no-show-reasons.query';

const PAGE_SIZE = 12;

export function NoShowReasonsAdminView({ initialReasons }: { initialReasons: NoShowReasonListItem[] }) {
  const [reasons, setReasons] = React.useState(initialReasons);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(reasons.length / PAGE_SIZE));
  const pageItems = reasons.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteNoShowReasonAction(id);
      if (!result.success) {
        return addToast(result.error, 'error');
      }
      setReasons((current) => {
        const next = current.filter((r) => r.id !== id);
        setPageIndex((cur) => Math.min(cur, Math.max(0, Math.ceil(next.length / PAGE_SIZE) - 1)));
        return next;
      });
      addToast('Reason deleted.', 'success');
    });
  };

  if (reasons.length === 0) {
    return <EmptyState title="No no-show reasons yet" message="Patient reasons will appear here once submitted via the missed-appointment link." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 border-b border-card-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#1D1E1E] px-3 py-1 text-xs font-semibold text-white">
            Total Submissions: {reasons.length}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((item) => (
          <article
            key={item.id}
            className="flex min-h-[260px] flex-col justify-between rounded-xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D94E4E]/30 hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-[#FDF0F0] text-[#D94E4E]">
                    <UserRound className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#1D1E1E]">{item.patientName}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground" suppressHydrationWarning>
                      {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">
                  Missed Visit
                </span>
              </div>
              <MessageSquareQuote className="mb-3 size-4 text-[#D94E4E]/70" />
              <p className="line-clamp-5 text-sm leading-relaxed text-gray-700 italic">
                &ldquo;{item.reason || 'No written reason was provided.'}&rdquo;
              </p>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[11px] text-muted-foreground">
                  {[item.serviceName, item.appointmentDate ? `Visit: ${formatShortDate(item.appointmentDate)}` : null]
                    .filter(Boolean)
                    .join(' · ') || 'Missed appointment'}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/secretary-v2/appointments?appointmentId=${item.appointmentId}`)}
                    className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="View Appointment"
                  >
                    <ExternalLink className="size-3.5" /> Appointment
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                    aria-label="Delete reason"
                    title="Delete reason"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-card-border/50 pt-4">
          <span className="text-xs text-muted-foreground">
            Page {pageIndex + 1} of {totalPages} · {reasons.length} reason{reasons.length === 1 ? '' : 's'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((page) => page - 1)}
              disabled={pageIndex === 0}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" /> Newer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((page) => page + 1)}
              disabled={pageIndex >= totalPages - 1}
              className="h-8 gap-1 text-xs"
            >
              Older <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-14 text-center">
      <CalendarX2 className="mb-3 size-5 text-muted-foreground/60" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
    </div>
  );
}