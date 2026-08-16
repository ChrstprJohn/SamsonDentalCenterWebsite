import { registerSubscriber } from '@/shared/outbox/outbox.registry';
import { onPatientRegisteredSubscriber } from '@/modules/emails/subscribers/on-patient-registered.subscriber';
import { onPasswordResetRequestedSubscriber } from '@/modules/emails/subscribers/on-password-reset-requested.subscriber';
import { onAppointmentBookedSubscriber } from '@/modules/emails/subscribers/on-appointment-booked.subscriber';
import { onAppointmentConvertedSubscriber } from '@/modules/emails/subscribers/on-appointment-converted.subscriber';
import { onManualBookingGuestSubscriber } from '@/modules/emails/subscribers/on-manual-booking-guest.subscriber';
import { onManualBookingPatientSubscriber } from '@/modules/emails/subscribers/on-manual-booking-patient.subscriber';
import { onEmailFailedSubscriber } from '@/modules/notifications/subscribers/on-email-failed.subscriber';
import { onCancelBookingSubscriber as onCancelBookingEmailSubscriber } from '@/modules/emails/subscribers/on-cancel-booking.subscriber';
import { onRescheduleBookingSubscriber } from '@/modules/emails/subscribers/on-reschedule-booking.subscriber';
import { onStaffReplySubscriber } from '@/modules/emails/subscribers/on-staff-reply.subscriber';
import { onManualBookingSmsSubscriber } from '@/modules/emails/subscribers/on-manual-booking-sms.subscriber';
import { onAppointmentReminder24hSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-24h.subscriber';
import { onAppointmentReminder48hSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-48h.subscriber';
import { onAppointmentReminder24hSmsSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-24h-sms.subscriber';
import { onAppointmentReminder48hSmsSubscriber } from '@/modules/emails/subscribers/on-appointment-reminder-48h-sms.subscriber';
import { onPostCareReviewSubscriber } from '@/modules/emails/subscribers/on-post-care-review.subscriber';
import { onCheckoutFollowUpSubscriber } from '@/modules/emails/subscribers/on-checkout-follow-up.subscriber';
import { onPostCareReviewSmsSubscriber } from '@/modules/emails/subscribers/on-post-care-review-sms.subscriber';
import { onNoShowSubscriber } from '@/modules/emails/subscribers/on-no-show.subscriber';
import { onNoShowSmsSubscriber } from '@/modules/emails/subscribers/on-no-show-sms.subscriber';
import { onRequestRejectedSubscriber } from '@/modules/emails/subscribers/on-request-rejected.subscriber';
import { onInquirySubmittedSubscriber } from '@/modules/emails/subscribers/on-inquiry-submitted.subscriber';

import { onCancelBookingSmsSubscriber } from '@/modules/notifications/subscribers/on-cancel-booking-sms.subscriber';
import { onRescheduleBookingSmsSubscriber } from '@/modules/notifications/subscribers/on-reschedule-booking-sms.subscriber';

export const bootstrapEventSubscribers = () => {
  registerSubscriber('PATIENT_REGISTERED', onPatientRegisteredSubscriber.handle);
  registerSubscriber('PASSWORD_RESET_REQUESTED', onPasswordResetRequestedSubscriber.handle);
  registerSubscriber('APPOINTMENT_BOOKED', onAppointmentBookedSubscriber.handle);
  registerSubscriber('APPOINTMENT_INQUIRY_RECEIVED', onInquirySubmittedSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY', onAppointmentConvertedSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT', onManualBookingPatientSubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_GUEST', onManualBookingGuestSubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_PATIENT', onManualBookingPatientSubscriber.handle);

  // Email-failed alert (ops: guest email failed, manual resend needed)
  registerSubscriber('EMAIL_FAILED', onEmailFailedSubscriber.handle);

  // Cancel subscribers
  registerSubscriber('CANCEL_BOOKING', onCancelBookingEmailSubscriber.handle);
  registerSubscriber('CANCEL_BOOKING_SMS', onCancelBookingSmsSubscriber.handle);
  
  // Reschedule & reply & SMS confirmation subscribers
  registerSubscriber('RESCHEDULE_BOOKING', onRescheduleBookingSubscriber.handle);
  registerSubscriber('RESCHEDULE_BOOKING_SMS', onRescheduleBookingSmsSubscriber.handle);
  registerSubscriber('STAFF_REPLIED_TO_CHAT', onStaffReplySubscriber.handle);
  registerSubscriber('APPOINTMENT_MANUALLY_BOOKED_SMS', onManualBookingSmsSubscriber.handle);
  registerSubscriber('APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS', onManualBookingSmsSubscriber.handle);

  // Request Rejected subscribers
  registerSubscriber('REJECT_INQUIRY', onRequestRejectedSubscriber.handle);
  registerSubscriber('BOOKING_REJECTED', onRequestRejectedSubscriber.handle);
  
  // 24h & 48h Reminders
  registerSubscriber('APPOINTMENT_REMINDER_24H', onAppointmentReminder24hSubscriber.handle);
  registerSubscriber('APPOINTMENT_REMINDER_48H', onAppointmentReminder48hSubscriber.handle);
  registerSubscriber('APPOINTMENT_REMINDER_24H_SMS', onAppointmentReminder24hSmsSubscriber.handle);
  registerSubscriber('APPOINTMENT_REMINDER_48H_SMS', onAppointmentReminder48hSmsSubscriber.handle);

  // Post-Care Review Request (Email & SMS)
  registerSubscriber('APPOINTMENT_COMPLETED_POST_CARE', onPostCareReviewSubscriber.handle);
  registerSubscriber('APPOINTMENT_COMPLETED_POST_CARE_SMS', onPostCareReviewSmsSubscriber.handle);

  // 48h Checkout Follow-Up (Kamusta wellbeing check-in, email only)
  registerSubscriber('APPOINTMENT_CHECKOUT_FOLLOW_UP', onCheckoutFollowUpSubscriber.handle);

  // Missed Appointment No-show (Email & SMS)
  registerSubscriber('APPOINTMENT_NO_SHOW', onNoShowSubscriber.handle);
  registerSubscriber('APPOINTMENT_NO_SHOW_SMS', onNoShowSmsSubscriber.handle);
};
