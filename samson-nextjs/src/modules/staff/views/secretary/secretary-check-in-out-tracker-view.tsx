'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useSecretaryCheckInOutTracker } from '../../hooks/secretary/use-secretary-check-in-out-tracker';
import { CheckInBoard } from './sub-components/check-in-board';
import { CheckInDetailPane } from './sub-components/check-in-detail-pane';
import { CheckInHeader } from './sub-components/check-in-header';
import { CheckInLoading } from './sub-components/check-in-loading';

export function SecretaryCheckInOutTrackerView() {
  const view = useSecretaryCheckInOutTracker();
  const [mobileView, setMobileView] = useState<'board' | 'detail'>('board');

  const hasSelection = !!(view.checkInAppt || view.checkoutAppt || view.viewAppt || view.resolveAppt || view.rescheduleAppt);

  const colMobile = (v: 'board' | 'detail') => (mobileView === v ? 'flex' : 'hidden');

  const openDetail = () => setMobileView('detail');
  const closeDetail = () => {
    view.setCheckInAppt(null);
    view.setCheckoutAppt(null);
    view.setViewAppt(null);
    view.setResolveAppt(null);
    view.setRescheduleAppt(null);
    setMobileView('board');
  };

  if (view.isLoading) return <CheckInLoading />;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
        <div className="shrink-0">
          <CheckInHeader todayStr={view.todayStr} />
          {view.errorMessage && (
            <div className="mx-4 mb-0 mt-3 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{view.errorMessage}</span>
            </div>
          )}
        </div>

        <div className={`flex-1 min-h-0 w-full overflow-hidden ${hasSelection ? 'lg:pr-0' : ''}`}>
          <div className={`h-full overflow-y-auto ${colMobile('board')} lg:block`}>
            <CheckInBoard view={view} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hasSelection && (
          <motion.div
            key="detail-pane"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className={`w-full lg:w-[350px] flex-col bg-sidebar border-l border-border min-h-0 overflow-hidden ${colMobile('detail')} lg:flex`}
          >
            <CheckInDetailPane view={view} onClose={closeDetail} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
