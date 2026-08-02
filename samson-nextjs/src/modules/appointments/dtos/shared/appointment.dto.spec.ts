import { describe, it, expect } from 'vitest';
import { appointmentDtoSchema, mapAppointmentRecord } from './appointment.dto';

describe('AppointmentDto', () => {
  it('should map and validate correctly', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      service_id: '123e4567-e89b-12d3-a456-426614174001',
      doctor_id: '123e4567-e89b-12d3-a456-426614174002',
      date: '2026-06-01',
      start_time: '10:00:00',
      end_time: '11:00:00',
      status: 'APPROVED'
    };
    
    const mapped = mapAppointmentRecord(record);
    expect(mapped.status).toBe('APPROVED');
    expect(mapped.serviceId).toBe(record.service_id);
    expect(mapped.doctorAssignmentSource).toBe('SYSTEM'); // default value
    
    const result = appointmentDtoSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it('should map missing optional fields', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      service_id: '123e4567-e89b-12d3-a456-426614174001',
      doctor_id: '123e4567-e89b-12d3-a456-426614174002',
      date: '2026-06-01',
      start_time: '10:00:00',
      end_time: '11:00:00',
      status: 'PENDING',
      doctor_assignment_source: 'USER'
    };
    
    const mapped = mapAppointmentRecord(record);
    expect(mapped.doctorAssignmentSource).toBe('USER');
    const result = appointmentDtoSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it('should accept CHECKED_IN as a valid no_show_resolution', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      service_id: '123e4567-e89b-12d3-a456-426614174001',
      doctor_id: '123e4567-e89b-12d3-a456-426614174002',
      date: '2026-06-01',
      start_time: '10:00:00',
      end_time: '11:00:00',
      status: 'CHECKED_IN',
      no_show_resolution: 'CHECKED_IN',
      no_show_resolved_at: '2026-08-02T12:00:00.000Z',
    };

    const mapped = mapAppointmentRecord(record);
    expect(mapped.noShowResolution).toBe('CHECKED_IN');
    const result = appointmentDtoSchema.safeParse(record);
    expect(result.success).toBe(true);
  });
});
