import { describe, it, expect } from 'vitest';
import { doctorScheduleResponseSchema } from './doctor-schedule-response.dto';

describe('doctorScheduleResponseSchema', () => {
  const validRecord = {
    id: '11111111-1111-1111-8111-111111111111',
    doctor_id: '22222222-2222-2222-8222-222222222222',
    day_of_week: 3,
    start_time: '09:00:00',
    end_time: '17:00:00',
    break_start_time: '12:00:00',
    break_end_time: '13:00:00',
  };

  it('should successfully parse and transform a valid database schedule record without doctor details', () => {
    const result = doctorScheduleResponseSchema.parse(validRecord);
    expect(result).toEqual({
      id: validRecord.id,
      doctorId: validRecord.doctor_id,
      dayOfWeek: validRecord.day_of_week,
      startTime: validRecord.start_time,
      endTime: validRecord.end_time,
      breakStartTime: validRecord.break_start_time,
      breakEndTime: validRecord.break_end_time,
      doctorName: undefined,
    });
  });

  it('should successfully parse and transform a valid record with joined doctor details', () => {
    const recordWithDoctor = {
      ...validRecord,
      doctor: {
        first_name: 'Jane',
        last_name: 'Doe',
      },
    };
    const result = doctorScheduleResponseSchema.parse(recordWithDoctor);
    expect(result).toEqual({
      id: validRecord.id,
      doctorId: validRecord.doctor_id,
      dayOfWeek: validRecord.day_of_week,
      startTime: validRecord.start_time,
      endTime: validRecord.end_time,
      breakStartTime: validRecord.break_start_time,
      breakEndTime: validRecord.break_end_time,
      doctorName: 'Dr. Jane Doe',
    });
  });

  it('should fail validation if required fields are missing or invalid', () => {
    const invalidRecord = {
      ...validRecord,
      doctor_id: 'not-a-uuid',
    };
    expect(() => doctorScheduleResponseSchema.parse(invalidRecord)).toThrow();
  });
});
