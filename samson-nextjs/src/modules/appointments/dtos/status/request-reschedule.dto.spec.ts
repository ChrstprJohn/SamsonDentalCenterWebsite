import { describe, it, expect } from 'vitest';
import { requestRescheduleSchema } from './request-reschedule.dto';

describe('requestRescheduleSchema', () => {
  it('should validate correct reschedule request data', () => {
    const validData = {
      appointmentId: 'c3fabe0d-bd2c-4d35-acc0-48afe5b22673',
      status: 'RESCHEDULE_REQUESTED',
      statusReason: 'Need another day',
      newDate: '2026-06-01',
      newStartTime: '2026-06-01T09:00:00Z',
      newEndTime: '2026-06-01T09:30:00Z',
      newDoctorId: 'c3fabe0d-bd2c-4d35-acc0-48afe5b22673',
    };
    expect(() => requestRescheduleSchema.parse(validData)).not.toThrow();
  });

  it('should fail when reason is missing', () => {
    const invalidData = {
      appointmentId: 'c3fabe0d-bd2c-4d35-acc0-48afe5b22673',
      status: 'RESCHEDULE_REQUESTED',
      statusReason: '',
      newDate: '2026-06-01',
      newStartTime: '2026-06-01T09:00:00Z',
      newEndTime: '2026-06-01T09:30:00Z',
      newDoctorId: 'c3fabe0d-bd2c-4d35-acc0-48afe5b22673',
    };
    expect(() => requestRescheduleSchema.parse(invalidData)).toThrow();
  });
});
