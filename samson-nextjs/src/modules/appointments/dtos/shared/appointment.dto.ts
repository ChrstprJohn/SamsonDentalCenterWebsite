import { z } from 'zod';
import { appointmentStatusEnum } from '../status/update-appointment-status.dto';

export const appointmentDoctorSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  prefix: z.string().nullable().optional(),
  suffix: z.string().nullable().optional(),
});

export const appointmentServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  durationMinutes: z.number().int().nonnegative(),
});

export const appointmentPatientSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
});

export const appointmentDtoSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid().nullable().optional(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: appointmentStatusEnum,
  userNote: z.string().nullable().optional(),
  statusReason: z.string().nullable().optional(),
  rescheduleCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  doctor: appointmentDoctorSchema.nullable().optional(),
  service: appointmentServiceSchema.nullable().optional(),
  patient: appointmentPatientSchema.nullable().optional(),
});

export type AppointmentDto = z.infer<typeof appointmentDtoSchema>;

type MaybeRecord = Record<string, unknown>;

const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
const nullableStringValue = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : null;
const uuidValue = (value: unknown) => (typeof value === 'string' ? value : '');
const intValue = (value: unknown, fallback = 0) =>
  typeof value === 'number' ? value : fallback;

const mapNestedDoctor = (record: MaybeRecord): AppointmentDto['doctor'] => {
  const doctor = (record.doctor as MaybeRecord | undefined) ?? undefined;
  if (doctor) {
    return {
      id: uuidValue(doctor.id),
      firstName: stringValue(doctor.first_name ?? doctor.firstName),
      lastName: stringValue(doctor.last_name ?? doctor.lastName),
      prefix: nullableStringValue(doctor.prefix),
      suffix: nullableStringValue(doctor.suffix),
    };
  }

  if (record.doctor_id || record.doctorId) {
    return {
      id: uuidValue(record.doctor_id ?? record.doctorId),
      firstName: '',
      lastName: '',
      prefix: null,
      suffix: null,
    };
  }

  return undefined;
};

const mapNestedService = (record: MaybeRecord): AppointmentDto['service'] => {
  const service = (record.service as MaybeRecord | undefined) ?? undefined;
  if (!service) {
    return undefined;
  }

  return {
    id: uuidValue(service.id),
    name: stringValue(service.name),
    durationMinutes: intValue(service.duration_minutes ?? service.durationMinutes),
  };
};

const mapNestedPatient = (record: MaybeRecord): AppointmentDto['patient'] => {
  const patient = (record.patient as MaybeRecord | undefined) ?? undefined;
  if (!patient) {
    return undefined;
  }

  return {
    id: uuidValue(patient.id),
    firstName: stringValue(patient.first_name ?? patient.firstName),
    lastName: stringValue(patient.last_name ?? patient.lastName),
  };
};

export const mapAppointmentRecord = (record: MaybeRecord): AppointmentDto => ({
  id: uuidValue(record.id),
  patientId: record.patient_id
    ? uuidValue(record.patient_id)
    : record.user_id
      ? uuidValue(record.user_id)
      : undefined,
  serviceId: uuidValue(record.service_id ?? record.serviceId),
  doctorId: uuidValue(record.doctor_id ?? record.doctorId),
  date: stringValue(record.date),
  startTime: stringValue(record.start_time ?? record.startTime),
  endTime: stringValue(record.end_time ?? record.endTime),
  status: record.status as AppointmentDto['status'],
  userNote: nullableStringValue(record.user_note ?? record.userNote),
  statusReason: nullableStringValue(record.status_reason ?? record.statusReason),
  rescheduleCount: intValue(record.reschedule_count ?? record.rescheduleCount),
  createdAt: typeof record.created_at === 'string' ? record.created_at : undefined,
  updatedAt: typeof record.updated_at === 'string' ? record.updated_at : undefined,
  doctor: mapNestedDoctor(record),
  service: mapNestedService(record),
  patient: mapNestedPatient(record),
});

export const mapAppointmentRecords = (records: MaybeRecord[]) =>
  records.map((record) => mapAppointmentRecord(record));
