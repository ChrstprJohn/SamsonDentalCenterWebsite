import { describe, it, expect } from 'vitest';
import { cancelAppointmentSchema } from './cancel-appointment.dto';

describe('cancelAppointmentSchema', () => {
  it('should validate correct cancel appointment data', () => {
    const validData = {
      appointmentId: 'c3fabe0d-bd2c-4d35-acc0-48afe5b22673',
      status: 'CANCELLED',
      statusReason: 'Patient feeling sick',
    };
    expect(() => cancelAppointmentSchema.parse(validData)).not.toThrow();
  });

  it('should fail when reason is missing', () => {
    const invalidData = {
      appointmentId: 'c3fabe0d-bd2c-4d35-acc0-48afe5b22673',
      status: 'CANCELLED',
      statusReason: '',
    };
    expect(() => cancelAppointmentSchema.parse(invalidData)).toThrow();
  });
});
