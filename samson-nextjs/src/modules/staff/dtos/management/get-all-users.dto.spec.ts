import { describe, it, expect } from 'vitest';
import { getAllUsersSchema, userProfileResponseSchema } from './get-all-users.dto';

describe('GetAllUsersDto', () => {
  it('should validate params', () => {
    const result = getAllUsersSchema.safeParse({ page: 1, limit: 10 });
    expect(result.success).toBe(true);
  });

  it('should validate response', () => {
    const result = userProfileResponseSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN',
      isActive: true,
    });
    expect(result.success).toBe(true);
  });
});
