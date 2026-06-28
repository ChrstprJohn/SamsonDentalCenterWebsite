// src/modules/staff/types/secretary.types.ts

export type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'RESCHEDULE_REQUESTED'
  | 'DISPLACED'
  | 'CHECKED_IN'
  | 'TREATMENT_RENDERED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type PaymentMethod = 'CASH' | 'CARD' | 'HMO';
export type InquiryStatus = 'NEW' | 'CONVERTED' | 'DROPPED';
export type AppointmentSource = 'SELF_BOOKED' | 'STAFF_CREATED';

export interface PatientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  cancelCount: number;
  noShowCount: number;
  rescheduleCount: number;
}

export interface Appointment {
  id: string;
  patientId: string | null;
  patientName: string;
  dependentId?: string | null;
  dependentName?: string | null;
  serviceId: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  userNote?: string;
  statusReason?: string;
  clinicalNotes?: string;
  rescheduleCount: number;
}

export interface Inquiry {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  phoneNumber: string;
  email: string;
  preferredServiceId: string;
  preferredServiceName: string;
  preferredDate: string;
  patientNote?: string;
  status: InquiryStatus;
  secretaryNotes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  amount: number;
  basePrice: number;
  discountApplied: number;
  paymentMethod?: PaymentMethod | null;
  status: 'DRAFT' | 'FINALIZED' | 'PAID' | 'VOID';
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  timestamp: string;
  status: 'Sent' | 'Failed' | 'Pending';
  content?: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  action: string;
  targetName: string;
  reason?: string;
  timestamp: string;
}
