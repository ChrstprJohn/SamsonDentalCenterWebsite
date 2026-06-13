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
      status: 'PENDING'
    };
    
    const mapped = mapAppointmentRecord(record);
    const result = appointmentDtoSchema.safeParse(record);
    expect(result.success).toBe(true);
  });
});
