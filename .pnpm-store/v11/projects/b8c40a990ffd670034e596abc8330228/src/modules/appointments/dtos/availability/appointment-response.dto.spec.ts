import { describe, it, expect } from 'vitest';
import { appointmentResponseSchema } from './appointment-response.dto';

describe('appointmentResponseSchema', () => {
  const validRecord = {
    id: '11111111-1111-1111-8111-111111111111',
    start_time: '2024-12-25T10:00:00Z',
    end_time: '2024-12-25T10:30:00Z',
    doctor_id: '22222222-2222-2222-8222-222222222222',
    status: 'APPROVED',
    date: '2024-12-25',
  };

  it('should successfully parse and transform a valid database appointment record', () => {
    const result = appointmentResponseSchema.parse(validRecord);
    expect(result).toEqual({
      id: validRecord.id,
      startTime: validRecord.start_time,
      endTime: validRecord.end_time,
      doctorId: validRecord.doctor_id,
      status: validRecord.status,
      date: validRecord.date,
    });
  });

  it('should fail validation if required fields are missing or invalid', () => {
    const invalidRecord = {
      ...validRecord,
      id: 'not-a-uuid',
    };
    expect(() => appointmentResponseSchema.parse(invalidRecord)).toThrow();
  });
});
