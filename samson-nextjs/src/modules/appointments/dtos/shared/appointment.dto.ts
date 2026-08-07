import { z } from 'zod';
import { appointmentStatusEnum } from '../status/update-appointment-status.dto';

const appointmentDoctorDbSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  prefix: z.string().nullable().optional(),
  suffix: z.string().nullable().optional(),
});

export const appointmentDoctorSchema = appointmentDoctorDbSchema.transform((data) => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  prefix: data.prefix,
  suffix: data.suffix,
}));

const appointmentServiceDbSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  duration_minutes: z.number().int().nonnegative(),
});

export const appointmentServiceSchema = appointmentServiceDbSchema.transform((data) => ({
  id: data.id,
  name: data.name,
  durationMinutes: data.duration_minutes,
}));

const appointmentPatientDbSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
});

export const appointmentPatientSchema = appointmentPatientDbSchema.transform((data) => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  email: data.email || null,
  phone: data.phone || data.phone_number || null,
}));

const guestContactDbSchema = z.object({
  first_name: z.string(),
  middle_name: z.string().nullable().optional(),
  last_name: z.string(),
  suffix: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
});

const appointmentDbSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid().nullable().optional(),
  dependent_id: z.string().uuid().nullable().optional(),
  service_id: z.string().uuid(),
  doctor_id: z.string().uuid().nullable().optional(),
  date: z.string(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  status: appointmentStatusEnum,
  source: z.enum(['SELF_BOOKED', 'STAFF_CREATED']).optional().default('SELF_BOOKED'),
  doctor_assignment_source: z.enum(['SYSTEM', 'USER']).optional().default('SYSTEM'),
  preferred_start_time: z.string().nullable().optional(),
  proposed_preferred_start_time: z.string().nullable().optional(),
  user_note: z.string().nullable().optional(),
  status_reason: z.string().nullable().optional(),
  proposed_date: z.string().nullable().optional(),
  proposed_start_time: z.string().nullable().optional(),
  proposed_end_time: z.string().nullable().optional(),
  proposed_doctor_id: z.string().uuid().nullable().optional(),
  reschedule_count: z.number().int().nonnegative().optional().default(0),
  confirmation_channel: z.enum(['EMAIL', 'SMS', 'BOTH', 'NONE']).optional().default('EMAIL'),
  email_confirmation_sent: z.boolean().optional().default(false),
  sms_confirmation_sent: z.boolean().optional().default(false),
  email_reminder_48h_sent: z.boolean().optional().default(false),
  sms_reminder_48h_sent: z.boolean().optional().default(false),
  email_reminder_24h_sent: z.boolean().optional().default(false),
  sms_reminder_24h_sent: z.boolean().optional().default(false),
  email_checkout_sent: z.boolean().optional().default(false),
  sms_checkout_sent: z.boolean().optional().default(false),
  email_cancel_sent: z.boolean().optional().default(false),
  sms_cancel_sent: z.boolean().optional().default(false),
  email_reschedule_sent: z.boolean().optional().default(false),
  sms_reschedule_sent: z.boolean().optional().default(false),
  payment_receipt_sent: z.boolean().optional().default(false),
  no_show_resolved_at: z.string().nullable().optional(),
  no_show_resolution: z.enum(['COMPLETED', 'CONFIRMED_NO_SHOW', 'RESCHEDULE', 'CHECKED_IN']).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  doctor: appointmentDoctorDbSchema.nullable().optional(),
  service: appointmentServiceDbSchema.nullable().optional(),
  patient: appointmentPatientDbSchema.nullable().optional(),
  dependent: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    relationship: z.string(),
    date_of_birth: z.string().optional().nullable(),
  }).nullable().optional(),
  guest_contacts: z.array(guestContactDbSchema).nullable().optional(),
  status_history: z.array(z.object({
    id: z.string(),
    previous_status: z.string().nullable().optional(),
    new_status: z.string(),
    reason: z.string().nullable().optional(),
    created_at: z.string(),
    actor_role: z.string(),
  })).nullable().optional(),
});

