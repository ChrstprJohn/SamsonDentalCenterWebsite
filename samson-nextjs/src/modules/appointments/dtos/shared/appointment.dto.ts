import { z } from 'zod';
import { appointmentStatusEnum } from '../status/update-appointment-status.dto';

export const appointmentDoctorSchema = z.preprocess(
  (val: any) => {
    if (!val || typeof val !== 'object') return val;
    return {
      id: val.id,
      firstName: val.first_name ?? val.firstName,
      lastName: val.last_name ?? val.lastName,
      prefix: val.prefix,
      suffix: val.suffix,
    };
  },
  z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    prefix: z.string().nullable().optional(),
    suffix: z.string().nullable().optional(),
  })
);

export const appointmentServiceSchema = z.preprocess(
  (val: any) => {
    if (!val || typeof val !== 'object') return val;
    return {
      id: val.id,
      name: val.name,
      durationMinutes: val.duration_minutes ?? val.durationMinutes,
    };
  },
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    durationMinutes: z.number().int().nonnegative(),
  })
);

export const appointmentPatientSchema = z.preprocess(
  (val: any) => {
    if (!val || typeof val !== 'object') return val;
    return {
      id: val.id,
      firstName: val.first_name ?? val.firstName,
      lastName: val.last_name ?? val.lastName,
    };
  },
  z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  })
);

export const appointmentDtoSchema = z.preprocess(
  (record: any) => {
    if (!record || typeof record !== 'object') return record;
    const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
    const nullableStringValue = (value: unknown) =>
      typeof value === 'string' && value.length > 0 ? value : null;
    const intValue = (value: unknown, fallback = 0) =>
      typeof value === 'number' ? value : fallback;

    let doctorData = record.doctor;
    if (!doctorData && (record.doctor_id || record.doctorId)) {
      doctorData = {
        id: record.doctor_id ?? record.doctorId,
        firstName: '',
        lastName: '',
        prefix: null,
        suffix: null,
      };
    }

    return {
      id: record.id,
      patientId: record.patient_id ?? record.patientId ?? record.user_id ?? record.userId,
      serviceId: record.service_id ?? record.serviceId,
      doctorId: record.doctor_id ?? record.doctorId,
      date: stringValue(record.date),
      startTime: stringValue(record.start_time ?? record.startTime),
      endTime: stringValue(record.end_time ?? record.endTime),
      status: record.status,
      userNote: nullableStringValue(record.user_note ?? record.userNote),
      statusReason: nullableStringValue(record.status_reason ?? record.statusReason),
      rescheduleCount: intValue(record.reschedule_count ?? record.rescheduleCount),
      createdAt: typeof record.created_at === 'string' ? record.created_at : record.createdAt,
      updatedAt: typeof record.updated_at === 'string' ? record.updated_at : record.updatedAt,
      doctor: doctorData,
      service: record.service,
      patient: record.patient,
    };
  },
  z.object({
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
  })
);

export type AppointmentDto = z.infer<typeof appointmentDtoSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapAppointmentRecord = (record: MaybeRecord): AppointmentDto => {
  return appointmentDtoSchema.parse(record);
};

export const mapAppointmentRecords = (records: MaybeRecord[]): AppointmentDto[] =>
  records.map((record) => mapAppointmentRecord(record));

