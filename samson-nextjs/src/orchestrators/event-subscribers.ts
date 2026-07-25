import { registerSubscriber } from '@/shared/outbox/outbox.registry';
import { onPatientRegisteredSubscriber } from '@/modules/emails/subscribers/on-patient-registered.subscriber';
import { onPasswordResetRequestedSubscriber } from '@/modules/emails/subscribers/on-password-reset-requested.subscriber';
import { onAppointmentBookedSubscriber } from '@/modules/emails/subscribers/on-appointment-booked.subscriber';
import { onAppointmentConvertedSubscriber } from '@/modules/emails/subscribers/on-appointment-converted.subscriber';
import { onManualBookingGuestSubscriber } from '@/modules/emails/subscribers/on-manual-booking-guest.subscriber';
import { onManualBookingPatientSubscriber } from '@/modules/emails/subscribers/on-manual-booking-patient.subscriber';
import { onTreatmentRenderedSubscriber } from '@/modules/notifications/subscribers/on-treatment-rendered.subscriber';
import { onEmailFailedSubscriber } from '@/modules/notifications/subscribers/on-email-failed.subscriber';
import { onScheduleConflictSubscriber } from '@/modules/notifications/subscribers/on-schedule-conflict.subscriber';
import { onNewBookingSubscriber } from '@/modules/notifications/subscribers/on-new-booking.subscriber';
import { onCancelBookingSubscriber as onCancelBookingNotificationSubscriber } from '@/modules/notifications/subscribers/on-cancel-booking.subscriber';
import { onCancelBookingSubscriber as onCancelBookingEmailSubscriber } from '@/modules/emails/subscribers/on-cancel-booking.subscriber';
import { onRescheduleBookingSubscriber } from '@/modules/emails/subscribers/on-reschedule-booking.subscriber';
import { onStaffReplySubscriber } from '@/modules/emails/subscribers/on-staff-reply.subscriber';
import { onManualBookingSmsSubscriber } from '@/modules/emails/subscribers/on-manual-booking-sms.subscriber';
import { onAppointmentReminder24hSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-24h.subscriber';
import { onAppointmentReminder48hSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-48h.subscriber';

/**
 * Bootstraps the Event Bus Registry.
 * This file acts as the Orchestrator layer, wiring specific Domain Modules 
 * (like Emails or SMS) to the generic Shared Event Bus.
 * 
 * By importing this file in the dispatcher, we guarantee that all subscribers
 * are registered in the Next.js serverless environment before events are processed.
 */
export const bootstrapEventSubscribers = () => {
  registerSubscriber('PATIENT_REGISTERED', onPatientRegisteredSubscriber.handle);
  registerSubscriber('PASSWORD_RESET_REQUESTED', onPasswordResetRequestedSubscriber.handle);
  registerSubscriber('APPOINTMENT_BOOKED', onAppointmentBookedSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY', onAppointmentConvertedSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT', onManualBookingPatientSubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_GUEST', onManualBookingGuestSubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_PATIENT', onManualBookingPatientSubscriber.handle);
  
  // Missing notification subscriptions
  registerSubscriber('TREATMENT_RENDERED', onTreatmentRenderedSubscriber.handle);
  registerSubscriber('EMAIL_FAILED', onEmailFailedSubscriber.handle);
  registerSubscriber('SCHEDULE_CONFLICT', onScheduleConflictSubscriber.handle);
  registerSubscriber('NEW_APPOINTMENT_REQUEST', onNewBookingSubscriber.handle);
  
  // Dual-purpose Cancel subscribers
  registerSubscriber('CANCEL_BOOKING', onCancelBookingNotificationSubscriber.handle);
  registerSubscriber('CANCEL_BOOKING', onCancelBookingEmailSubscriber.handle);
  
  // Reschedule & reply & SMS confirmation subscribers
  registerSubscriber('RESCHEDULE_BOOKING', onRescheduleBookingSubscriber.handle);
  registerSubscriber('STAFF_REPLIED_TO_CHAT', onStaffReplySubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_SMS', onManualBookingSmsSubscriber.handle);
  
  // 24h & 48h Reminders
  registerSubscriber('APPOINTMENT_REMINDER_24H', onAppointmentReminder24hSubscriber.handle);
  registerSubscriber('APPOINTMENT_REMINDER_48H', onAppointmentReminder48hSubscriber.handle);
};

