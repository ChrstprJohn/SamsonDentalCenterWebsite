import { SupabaseClient } from '@supabase/supabase-js';
import { GetAllUsersDto, UserProfileResponseDto } from '../../dtos';

export const getAllUsersQuery = (supabase: SupabaseClient) => {
  return async (params?: GetAllUsersDto): Promise<UserProfileResponseDto[]> => {
    const limit = params?.limit || 20;
    const page = params?.page || 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*')
      .range(offset, offset + limit - 1);

    if (params?.search) {
      query = query.or(`email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      isActive: u.is_active ?? true,
    }));
  };
};

// Deprecated class for backwards compatibility
export class UserManagementQueries {
  constructor(private readonly supabase: SupabaseClient) {}
  async getAllUsers(params?: GetAllUsersDto): Promise<UserProfileResponseDto[]> {
    return getAllUsersQuery(this.supabase)(params);
  }
}

