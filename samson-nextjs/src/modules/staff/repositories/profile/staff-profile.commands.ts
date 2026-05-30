import { SupabaseClient } from '@supabase/supabase-js';
import { CreateStaffDto, UpdateStaffDto } from '../dtos';
import { DomainError } from '@/shared/errors';

export class StaffProfileCommands {
    constructor(private readonly supabase: SupabaseClient) {}

    async createStaff(userId: string, data: CreateStaffDto) {
        const { data: staff, error } = await this.supabase
            .from('staff')
            .insert({
                id: userId,
                email: data.email,
                first_name: data.firstName,
                middle_name: data.middleName,
                last_name: data.lastName,
                suffix: data.suffix,
                role: data.role,
                phone: data.phoneNumber,
            })
            .select('*')
            .single();

        if (error || !staff) {
            throw new DomainError(
                `Failed to create staff record: ${error?.message || 'Unknown database error'}`,
                'DATABASE_ERROR'
            );
        }

        return staff;
    }

    async updateStaff(id: string, data: Partial<UpdateStaffDto>) {
        const payload: Record<string, any> = {};
        if (data.email) payload.email = data.email;
        if (data.firstName) payload.first_name = data.firstName;
        if (data.lastName) payload.last_name = data.lastName;
        if (data.middleName !== undefined) payload.middle_name = data.middleName;
        if (data.suffix !== undefined) payload.suffix = data.suffix;
        if (data.role) payload.role = data.role;
        if (data.phoneNumber) payload.phone = data.phoneNumber;

        const { data: staff, error } = await this.supabase
            .from('staff')
            .update(payload)
            .eq('id', id)
            .select('*')
            .single();

        if (error || !staff) {
            throw new DomainError(
                `Failed to update staff record: ${error?.message || 'Unknown database error'}`,
                'DATABASE_ERROR'
            );
        }

        return staff;
    }

    async terminateStaff(id: string) {
        const { error } = await this.supabase.from('staff').delete().eq('id', id);

        if (error) {
            throw new DomainError(
                `Failed to terminate staff record: ${error?.message || 'Unknown database error'}`,
                'DATABASE_ERROR'
            );
        }

        return { success: true, id };
    }
}