export const appointmentDtoSchema = appointmentDbSchema.transform((data) => {
  return {
    id: data.id,
    patientId: data.patient_id || null,
    dependentId: data.dependent_id || null,
    serviceId: data.service_id,
    doctorId: data.doctor_id || null,
    date: data.date,
    startTime: data.start_time || null,
    endTime: data.end_time || null,
    status: data.status,
    source: data.source,
    doctorAssignmentSource: data.doctor_assignment_source ?? 'SYSTEM',
    preferredStartTime: data.preferred_start_time || null,
    proposedPreferredStartTime: data.proposed_preferred_start_time || null,
    userNote: data.user_note || null,
    statusReason: data.status_reason || null,
    proposedDate: data.proposed_date || null,
    proposedStartTime: data.proposed_start_time || null,
    proposedEndTime: data.proposed_end_time || null,
    proposedDoctorId: data.proposed_doctor_id || null,
    rescheduleCount: data.reschedule_count ?? 0,
    confirmationChannel: (data.confirmation_channel as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') ?? 'EMAIL',
    emailConfirmationSent: Boolean(data.email_confirmation_sent),
    smsConfirmationSent: Boolean(data.sms_confirmation_sent),
    emailReminder48hSent: Boolean(data.email_reminder_48h_sent),
    smsReminder48hSent: Boolean(data.sms_reminder_48h_sent),
    emailReminder24hSent: Boolean(data.email_reminder_24h_sent),
    smsReminder24hSent: Boolean(data.sms_reminder_24h_sent),
    emailCheckoutSent: Boolean(data.email_checkout_sent),
    smsCheckoutSent: Boolean(data.sms_checkout_sent),
    emailCancelSent: Boolean(data.email_cancel_sent),
    smsCancelSent: Boolean(data.sms_cancel_sent),
    emailRescheduleSent: Boolean(data.email_reschedule_sent),
    smsRescheduleSent: Boolean(data.sms_reschedule_sent),
    paymentReceiptSent: data.payment_receipt_sent ?? false,
    noShowResolvedAt: data.no_show_resolved_at || null,
    noShowResolution: data.no_show_resolution || null,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  doctor: data.doctor ? appointmentDoctorSchema.parse(data.doctor) : null,
  service: data.service ? appointmentServiceSchema.parse(data.service) : null,
  patient: data.patient ? appointmentPatientSchema.parse(data.patient) : null,
  dependent: data.dependent ? {
    id: data.dependent.id,
    firstName: data.dependent.first_name,
    lastName: data.dependent.last_name,
    relationship: data.dependent.relationship,
    dateOfBirth: data.dependent.date_of_birth || null,
  } : null,
  statusHistory: data.status_history ? data.status_history.map((h) => ({
    id: h.id,
    previousStatus: h.previous_status || null,
    newStatus: h.new_status,
    reason: h.reason || null,
    createdAt: h.created_at,
    actorRole: h.actor_role,
  })) : [],
  guestContact: data.guest_contacts && data.guest_contacts.length > 0 ? {
    firstName: data.guest_contacts[0].first_name,
    middleName: data.guest_contacts[0].middle_name || null,
    lastName: data.guest_contacts[0].last_name,
    suffix: data.guest_contacts[0].suffix || null,
    email: data.guest_contacts[0].email || null,
    phone: data.guest_contacts[0].phone_number || null,
  } : null,
  };
});

export type AppointmentDto = z.infer<typeof appointmentDtoSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapAppointmentRecord = (record: MaybeRecord): AppointmentDto => {
  return appointmentDtoSchema.parse(record);
};

export const mapAppointmentRecords = (records: MaybeRecord[]): AppointmentDto[] =>
  records.map((record) => mapAppointmentRecord(record));


