import { SupabaseClient } from '@supabase/supabase-js';
import { CreateStaffDto } from '../dtos';
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
}
