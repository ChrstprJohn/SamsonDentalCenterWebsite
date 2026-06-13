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
  service_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  status: appointmentStatusEnum,
  user_note: z.string().nullable().optional(),
  status_reason: z.string().nullable().optional(),
  reschedule_count: z.number().int().nonnegative().optional().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  doctor: appointmentDoctorDbSchema.nullable().optional(),
  service: appointmentServiceDbSchema.nullable().optional(),
  patient: appointmentPatientDbSchema.nullable().optional(),
});

export const appointmentDtoSchema = appointmentDbSchema.transform((data) => ({
  id: data.id,
  patientId: data.patient_id,
  serviceId: data.service_id,
  doctorId: data.doctor_id,
  date: data.date,
  startTime: data.start_time,
  endTime: data.end_time,
  status: data.status,
  userNote: data.user_note || null,
  statusReason: data.status_reason || null,
  rescheduleCount: data.reschedule_count ?? 0,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  doctor: data.doctor ? appointmentDoctorSchema.parse(data.doctor) : null,
  service: data.service ? appointmentServiceSchema.parse(data.service) : null,
  patient: data.patient ? appointmentPatientSchema.parse(data.patient) : null,
}));

export type AppointmentDto = z.infer<typeof appointmentDtoSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapAppointmentRecord = (record: MaybeRecord): AppointmentDto => {
  return appointmentDtoSchema.parse(record);
};

export const mapAppointmentRecords = (records: MaybeRecord[]): AppointmentDto[] =>
  records.map((record) => mapAppointmentRecord(record));


