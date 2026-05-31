import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateStaffDto,
  StaffProfileDto,
  UpdateStaffDto,
  staffProfileSchema,
} from '../../dtos';
import { DomainError } from '@/shared/errors';

export const createStaffCommand = (supabase: SupabaseClient) => {
  return async (userId: string, data: CreateStaffDto): Promise<StaffProfileDto> => {
    const { data: staff, error } = await supabase
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

    return staffProfileSchema.parse(staff);
  };
};

export const updateStaffCommand = (supabase: SupabaseClient) => {
  return async (id: string, data: Partial<UpdateStaffDto>): Promise<StaffProfileDto> => {
    const payload: Record<string, string | null | undefined> = {};
    if (data.email) payload.email = data.email;
    if (data.firstName) payload.first_name = data.firstName;
    if (data.lastName) payload.last_name = data.lastName;
    if (data.middleName !== undefined) payload.middle_name = data.middleName;
    if (data.suffix !== undefined) payload.suffix = data.suffix;
    if (data.role) payload.role = data.role;
    if (data.phoneNumber) payload.phone = data.phoneNumber;

    const { data: staff, error } = await supabase
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

    return staffProfileSchema.parse(staff);
  };
};

export const terminateStaffCommand = (supabase: SupabaseClient) => {
  return async (id: string) => {
    const { error } = await supabase.from('staff').delete().eq('id', id);

    if (error) {
      throw new DomainError(
        `Failed to terminate staff record: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return { success: true, id };
  };
};

// Deprecated class for backwards compatibility
export class StaffProfileCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  async createStaff(userId: string, data: CreateStaffDto): Promise<StaffProfileDto> {
    return createStaffCommand(this.supabase)(userId, data);
  }

  async updateStaff(id: string, data: Partial<UpdateStaffDto>): Promise<StaffProfileDto> {
    return updateStaffCommand(this.supabase)(id, data);
  }

  async terminateStaff(id: string) {
    return terminateStaffCommand(this.supabase)(id);
  }
}

