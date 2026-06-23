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
});

export const appointmentPatientSchema = appointmentPatientDbSchema.transform((data) => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
}));

const appointmentDbSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid().nullable().optional(),
  dependent_id: z.string().uuid().nullable().optional(),
  service_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  status: appointmentStatusEnum,
  source: z.enum(['SELF_BOOKED', 'STAFF_CREATED']).optional().default('SELF_BOOKED'),
  user_note: z.string().nullable().optional(),
  status_reason: z.string().nullable().optional(),
  proposed_date: z.string().nullable().optional(),
  proposed_start_time: z.string().nullable().optional(),
  proposed_end_time: z.string().nullable().optional(),
  proposed_doctor_id: z.string().uuid().nullable().optional(),
  reschedule_count: z.number().int().nonnegative().optional().default(0),
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
  status_history: z.array(z.object({
    id: z.string(),
    previous_status: z.string().nullable().optional(),
    new_status: z.string(),
    reason: z.string().nullable().optional(),
    created_at: z.string(),
    actor_role: z.string(),
  })).nullable().optional(),
});

export const appointmentDtoSchema = appointmentDbSchema.transform((data) => ({
  id: data.id,
  patientId: data.patient_id || null,
  dependentId: data.dependent_id || null,
  serviceId: data.service_id,
  doctorId: data.doctor_id,
  date: data.date,
  startTime: data.start_time,
  endTime: data.end_time,
  status: data.status,
  source: data.source,
  userNote: data.user_note || null,
  statusReason: data.status_reason || null,
  proposedDate: data.proposed_date || null,
  proposedStartTime: data.proposed_start_time || null,
  proposedEndTime: data.proposed_end_time || null,
  proposedDoctorId: data.proposed_doctor_id || null,
  rescheduleCount: data.reschedule_count ?? 0,
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
}));

export type AppointmentDto = z.infer<typeof appointmentDtoSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapAppointmentRecord = (record: MaybeRecord): AppointmentDto => {
  return appointmentDtoSchema.parse(record);
};

export const mapAppointmentRecords = (records: MaybeRecord[]): AppointmentDto[] =>
  records.map((record) => mapAppointmentRecord(record));


