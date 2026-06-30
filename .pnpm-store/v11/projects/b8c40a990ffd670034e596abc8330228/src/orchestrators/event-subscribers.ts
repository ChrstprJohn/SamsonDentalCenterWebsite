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
import { onCancelBookingSubscriber } from '@/modules/notifications/subscribers/on-cancel-booking.subscriber';

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
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_GUEST', onManualBookingGuestSubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_PATIENT', onManualBookingPatientSubscriber.handle);
  
  // Future SMS Module
  // registerSubscriber('PATIENT_REGISTERED', onPatientRegisteredSmsSubscriber.handle);
};
