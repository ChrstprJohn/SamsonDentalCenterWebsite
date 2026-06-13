'use client';

import React from 'react';
import { useSecretaryDashboard } from '../hooks/use-secretary-dashboard';
import { PendingBookingQueue } from '../components/sub-components/pending-booking-queue';
import { CheckInTracker } from '../components/sub-components/check-in-tracker';
import { CheckoutQueue } from '../components/sub-components/checkout-queue';
import { PatientNotifications } from '../components/sub-components/patient-notifications';
import { AuditTimeline } from '../components/sub-components/audit-timeline';
import { BookingApprovalModal } from '../components/sub-components/booking-approval-modal';
import { BookingRejectionModal } from '../components/sub-components/booking-rejection-modal';
import { InvoiceCheckoutModal } from '../components/sub-components/invoice-checkout-modal';

export function SecretaryDashboardView() {
  const {
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
  } = useSecretaryDashboard();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Secretary Dashboard</h2>
        <p className="text-xs text-text-muted text-left">
          Coordinate clinic schedules, batch family bookings, check-in patients, and finalize transaction checkouts.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start text-left">
        {/* Left Column (Approvals & Check-in) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <PendingBookingQueue
            pendingQueue={pendingQueue}
            selectedPendingIds={selectedPendingIds}
            setSelectedPendingIds={setSelectedPendingIds}
            setIsApproveOpen={setIsApproveOpen}
            setActivePending={setActivePending}
            setIsRejectOpen={setIsRejectOpen}
            handlePendingSelect={handlePendingSelect}
          />
          <CheckInTracker upcomingList={upcomingList} handleCheckIn={handleCheckIn} />
        </div>

        {/* Right Column (Checkout drafts & email searchable logs) */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <CheckoutQueue draftInvoices={draftInvoices} setActiveInvoice={setActiveInvoice} />
          <PatientNotifications
            emailLogs={emailLogs}
            emailSearch={emailSearch}
            setEmailSearch={setEmailSearch}
          />
        </div>
      </div>

      <AuditTimeline audits={audits} />

      {/* Approval Dialog Predefined Reasons Popup */}
      <BookingApprovalModal
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false);
          setActivePending(null);
        }}
        approveReason={approveReason}
        setApproveReason={setApproveReason}
        handleApproveSubmit={handleApproveSubmit}
      />

      {/* Rejection Dialog Mandatory Reason Popup */}
      <BookingRejectionModal
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setActivePending(null);
          setRejectReason('');
        }}
        patientName={activePending?.patientName}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleRejectSubmit={handleRejectSubmit}
      />

      {/* Check-Out dynamic Invoice editor modal */}
      <InvoiceCheckoutModal
        activeInvoice={activeInvoice}
        onClose={() => {
          setActiveInvoice(null);
          setDiscountPercent(0);
        }}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        calculateFinalPrice={calculateFinalPrice}
        handleCheckoutSubmit={handleCheckoutSubmit}
        isCheckoutSubmitting={isCheckoutSubmitting}
      />
    </div>
  );
}
