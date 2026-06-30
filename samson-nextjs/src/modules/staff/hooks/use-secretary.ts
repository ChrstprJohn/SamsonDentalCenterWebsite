// src/modules/staff/hooks/use-secretary.ts
'use client';

import { useState } from 'react';
import {
  MOCK_APPOINTMENTS,
  MOCK_INQUIRIES,
  MOCK_INVOICES,
  MOCK_EMAILS,
  MOCK_AUDITS,
  MOCK_PATIENT_USERS,
} from '../mocks/secretary.mock';
import { Appointment, Inquiry, Invoice, EmailLog, AuditLog, PatientUser, AppointmentStatus, PaymentMethod } from '../types/secretary.types';

export function useSecretary() {
  const [devMode] = useState<'LOADING' | 'DATA'>('DATA');

  // Database simulator states
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(MOCK_INQUIRIES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [emails, setEmails] = useState<EmailLog[]>(MOCK_EMAILS);
  const [audits, setAudits] = useState<AuditLog[]>(MOCK_AUDITS);
  const [patients] = useState<PatientUser[]>(MOCK_PATIENT_USERS);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Form selections for Requests Review Pane
  const [stagedStatus, setStagedStatus] = useState<'APPROVED' | 'REJECTED' | 'DISPLACED' | ''>('');
  const [stagedReason, setStagedReason] = useState('');

  // Form selections for Inquiries Conversion Pane
  const [stagedInquiryAction, setStagedInquiryAction] = useState<'CONVERT' | 'DROP' | ''>('');
  const [stagedInquiryService, setStagedInquiryService] = useState('');
  const [stagedInquiryDoctor, setStagedInquiryDoctor] = useState('');
  const [stagedInquiryDate, setStagedInquiryDate] = useState('');
  const [stagedInquiryTime, setStagedInquiryTime] = useState('');
  const [stagedInquiryNote, setStagedInquiryNote] = useState('');
  const [linkedPatientId, setLinkedPatientId] = useState<string | null>(null);

  // Manual Booking Wizard Stepper States
  const [bookingStep, setBookingStep] = useState(1);
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientUser | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    phoneNumber: '',
    email: '',
  });
  const [manualService, setManualService] = useState('');
  const [manualDoctor, setManualDoctor] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');

  // Invoice checkout state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: 'Mary',
    middleName: 'Jane',
    lastName: 'Watson',
    suffix: '',
    email: 'mary.watson@samsondental.com',
    phoneNumber: '+1092837465',
  });

  const isLoading = devMode === 'LOADING';

  // Handler: Review Appointment Request
  const handleFinishAppointmentReview = async (appId: string) => {
    if (!stagedStatus) return alert('Please select a decision state first!');
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, status: stagedStatus as AppointmentStatus, statusReason: stagedReason } : app
      )
    );

    // Write audit log
    const targetApp = appointments.find((a) => a.id === appId);
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorName: 'Secretary Mary',
      action: `${stagedStatus}_BOOKING`,
      targetName: `${targetApp?.patientName || 'Patient'} (${appId})`,
      reason: stagedReason,
      timestamp: new Date().toISOString(),
    };
    setAudits((prev) => [newAudit, ...prev]);

    // Write email notification
    if (targetApp?.patientId) {
      const targetPat = patients.find((p) => p.id === targetApp.patientId);
      if (targetPat?.email) {
        const newEmail: EmailLog = {
          id: `eml-${Date.now()}`,
          recipient: targetPat.email,
          subject: `Appointment Update: Status changed to ${stagedStatus}`,
          type: 'Status Update',
          timestamp: new Date().toISOString(),
          status: 'Sent',
        };
        setEmails((prev) => [newEmail, ...prev]);
      }
    }

    setIsSubmitting(false);
    setSelectedAppointmentId(null);
    setStagedStatus('');
    setStagedReason('');
    alert('Review decision completed successfully.');
  };

  // Handler: Review Inquiry Form
  const handleFinishInquiryReview = async (inqId: string) => {
    if (!stagedInquiryAction) return alert('Please select an action state first!');
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    if (stagedInquiryAction === 'CONVERT') {
      const inquiry = inquiries.find((i) => i.id === inqId);
      const newApp: Appointment = {
        id: `app-${Date.now()}`,
        patientId: linkedPatientId,
        patientName: inquiry ? `${inquiry.firstName} ${inquiry.lastName}` : 'Guest',
        serviceId: stagedInquiryService || 'srv-1',
        serviceName: 'Converted Service',
        doctorId: stagedInquiryDoctor || 'doc-1',
        doctorName: 'Dr. Christopher Samson',
        date: stagedInquiryDate || '2026-06-25',
        startTime: stagedInquiryTime || '09:00 AM',
        endTime: '09:30 AM',
        status: 'APPROVED',
        source: 'STAFF_CREATED',
        userNote: stagedInquiryNote,
        rescheduleCount: 0,
      };
      setAppointments((prev) => [...prev, newApp]);

      // Add to audits
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        actorName: 'Secretary Mary',
        action: 'CONVERT_INQUIRY',
        targetName: inquiry ? `${inquiry.firstName} ${inquiry.lastName}` : 'Guest',
        reason: 'Inquiry converted to booking',
        timestamp: new Date().toISOString(),
      };
      setAudits((prev) => [newAudit, ...prev]);
    }

    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === inqId ? { ...inq, status: stagedInquiryAction === 'CONVERT' ? 'CONVERTED' : 'DROPPED' } : inq
      )
    );

    setIsSubmitting(false);
    setSelectedInquiryId(null);
    setStagedInquiryAction('');
    alert('Inquiry review completed successfully.');
  };

  // Handler: Manual Stepper Booking
  const handleManualBookingSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const name = selectedPatient
      ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
      : `${guestForm.firstName} ${guestForm.lastName}`;

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      patientId: selectedPatient?.id || null,
      patientName: name,
      serviceId: manualService || 'srv-1',
      serviceName: 'Selected Clinic Service',
      doctorId: manualDoctor || 'doc-1',
      doctorName: 'Dr. Christopher Samson',
      date: manualDate || '2026-06-25',
      startTime: manualTime || '10:00 AM',
      endTime: '10:30 AM',
      status: 'APPROVED',
      source: 'STAFF_CREATED',
      rescheduleCount: 0,
    };

    setAppointments((prev) => [...prev, newApp]);

    // Audit log
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorName: 'Secretary Mary',
      action: 'CREATE_MANUAL_BOOKING',
      targetName: `${name} (Auto-Approved)`,
      reason: 'Manual booking by secretary',
      timestamp: new Date().toISOString(),
    };
    setAudits((prev) => [newAudit, ...prev]);

    setIsSubmitting(false);
    setBookingStep(3); // Success/Confirmation
  };

  // Reset Booking stepper wizard
  const resetBookingWizard = () => {
    setBookingStep(1);
    setSelectedPatient(null);
    setIsNewGuest(false);
    setGuestForm({
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      phoneNumber: '',
      email: '',
    });
    setManualService('');
    setManualDoctor('');
    setManualDate('');
    setManualTime('');
  };

  // Handler: Check-in patient arrival
  const handleCheckInToggle = async (appId: string, currentStatus: string) => {
    await new Promise((r) => setTimeout(r, 300));
    const nextStatus = currentStatus === 'APPROVED' ? 'CHECKED_IN' : 'APPROVED';
    setAppointments((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: nextStatus as AppointmentStatus } : app))
    );

    const targetApp = appointments.find((a) => a.id === appId);
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorName: 'Secretary Mary',
      action: nextStatus === 'CHECKED_IN' ? 'CHECK_IN_PATIENT' : 'UNDO_CHECK_IN',
      targetName: `${targetApp?.patientName || 'Patient'} (${appId})`,
      timestamp: new Date().toISOString(),
    };
    setAudits((prev) => [newAudit, ...prev]);
  };

  // Handler: Complete Invoicing & Checkout
  const handleCheckoutComplete = async () => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const finalAmount = selectedInvoice.basePrice * (1 - discountPercent / 100);

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === selectedInvoice.id
          ? { ...inv, amount: finalAmount, discountApplied: discountPercent, paymentMethod, status: 'FINALIZED' }
          : inv
      )
    );

    setAppointments((prev) =>
      prev.map((app) =>
        app.id === selectedInvoice.appointmentId ? { ...app, status: 'COMPLETED' as AppointmentStatus } : app
      )
    );

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorName: 'Secretary Mary',
      action: 'COMPLETE_CHECKOUT',
      targetName: `${selectedInvoice.patientName} (Invoice: ${selectedInvoice.id})`,
      reason: `Checkout done. Paid via ${paymentMethod}. Discount: ${discountPercent}%`,
      timestamp: new Date().toISOString(),
    };
    setAudits((prev) => [newAudit, ...prev]);

    setIsSubmitting(false);
    setSelectedInvoice(null);
    setDiscountPercent(0);
    alert('Invoice completed and locked successfully.');
  };

  // Handler: Update profile settings
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSubmitting(false);
    alert('Profile settings saved successfully.');
  };

  return {
    isLoading,
    appointments,
    inquiries,
    invoices,
    emails,
    setEmails,
    audits,
    patients,

    // Selections
    selectedAppointmentId,
    setSelectedAppointmentId,
    selectedInquiryId,
    setSelectedInquiryId,
    isSubmitting,

    // Appointment Request Staged Form
    stagedStatus,
    setStagedStatus,
    stagedReason,
    setStagedReason,
    handleFinishAppointmentReview,

    // Inquiries Staged Form
    stagedInquiryAction,
    setStagedInquiryAction,
    stagedInquiryService,
    setStagedInquiryService,
    stagedInquiryDoctor,
    setStagedInquiryDoctor,
    stagedInquiryDate,
    setStagedInquiryDate,
    stagedInquiryTime,
    setStagedInquiryTime,
    stagedInquiryNote,
    setStagedInquiryNote,
    linkedPatientId,
    setLinkedPatientId,
    handleFinishInquiryReview,

    // Booking Wizard Stepper
    bookingStep,
    setBookingStep,
    manualSearchQuery,
    setManualSearchQuery,
    selectedPatient,
    setSelectedPatient,
    isNewGuest,
    setIsNewGuest,
    guestForm,
    setGuestForm,
    manualService,
    setManualService,
    manualDoctor,
    setManualDoctor,
    manualDate,
    setManualDate,
    manualTime,
    setManualTime,
    handleManualBookingSubmit,
    resetBookingWizard,

    // Check-in Out
    handleCheckInToggle,
    selectedInvoice,
    setSelectedInvoice,
    discountPercent,
    setDiscountPercent,
    paymentMethod,
    setPaymentMethod,
    handleCheckoutComplete,

    // Profile
    profileForm,
    setProfileForm,
    handleUpdateProfile,
  };
}
