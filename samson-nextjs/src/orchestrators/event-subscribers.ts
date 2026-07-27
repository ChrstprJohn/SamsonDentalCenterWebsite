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
import { onAppointmentReminder24hSmsSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-24h-sms.subscriber';
import { onAppointmentReminder48hSmsSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-48h-sms.subscriber';
import { onPostCareReviewSubscriber } from '@/modules/emails/subscribers/on-post-care-review.subscriber';
import { onPostCareReviewSmsSubscriber } from '@/modules/emails/subscribers/on-post-care-review-sms.subscriber';

export const bootstrapEventSubscribers = () => {
  registerSubscriber('PATIENT_REGISTERED', onPatientRegisteredSubscriber.handle);
  registerSubscriber('PASSWORD_RESET_REQUESTED', onPasswordResetRequestedSubscriber.handle);
  registerSubscriber('APPOINTMENT_BOOKED', onAppointmentBookedSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY', onAppointmentConvertedSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT', onManualBookingPatientSubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_GUEST', onManualBookingGuestSubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_PATIENT', onManualBookingPatientSubscriber.handle);
  
  // Notification subscriptions
  registerSubscriber('TREATMENT_RENDERED', onTreatmentRenderedSubscriber.handle);
  registerSubscriber('EMAIL_FAILED', onEmailFailedSubscriber.handle);
  registerSubscriber('SCHEDULE_CONFLICT', onScheduleConflictSubscriber.handle);
  registerSubscriber('NEW_APPOINTMENT_REQUEST', onNewBookingSubscriber.handle);
  
  // Cancel subscribers
  registerSubscriber('CANCEL_BOOKING', onCancelBookingNotificationSubscriber.handle);
  registerSubscriber('CANCEL_BOOKING', onCancelBookingEmailSubscriber.handle);
  
  // Reschedule & reply & SMS confirmation subscribers
  registerSubscriber('RESCHEDULE_BOOKING', onRescheduleBookingSubscriber.handle);
  registerSubscriber('STAFF_REPLIED_TO_CHAT', onStaffReplySubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_SMS', onManualBookingSmsSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS', onManualBookingSmsSubscriber.handle);
  
  // 24h & 48h Reminders
  registerSubscriber('APPOINTMENT_REMINDER_24H', onAppointmentReminder24hSubscriber.handle);
  registerSubscriber('APPOINTMENT_REMINDER_48H', onAppointmentReminder48hSubscriber.handle);
  registerSubscriber('APPOINTMENT_REMINDER_24H_SMS', onAppointmentReminder24hSmsSubscriber.handle);
  registerSubscriber('APPOINTMENT_REMINDER_48H_SMS', onAppointmentReminder48hSmsSubscriber.handle);

  // Post-Care Review Request (Email & SMS)
  registerSubscriber('APPOINTMENT_COMPLETED_POST_CARE', onPostCareReviewSubscriber.handle);
  registerSubscriber('APPOINTMENT_COMPLETED_POST_CARE_SMS', onPostCareReviewSmsSubscriber.handle);
};
