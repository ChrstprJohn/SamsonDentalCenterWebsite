import { describe, it, expect, vi } from 'vitest';
import { StaffProfileCommands } from './staff-profile.commands';
import { CreateStaffDto } from '../dtos';
import { DomainError } from '@/shared/errors';

describe('StaffProfileCommands', () => {
    const validData: CreateStaffDto = {
        firstName: 'Jane',
        middleName: null,
        lastName: 'Smith',
        suffix: null,
        email: 'jane.smith@samson.com',
        role: 'DOCTOR',
        phoneNumber: '+19876543210',
    };

    it('successfully creates a staff record', async () => {
        // 1. Arrange
        const mockInsertedRecord = {
            id: 'staff_123',
            first_name: validData.firstName,
            middle_name: validData.middleName,
            last_name: validData.lastName,
            suffix: validData.suffix,
            email: validData.email,
            role: validData.role,
            phone: validData.phoneNumber,
            created_at: new Date().toISOString(),
        };

        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockInsertedRecord, error: null }),
        };

        const commands = new StaffProfileCommands(mockSupabase as any);

        // 2. Act
        const result = await commands.createStaff('staff_123', validData);

        // 3. Assert
        expect(result).toEqual(mockInsertedRecord);
        expect(mockSupabase.from).toHaveBeenCalledWith('staff');
        expect(mockSupabase.insert).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'staff_123',
                first_name: 'Jane',
            })
        );
    });

    it('throws a DomainError if Supabase insertion fails', async () => {
        // 1. Arrange
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database constraint failed' },
            }),
        };

        const commands = new StaffProfileCommands(mockSupabase as any);

        // 2 & 3. Act & Assert
        await expect(commands.createStaff('staff_123', validData)).rejects.toThrow(DomainError);
    });
});
