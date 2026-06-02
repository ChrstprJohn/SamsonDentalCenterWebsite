'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/feedback/toast-container';

interface PendingBooking {
  id: string;
  patientName: string;
  serviceName: string;
  date: string;
  time: string;
  familyGroupId?: string;
  relationship?: string;
}

interface UpcomingAppointment {
  id: string;
  patientName: string;
  serviceName: string;
  date: string;
  time: string;
  doctorName: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED';
}

interface DraftInvoice {
  id: string;
  patientName: string;
  serviceName: string;
  doctorName: string;
  basePrice: number;
  date: string;
}

interface AuditRecord {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

interface EmailLog {
  timestamp: string;
  recipient: string;
  subject: string;
  status: 'SENT' | 'FAILED';
}

const INITIAL_PENDING: PendingBooking[] = [
  { id: 'pb-1', patientName: 'John Samson', serviceName: 'Routine Dental Cleaning', date: '2026-06-18', time: '09:00 AM', familyGroupId: 'fam-samson', relationship: 'Self' },
  { id: 'pb-2', patientName: 'Jane Samson', serviceName: 'Routine Dental Cleaning', date: '2026-06-18', time: '09:45 AM', familyGroupId: 'fam-samson', relationship: 'Spouse' },
  { id: 'pb-3', patientName: 'Timmy Samson', serviceName: 'Orthodontic Consultation', date: '2026-06-18', time: '10:30 AM', familyGroupId: 'fam-samson', relationship: 'Child' },
  { id: 'pb-4', patientName: 'Alice Mercer', serviceName: 'Premium Dental Implants', date: '2026-06-20', time: '02:00 PM' },
];

const INITIAL_UPCOMING: UpcomingAppointment[] = [
  { id: 'ua-1', patientName: 'Robert Vance', serviceName: 'Teeth Whitening (Laser)', date: '2026-06-12', time: '11:00 AM', doctorName: 'Dr. Sarah Samson', status: 'SCHEDULED' },
  { id: 'ua-2', patientName: 'Diana Prince', serviceName: 'Orthodontic Braces Fit', date: '2026-06-12', time: '01:30 PM', doctorName: 'Dr. Sarah Samson', status: 'CHECKED_IN' },
];

const INITIAL_DRAFTS: DraftInvoice[] = [
  { id: 'di-1', patientName: 'Clark Kent', serviceName: 'Dental Crown Fitting', doctorName: 'Dr. Sarah Samson', basePrice: 450, date: '2026-05-31' },
  { id: 'di-2', patientName: 'Bruce Wayne', serviceName: 'Laser Bleaching (Laser)', doctorName: 'Dr. James Mercer', basePrice: 299, date: '2026-05-31' },
];

const INITIAL_AUDITS: AuditRecord[] = [
  { timestamp: '2026-05-31 02:44 PM', action: 'BOOKING_APPROVED', actor: 'Secretary Staff', details: 'Approved reservation for Timmy Vance (Spouse) - Predefined: Roster schedule cleared.' },
  { timestamp: '2026-05-31 01:10 PM', action: 'APPOINTMENT_CANCELLED', actor: 'Patient Portal', details: 'Cancelled reservation by Clark Kent. Reason: Scheduling conflict.' },
];

const INITIAL_EMAILS: EmailLog[] = [
  { timestamp: '2026-05-31 02:44 PM', recipient: 'timmy.vance@example.com', subject: 'Appointment Booking Approved!', status: 'SENT' },
  { timestamp: '2026-05-31 01:10 PM', recipient: 'clark.kent@dailyplanet.com', subject: 'Appointment Cancellation Receipt', status: 'SENT' },
];

export function SecretaryDashboardView() {
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

  // Price calculations
  const calculateFinalPrice = (basePrice: number, discount: number) => {
    const final = basePrice - (basePrice * (discount / 100));
    return Math.max(0, parseFloat(final.toFixed(2)));
  };

  const handlePendingSelect = (id: string) => {
    setSelectedPendingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idsToApprove = activePending ? [activePending.id] : selectedPendingIds;
    if (idsToApprove.length === 0) return;

    // Simulate batch approval trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const approvedNames = pendingQueue
      .filter((pb) => idsToApprove.includes(pb.id))
      .map((pb) => pb.patientName)
      .join(', ');

    // Add to audit logs
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

    // Send emails
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

    // Remove from pending, add to upcoming
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

    // Audit & email log
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

    // Audit logs
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

  // Group pending queue by familyGroupId
  const familyGroups: Record<string, PendingBooking[]> = {};
  const individuals: PendingBooking[] = [];

  pendingQueue.forEach((pb) => {
    if (pb.familyGroupId) {
      if (!familyGroups[pb.familyGroupId]) {
        familyGroups[pb.familyGroupId] = [];
      }
      familyGroups[pb.familyGroupId].push(pb);
    } else {
      individuals.push(pb);
    }
  });

  const filteredEmails = emailLogs.filter((log) =>
    log.recipient.toLowerCase().includes(emailSearch.toLowerCase()) ||
    log.subject.toLowerCase().includes(emailSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Secretary Dashboard</h2>
        <p className="text-xs text-text-muted">Coordinate clinic schedules, batch family bookings, check-in patients, and finalize transaction checkouts.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (Approvals & Check-in) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* 👥 1. Pending & Grouped Booking Requests Panel */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Pending Booking Queue</h3>
              {selectedPendingIds.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => setIsApproveOpen(true)}
                >
                  Approve Batched ({selectedPendingIds.length})
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {/* Render Family Group Containers */}
              {Object.entries(familyGroups).map(([famId, members]) => (
                <div
                  key={famId}
                  className="p-5 rounded-3xl border border-card-border bg-accent-blue-bg/40 backdrop-blur-md flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center border-b border-card-border pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary-start uppercase tracking-wider">Family Group Batched Row</span>
                      <span className="text-[10px] text-text-muted mt-0.5">Members scheduled on same dateUnit</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const memberIds = members.map((m) => m.id);
                        setSelectedPendingIds(memberIds);
                        setIsApproveOpen(true);
                      }}
                    >
                      Approve Group
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {members.map((pb) => (
                      <div key={pb.id} className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-card-border text-xs justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPendingIds.includes(pb.id)}
                            onChange={() => handlePendingSelect(pb.id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">
                              {pb.patientName} ({pb.relationship})
                            </span>
                            <span className="text-[10px] text-text-muted mt-0.5">{pb.serviceName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-text-secondary">📅 {pb.date} at {pb.time}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              className="px-2.5 py-1 text-[10px]"
                              onClick={() => {
                                setActivePending(pb);
                                setIsRejectOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                            <Button
                              className="px-2.5 py-1 text-[10px]"
                              onClick={() => {
                                setActivePending(pb);
                                setIsApproveOpen(true);
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Render Individual Bookings */}
              {individuals.map((pb) => (
                <div key={pb.id} className="p-4 rounded-2xl border border-card-border bg-card flex items-center justify-between text-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPendingIds.includes(pb.id)}
                      onChange={() => handlePendingSelect(pb.id)}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary">{pb.patientName}</span>
                      <span className="text-[10px] text-text-muted mt-0.5">{pb.serviceName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-text-secondary">📅 {pb.date} at {pb.time}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="px-2.5 py-1 text-[10px]"
                        onClick={() => {
                          setActivePending(pb);
                          setIsRejectOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        className="px-2.5 py-1 text-[10px]"
                        onClick={() => {
                          setActivePending(pb);
                          setIsApproveOpen(true);
                        }}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingQueue.length === 0 && (
                <div className="text-center py-10 border border-dashed border-card-border rounded-3xl text-sm text-text-muted">
                  No pending booking requests awaiting review.
                </div>
              )}
            </div>
          </section>

          {/* 📍 2. Check-In & Arrival Tracker Panel */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Check-In Tracker</h3>
            <div className="flex flex-col gap-4">
              {upcomingList.map((ua) => (
                <div
                  key={ua.id}
                  className="p-5 rounded-2xl border border-card-border bg-card flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      ua.status === 'CHECKED_IN'
                        ? 'bg-accent-blue-bg text-accent-blue-text'
                        : 'bg-secondary-bg text-text-secondary'
                    }`}>
                      {ua.status === 'CHECKED_IN' ? 'Checked In' : 'Scheduled'}
                    </span>
                    <h4 className="text-base font-bold text-text-primary mt-1">{ua.patientName}</h4>
                    <p className="text-xs text-text-muted">📅 {ua.date} at {ua.time} | 👨‍⚕️ {ua.doctorName}</p>
                  </div>
                  <Button
                    variant={ua.status === 'CHECKED_IN' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleCheckIn(ua.id)}
                  >
                    {ua.status === 'CHECKED_IN' ? 'Undo Check-In' : 'Mark Checked-In'}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Checkout drafts & email searchable logs) */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          {/* 💳 3. Checkout Invoices Panel */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Checkout Queue</h3>
            <div className="flex flex-col gap-4">
              {draftInvoices.map((di) => (
                <div
                  key={di.id}
                  className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-4 hover:shadow-md"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Draft Invoice</span>
                    <h4 className="font-bold text-text-primary mt-1">{di.patientName}</h4>
                    <span className="text-[10px] text-text-muted mt-0.5">{di.serviceName} | Dr. {di.doctorName.replace('Dr. ', '')}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-card-border pt-3">
                    <span className="text-sm font-extrabold text-text-primary">${di.basePrice}</span>
                    <Button size="sm" onClick={() => setActiveInvoice(di)}>
                      Check-Out
                    </Button>
                  </div>
                </div>
              ))}

              {draftInvoices.length === 0 && (
                <div className="text-center py-8 border border-dashed border-card-border rounded-2xl text-xs text-text-muted">
                  No draft invoices awaiting checkout.
                </div>
              )}
            </div>
          </section>

          {/* ✉️ 4. Email Communications Timeline */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Patient Notifications</h3>
            <div className="bg-card border border-card-border rounded-3xl p-5 shadow-lg flex flex-col gap-4">
              <input
                type="text"
                placeholder="Search recipient or subject..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="px-3 py-2 rounded-xl border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring w-full text-text-primary"
              />

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredEmails.map((log, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 p-3 rounded-xl border border-card-border bg-secondary-bg/50 text-[10px]">
                    <div className="flex justify-between">
                      <span className="font-bold text-text-primary">{log.recipient}</span>
                      <span className="text-text-muted">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                    </div>
                    <span className="text-text-secondary mt-0.5">{log.subject}</span>
                    <span className="inline-flex self-start px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase mt-1">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 📜 5. Audit Timelines Panel */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Secretary Audit Timeline</h3>
        <div className="border border-card-border rounded-3xl overflow-hidden bg-card divide-y divide-card-border">
          {audits.map((item, idx) => (
            <div key={idx} className="p-5 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-start">
                <span className="inline-flex px-2 py-0.5 rounded bg-accent-blue-bg text-accent-blue-text font-bold text-[9px] uppercase tracking-wider">
                  {item.action}
                </span>
                <span className="text-[10px] text-text-muted">{item.timestamp}</span>
              </div>
              <p className="text-text-secondary leading-relaxed mt-1">{item.details}</p>
              <span className="text-[10px] text-text-muted">Actor: {item.actor}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Approval Dialog Predefined Reasons Popup */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false);
          setActivePending(null);
        }}
        title="Approve Booking Request"
        size="sm"
      >
        <form onSubmit={handleApproveSubmit} className="flex flex-col gap-4 text-sm text-text-secondary py-1">
          <p className="leading-relaxed">
            Confirm administrative approval for the selected appointment(s)?
          </p>
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-semibold text-text-secondary">Pick Approval Reason</label>
            <select
              value={approveReason}
              onChange={(e) => setApproveReason(e.target.value)}
              className="px-3 py-2 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
            >
              <option value="Roster schedule cleared">Roster schedule cleared</option>
              <option value="Treatment room available">Treatment room available</option>
              <option value="Staff slots balanced">Staff slots balanced</option>
              <option value="Family batched reservation finalized">Family batched reservation finalized</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end border-t border-card-border pt-4 mt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsApproveOpen(false);
                setActivePending(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Finalize Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rejection Dialog Mandatory Reason Popup */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setActivePending(null);
          setRejectReason('');
        }}
        title="Reject Booking Request"
        size="sm"
      >
        <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4 text-sm text-text-secondary py-1">
          <p className="leading-relaxed">
            Specify the mandatory rejection reason for: <strong>{activePending?.patientName}</strong>?
          </p>
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-semibold text-text-secondary">Mandatory Reason Details</label>
            <textarea
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (e.g. clinic fully booked, conflicting treatment plan)..."
              rows={3}
              className="px-3 py-2 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
            />
          </div>

          <div className="flex gap-3 justify-end border-t border-card-border pt-4 mt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsRejectOpen(false);
                setActivePending(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={!rejectReason}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Check-Out dynamic Invoice editor modal */}
      <Modal
        isOpen={activeInvoice !== null}
        onClose={() => {
          setActiveInvoice(null);
          setDiscountPercent(0);
        }}
        title="Checkout & Finalize Invoice"
        size="md"
      >
        {activeInvoice && (
          <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 text-sm text-text-secondary py-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-widest">Draft Receipt</span>
              <h4 className="text-base font-bold text-text-primary">{activeInvoice.patientName}</h4>
              <p className="text-xs text-text-muted">{activeInvoice.serviceName} | Dr. {activeInvoice.doctorName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-card-border py-4 my-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Apply Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
                >
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="INSURANCE">Insurance Claim</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 p-4 bg-secondary-bg rounded-2xl border border-card-border">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Due</span>
                <span className="text-lg font-extrabold text-primary-start">
                  ${calculateFinalPrice(activeInvoice.basePrice, discountPercent)}
                </span>
              </div>
              <span className="text-xs text-text-muted">Base Price: ${activeInvoice.basePrice} | Discount: {discountPercent}%</span>
            </div>

            <div className="flex gap-3 justify-end border-t border-card-border pt-4 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setActiveInvoice(null);
                  setDiscountPercent(0);
                }}
              >
                Close
              </Button>
              <Button type="submit" disabled={isCheckoutSubmitting}>
                {isCheckoutSubmitting ? 'Checking Out...' : 'Complete & Lock Receipt'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
