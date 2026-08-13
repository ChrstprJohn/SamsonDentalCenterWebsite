'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctorId, setFilterDoctorId] = useState('');

  const hasSelection = !!(view.checkInAppt || view.noShowAppt || view.checkoutAppt || view.viewAppt || view.resolveAppt || view.rescheduleAppt);

  const colMobile = (v: 'board' | 'detail') => (mobileView === v ? 'flex' : 'hidden');

  const openDetail = () => setMobileView('detail');
  const closeDetail = () => {
    view.clearSelection();
    setMobileView('board');
  };

  const filteredColumns = useMemo(() => {
    const cols = view.columns;
    if (!searchTerm && !filterDoctorId) return cols;

    const q = searchTerm.toLowerCase().trim();

    const match = (appt: any) => {
      const name = `${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}`.toLowerCase();
      const service = (appt.service?.name || '').toLowerCase();
      const doctor = `dr. ${appt.doctor?.lastName || ''} ${appt.doctor?.firstName || ''}`.toLowerCase();
      return (!q || name.includes(q) || service.includes(q) || doctor.includes(q)) &&
             (!filterDoctorId || appt.doctorId === filterDoctorId);
    };

    return {
      approved: cols.approved.filter(match),
      noShow: cols.noShow.filter(match),
      checkedIn: cols.checkedIn.filter(match),
      completed: cols.completed.filter(match),
    };
  }, [view.columns, searchTerm, filterDoctorId]);

  // Deep link: /secretary-v2/check-in?openCheckout=... (treatment rendered notification) opens the
  // checkout pane for that appointment once today's board loads.
  // ponytail: only matches appointments on today's board; otherwise the board just shows.
  const deepLinkCheckoutRef = useRef(false);
  useEffect(() => {
    if (deepLinkCheckoutRef.current || view.isLoading) return;
    const id = new URLSearchParams(window.location.search).get('openCheckout');
    if (!id) return;
    deepLinkCheckoutRef.current = true;
    window.history.replaceState({}, '', window.location.pathname);
    const appointment = view.appointments.find((item) => item.id === id);
    if (appointment) {
      view.openCheckout(appointment);
      setMobileView('detail');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.isLoading, view.appointments]);

  if (view.isLoading) return <CheckInLoading />;

  const handleCardClick = (appointment: any) => {
    if (view.isPending) return;
    view.handleViewApptDetails(appointment);
    openDetail();
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
        <div className="shrink-0">
          <CheckInHeader
            todayStr={view.todayStr}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            doctors={view.doctorsList || []}
            filterDoctorId={filterDoctorId}
            onDoctorFilterChange={setFilterDoctorId}
          />
          {view.errorMessage && (
            <div className="mx-4 mb-0 mt-3 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{view.errorMessage}</span>
            </div>
          )}
        </div>

        <div className={`flex-1 min-h-0 h-full w-full overflow-hidden ${hasSelection ? 'lg:pr-0' : ''}`}>
          <div className={`h-full min-h-0 w-full overflow-x-auto ${hasSelection ? 'hidden lg:block' : 'block'}`}>
            <CheckInBoard view={{ ...view, handleViewApptDetails: handleCardClick }} columns={filteredColumns} />
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
            className="w-full lg:w-[350px] flex-col bg-sidebar border-l border-border min-h-0 overflow-hidden flex"
          >
            <CheckInDetailPane view={view} onClose={closeDetail} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
