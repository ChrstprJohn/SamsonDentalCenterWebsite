'use client';

import { useSecretaryPendingRequests } from '../../hooks/secretary/use-secretary-pending-requests';
import { PendingRequestList } from './sub-components/pending-request-list';
import { PendingRequestDetailPane } from './sub-components/pending-request-detail-pane';

export function SecretaryPendingRequestsView() {
  const view = useSecretaryPendingRequests();

  return (
    <div className="flex flex-col gap-8 flex-1 min-h-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointment Requests</h1>
        <p className="text-xs text-text-muted">Review patient self-bookings and choose to Approve, Reject, or Displace requests.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        <PendingRequestList
          appointments={view.appointments}
          selectedAppointmentId={view.selectedAppointmentId}
          isLoading={view.isLoading}
          onSelect={view.selectAppointment}
        />
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col justify-between overflow-hidden">
          <PendingRequestDetailPane view={view} />
        </div>
      </div>
    </div>
  );
}
