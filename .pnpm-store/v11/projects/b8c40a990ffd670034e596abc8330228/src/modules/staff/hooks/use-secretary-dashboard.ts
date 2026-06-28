'use client';

import { useState } from 'react';
import { useToast } from '@/components/feedback/toast-container';

export interface PendingBooking {
  id: string;
  patientName: string;
  serviceName: string;
  date: string;
  time: string;
  familyGroupId?: string;
  relationship?: string;
}

export interface UpcomingAppointment {
  id: string;
  patientName: string;
  serviceName: string;
  date: string;
  time: string;
  doctorName: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED';
}

export interface DraftInvoice {
  id: string;
  patientName: string;
  serviceName: string;
  doctorName: string;
  basePrice: number;
  date: string;
}

export interface AuditRecord {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface EmailLog {
  timestamp: string;
  recipient: string;
  subject: string;
  status: 'SENT' | 'FAILED';
}

export const INITIAL_PENDING: PendingBooking[] = [
  { id: 'pb-1', patientName: 'John Samson', serviceName: 'Routine Dental Cleaning', date: '2026-06-18', time: '09:00 AM', familyGroupId: 'fam-samson', relationship: 'Self' },
  { id: 'pb-2', patientName: 'Jane Samson', serviceName: 'Routine Dental Cleaning', date: '2026-06-18', time: '09:45 AM', familyGroupId: 'fam-samson', relationship: 'Spouse' },
  { id: 'pb-3', patientName: 'Timmy Samson', serviceName: 'Orthodontic Consultation', date: '2026-06-18', time: '10:30 AM', familyGroupId: 'fam-samson', relationship: 'Child' },
  { id: 'pb-4', patientName: 'Alice Mercer', serviceName: 'Premium Dental Implants', date: '2026-06-20', time: '02:00 PM' },
];

export const INITIAL_UPCOMING: UpcomingAppointment[] = [
  { id: 'ua-1', patientName: 'Robert Vance', serviceName: 'Teeth Whitening (Laser)', date: '2026-06-12', time: '11:00 AM', doctorName: 'Dr. Sarah Samson', status: 'SCHEDULED' },
  { id: 'ua-2', patientName: 'Diana Prince', serviceName: 'Orthodontic Braces Fit', date: '2026-06-12', time: '01:30 PM', doctorName: 'Dr. Sarah Samson', status: 'CHECKED_IN' },
];

export const INITIAL_DRAFTS: DraftInvoice[] = [
  { id: 'di-1', patientName: 'Clark Kent', serviceName: 'Dental Crown Fitting', doctorName: 'Dr. Sarah Samson', basePrice: 450, date: '2026-05-31' },
  { id: 'di-2', patientName: 'Bruce Wayne', serviceName: 'Laser Bleaching (Laser)', doctorName: 'Dr. James Mercer', basePrice: 299, date: '2026-05-31' },
];

export const INITIAL_AUDITS: AuditRecord[] = [
  { timestamp: '2026-05-31 02:44 PM', action: 'BOOKING_APPROVED', actor: 'Secretary Staff', details: 'Approved reservation for Timmy Vance (Spouse) - Predefined: Roster schedule cleared.' },
  { timestamp: '2026-05-31 01:10 PM', action: 'APPOINTMENT_CANCELLED', actor: 'Patient Portal', details: 'Cancelled reservation by Clark Kent. Reason: Scheduling conflict.' },
];

export const INITIAL_EMAILS: EmailLog[] = [
  { timestamp: '2026-05-31 02:44 PM', recipient: 'timmy.vance@example.com', subject: 'Appointment Booking Approved!', status: 'SENT' },
  { timestamp: '2026-05-31 01:10 PM', recipient: 'clark.kent@dailyplanet.com', subject: 'Appointment Cancellation Receipt', status: 'SENT' },
];

export function calculateFinalPrice(basePrice: number, discount: number) {
  const final = basePrice - (basePrice * (discount / 100));
  return Math.max(0, parseFloat(final.toFixed(2)));
}

export function useSecretaryDashboard() {
  const [pendingQueue, setPendingQueue] = useState<PendingBooking[]>(INITIAL_PENDING);
  const [upcomingList, setUpcomingList] = useState<UpcomingAppointment[]>(INITIAL_UPCOMING);
  const [draftInvoices, setDraftInvoices] = useState<DraftInvoice[]>(INITIAL_DRAFTS);
  const [audits, setAudits] = useState<AuditRecord[]>(INITIAL_AUDITS);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(INITIAL_EMAILS);

  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [activePending, setActivePending] = useState<PendingBooking | null>(null);

  // Dialog overlays states
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveReason, setApproveReason] = useState('Clear roster space');

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Checkout modal states
  const [activeInvoice, setActiveInvoice] = useState<DraftInvoice | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'INSURANCE'>('CARD');
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);

  // Email search state
  const [emailSearch, setEmailSearch] = useState('');

  const { addToast } = useToast();

  const handlePendingSelect = (id: string) => {
    setSelectedPendingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idsToApprove = activePending ? [activePending.id] : selectedPendingIds;
    if (idsToApprove.length === 0) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const approvedNames = pendingQueue
      .filter((pb) => idsToApprove.includes(pb.id))
      .map((pb) => pb.patientName)
      .join(', ');

    const newAudits: AuditRecord[] = idsToApprove.map((id) => {
      const pb = pendingQueue.find((x) => x.id === id)!;
      return {
        timestamp: new Date().toLocaleString(),
        action: 'BOOKING_APPROVED',
        actor: 'Secretary Staff',
        details: `Approved reservation for ${pb.patientName}. Predefined: ${approveReason}`,
      };
    });
    setAudits((prev) => [...newAudits, ...prev]);

    const newEmails: EmailLog[] = idsToApprove.map((id) => {
      const pb = pendingQueue.find((x) => x.id === id)!;
      return {
        timestamp: new Date().toLocaleString(),
        recipient: `${pb.patientName.toLowerCase().replace(' ', '.')}@example.com`,
        subject: 'Appointment Booking Approved!',
        status: 'SENT' as const,
      };
    });
    setEmailLogs((prev) => [...newEmails, ...prev]);

    const approvedAppts: UpcomingAppointment[] = pendingQueue
      .filter((pb) => idsToApprove.includes(pb.id))
      .map((pb) => ({
        id: `ua-approved-${pb.id}`,
        patientName: pb.patientName,
        serviceName: pb.serviceName,
        date: pb.date,
        time: pb.time,
        doctorName: 'Dr. Sarah Samson',
        status: 'SCHEDULED' as const,
      }));

    setUpcomingList((prev) => [...prev, ...approvedAppts]);
    setPendingQueue((prev) => prev.filter((pb) => !idsToApprove.includes(pb.id)));

    addToast(`Approved booking records successfully: ${approvedNames}`, 'success');
    setIsApproveOpen(false);
    setActivePending(null);
    setSelectedPendingIds([]);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePending || !rejectReason) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setAudits((prev) => [
      {
        timestamp: new Date().toLocaleString(),
        action: 'BOOKING_REJECTED',
        actor: 'Secretary Staff',
        details: `Rejected reservation for ${activePending.patientName}. Reason: ${rejectReason}`,
      },
      ...prev,
    ]);

    setEmailLogs((prev) => [
      {
        timestamp: new Date().toLocaleString(),
        recipient: `${activePending.patientName.toLowerCase().replace(' ', '.')}@example.com`,
        subject: 'Appointment Booking Rejected',
        status: 'SENT' as const,
      },
      ...prev,
    ]);

    setPendingQueue((prev) => prev.filter((pb) => pb.id !== activePending.id));

    addToast(`Rejected booking record successfully for: ${activePending.patientName}`, 'info');
    setIsRejectOpen(false);
    setActivePending(null);
    setRejectReason('');
  };

  const handleCheckIn = (id: string) => {
    const updated = upcomingList.map((ua) => {
      if (ua.id === id) {
        const newStatus = ua.status === 'SCHEDULED' ? ('CHECKED_IN' as const) : ('SCHEDULED' as const);
        addToast(
          newStatus === 'CHECKED_IN'
            ? `${ua.patientName} marked as Checked-In.`
            : `${ua.patientName} status reset to Scheduled.`,
          'info'
        );
        return { ...ua, status: newStatus };
      }
      return ua;
    });
    setUpcomingList(updated);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) return;

    setIsCheckoutSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsCheckoutSubmitting(false);

    const finalPrice = calculateFinalPrice(activeInvoice.basePrice, discountPercent);
    setAudits((prev) => [
      {
        timestamp: new Date().toLocaleString(),
        action: 'INVOICE_FINALIZED',
        actor: 'Secretary Staff',
        details: `Finalized checkout for ${activeInvoice.patientName}. Total paid: $${finalPrice} (${paymentMethod}).`,
      },
      ...prev,
    ]);

    setDraftInvoices((prev) => prev.filter((di) => di.id !== activeInvoice.id));

    addToast(`Invoicing finalized for ${activeInvoice.patientName}. Receipts generated!`, 'success');
    setActiveInvoice(null);
    setDiscountPercent(0);
  };

  return {
    pendingQueue,
    upcomingList,
    draftInvoices,
    audits,
    emailLogs,
    selectedPendingIds,
    setSelectedPendingIds,
    activePending,
    setActivePending,
    isApproveOpen,
    setIsApproveOpen,
    approveReason,
    setApproveReason,
    isRejectOpen,
    setIsRejectOpen,
    rejectReason,
    setRejectReason,
    activeInvoice,
    setActiveInvoice,
    discountPercent,
    setDiscountPercent,
    paymentMethod,
    setPaymentMethod,
    isCheckoutSubmitting,
    emailSearch,
    setEmailSearch,
    calculateFinalPrice,
    handlePendingSelect,
    handleApproveSubmit,
    handleRejectSubmit,
    handleCheckIn,
    handleCheckoutSubmit,
  };
}
