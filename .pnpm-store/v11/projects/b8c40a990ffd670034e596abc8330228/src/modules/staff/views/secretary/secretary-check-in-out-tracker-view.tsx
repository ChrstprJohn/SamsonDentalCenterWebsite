'use client';

import { AlertCircle } from 'lucide-react';
import { useSecretaryCheckInOutTracker } from '../../hooks/secretary/use-secretary-check-in-out-tracker';
import { CheckInBoard } from './sub-components/check-in-board';
import { CheckInCheckoutModal } from './sub-components/check-in-checkout-modal';
import { CheckInDetailsModal } from './sub-components/check-in-details-modal';
import { CheckInHeader } from './sub-components/check-in-header';
import { CheckInLoading } from './sub-components/check-in-loading';
import { CheckInRescheduleModal } from './sub-components/check-in-reschedule-modal';

export function SecretaryCheckInOutTrackerView() {
  const view = useSecretaryCheckInOutTracker();

  if (view.isLoading) return <CheckInLoading />;

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-[1600px] mx-auto p-4 md:p-6">
      <CheckInHeader todayStr={view.todayStr} stats={view.stats} />
      {view.errorMessage && (
        <div className="p-4 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{view.errorMessage}</span>
        </div>
      )}
      <CheckInBoard view={view} />
      <CheckInCheckoutModal view={view} />
      <CheckInRescheduleModal view={view} />
      <CheckInDetailsModal view={view} />
    </div>
  );
}
