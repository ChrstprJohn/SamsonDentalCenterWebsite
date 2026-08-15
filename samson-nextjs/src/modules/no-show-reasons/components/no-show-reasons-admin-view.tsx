'use client';

import React, { useTransition } from 'react';
import { Trash2, CalendarX2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';
import { formatShortDate } from '@/shared/utils/date.util';
import { deleteNoShowReasonAction } from '../actions/delete-no-show-reason.action';
import type { NoShowReasonListItem } from '../queries/get-no-show-reasons.query';

export function NoShowReasonsAdminView({ initialReasons }: { initialReasons: NoShowReasonListItem[] }) {
  const [reasons, setReasons] = React.useState(initialReasons);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteNoShowReasonAction(id);
      if (!result.success) {
        addToast(result.error, 'error');
        return;
      }
      setReasons((current) => current.filter((r) => r.id !== id));
      addToast('Reason deleted.', 'success');
    });
  };

  if (reasons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20 min-h-[300px] gap-2">
        <span className="text-3xl">📅</span>
        <p className="text-sm font-semibold text-text-primary">No no-show reasons yet</p>
        <p className="text-xs text-text-muted">
          Patient reasons will appear here once submitted via the no-show link.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reasons.map((item) => (
        <div key={item.id} className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarX2 className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-sm text-text-primary">{item.patientName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(item.id)}
              aria-label="Delete reason"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{item.reason}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
            {item.serviceName && <span>Service: {item.serviceName}</span>}
            {item.appointmentDate && <span>Appointment: {formatShortDate(item.appointmentDate)}</span>}
            <span>Submitted: {formatShortDate(item.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}