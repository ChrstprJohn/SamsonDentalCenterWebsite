import { describe, it, expect } from 'vitest';
import { updateStaffSchema } from './update-staff.dto';

describe('updateStaffSchema', () => {
    const validBaseData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should validate when only the ID is provided (all other fields optional)', () => {
        const result = updateStaffSchema.safeParse(validBaseData);
        expect(result.success).toBe(true);
    });

    it('should format fields correctly (trim and lowercase email)', () => {
        const data = {
            ...validBaseData,
            email: ' TEST@Samson.com ',
            firstName: ' John ',
        };
        const result = updateStaffSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.email).toBe('test@samson.com');
            expect(result.data.firstName).toBe('John');
        }
    });

    it('should fail if ID is not a valid UUID', () => {
        const data = { id: 'invalid-id' };
        const result = updateStaffSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('should fail if phone number format is invalid', () => {
        const data = { ...validBaseData, phoneNumber: 'invalid-phone' };
        const result = updateStaffSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('should validate successfully with a valid role', () => {
        const data = { ...validBaseData, role: 'DOCTOR' };
        const result = updateStaffSchema.safeParse(data);
        expect(result.success).toBe(true);
    });
});
