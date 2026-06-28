'use client';

import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';

export function AppointmentStatusHistory({ appointment, activeTab }: { appointment: AppointmentDto; activeTab: 'upcoming' | 'history' }) {
  return (
    <>
      <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3">
        <span className="text-xs font-bold text-text-secondary">Immutable Status History Logs</span>
        {!appointment.statusHistory || appointment.statusHistory.length === 0 ? (
          <span className="text-[11px] text-text-muted italic">No state changes recorded yet.</span>
        ) : (
          <div className="flex flex-col gap-3">
            {appointment.statusHistory.map((history) => (
              <div key={history.id} className="border border-card-border/40 rounded-xl p-2.5 bg-secondary-bg/10 flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold text-text-primary">{history.previousStatus ? `${history.previousStatus} -> ` : ''}{history.newStatus}</span>
                  <span className="text-text-muted">{new Date(history.createdAt).toLocaleDateString()}</span>
                </div>
                {history.reason && <p className="text-[11px] text-text-secondary leading-relaxed">&quot;{history.reason}&quot;</p>}
                <span className="text-[9px] text-text-muted text-right">- {history.actorRole}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {activeTab === 'history' && appointment.status === 'COMPLETED' && (
        <div className="border-t border-card-border/80 pt-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-text-secondary">Invoice Receipt</span>
          <div className="border border-green-500/25 bg-green-500/5 rounded-xl p-3 text-xs flex flex-col gap-1">
            <div className="flex justify-between"><span className="text-text-muted">Payment status:</span><span className="font-bold text-green-500 uppercase">Paid & Finalized</span></div>
            <a href="/secretary/invoices" className="text-primary hover:underline font-semibold mt-1 inline-block text-[11px]">View Invoice Directory</a>
          </div>
        </div>
      )}
    </>
  );
}
