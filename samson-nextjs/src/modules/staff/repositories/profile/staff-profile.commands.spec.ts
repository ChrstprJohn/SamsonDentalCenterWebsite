import { describe, it, expect, vi } from 'vitest';
import { createStaffCommand, updateStaffCommand, terminateStaffCommand } from './staff-profile.commands';
import { CreateStaffDto } from '../../dtos';
import { DomainError } from '@/shared/errors';

describe('StaffProfileCommands (Functional)', () => {
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
            id: '123e4567-e89b-12d3-a456-426614174000',
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

        const createStaff = createStaffCommand(mockSupabase as any);

        // 2. Act
        const result = await createStaff('123e4567-e89b-12d3-a456-426614174000', validData);

        // 3. Assert
        expect(result).toEqual({
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: validData.email,
            firstName: validData.firstName,
            middleName: validData.middleName,
            lastName: validData.lastName,
            suffix: validData.suffix,
            phoneNumber: validData.phoneNumber,
            role: validData.role,
            createdAt: mockInsertedRecord.created_at,
            updatedAt: undefined,
        });
        expect(mockSupabase.from).toHaveBeenCalledWith('staff');
        expect(mockSupabase.insert).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '123e4567-e89b-12d3-a456-426614174000',
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

        const createStaff = createStaffCommand(mockSupabase as any);

        // 2 & 3. Act & Assert
        await expect(createStaff('123e4567-e89b-12d3-a456-426614174000', validData)).rejects.toThrow(DomainError);
    });

    describe('updateStaff', () => {
        it('successfully updates a staff record', async () => {
            const mockUpdatedRecord = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'new@email.com',
                first_name: 'Jane',
                last_name: 'Smith',
                role: 'SECRETARY',
            };
            const mockSupabase = {
                from: vi.fn().mockReturnThis(),
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockUpdatedRecord, error: null }),
            };
            const updateStaff = updateStaffCommand(mockSupabase as any);

            const result = await updateStaff('123e4567-e89b-12d3-a456-426614174000', { email: 'new@email.com' });

            expect(result).toEqual({
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'new@email.com',
                firstName: 'Jane',
                middleName: null,
                lastName: 'Smith',
                suffix: null,
                phoneNumber: null,
                role: 'SECRETARY',
                createdAt: undefined,
                updatedAt: undefined,
            });
            expect(mockSupabase.update).toHaveBeenCalledWith({ email: 'new@email.com' });
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
        });

        it('throws DomainError on database error', async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnThis(),
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi
                    .fn()
                    .mockResolvedValue({ data: null, error: { message: 'Network error' } }),
            };
            const updateStaff = updateStaffCommand(mockSupabase as any);

            await expect(
                updateStaff('123e4567-e89b-12d3-a456-426614174000', { email: 'new@email.com' })
            ).rejects.toThrow(DomainError);
        });
    });

    describe('terminateStaff', () => {
        it('successfully deletes a staff record', async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnThis(),
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ error: null }),
            };
            const terminateStaff = terminateStaffCommand(mockSupabase as any);

            const result = await terminateStaff('123e4567-e89b-12d3-a456-426614174000');

            expect(result).toEqual({ success: true, id: '123e4567-e89b-12d3-a456-426614174000' });
            expect(mockSupabase.delete).toHaveBeenCalled();
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
        });
    });
});
