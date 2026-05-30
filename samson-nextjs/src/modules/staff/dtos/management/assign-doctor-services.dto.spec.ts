import { describe, it, expect } from 'vitest';
import { assignDoctorServicesSchema } from './assign-doctor-services.dto';

describe('AssignDoctorServicesDto', () => {
  it('should validate valid data', () => {
    const result = assignDoctorServicesSchema.safeParse({
      doctorId: '123e4567-e89b-12d3-a456-426614174000',
      serviceIds: [
        '123e4567-e89b-12d3-a456-426614174001',
        '123e4567-e89b-12d3-a456-426614174002',
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID for doctorId', () => {
    const result = assignDoctorServicesSchema.safeParse({
      doctorId: 'invalid-uuid',
      serviceIds: ['123e4567-e89b-12d3-a456-426614174001'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID for serviceIds', () => {
    const result = assignDoctorServicesSchema.safeParse({
      doctorId: '123e4567-e89b-12d3-a456-426614174000',
      serviceIds: ['invalid-uuid'],
    });
    expect(result.success).toBe(false);
  });
});
