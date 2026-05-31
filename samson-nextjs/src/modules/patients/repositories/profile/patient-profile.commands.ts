import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import {
  RegisterPatientDto,
  PatientProfileDto,
  patientProfileSchema,
} from '../../dtos';

export const createPatientCommand = (supabase: SupabaseClient) => {
  return async (data: RegisterPatientDto): Promise<PatientProfileDto> => {
    // 1. Sign up the user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          role: 'PATIENT' // Metadata for the trigger
        }
      }
    });

    if (authError || !authData.user) {
      throw new DomainError(
        `Failed to register patient: ${authError?.message || 'Unknown authentication error'}`,
        'AUTH_ERROR'
      );
    }

    // 2. Fetch the newly created profile from the 'users' table (inserted via Postgres Trigger)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      // Fallback construction in case of trigger lag
      return patientProfileSchema.parse({
        id: authData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        date_of_birth: data.dateOfBirth,
        role: 'PATIENT',
        is_active: true,
      });
    }

    return patientProfileSchema.parse(userProfile);
  };
};

// Deprecated class for backwards compatibility
export class PatientProfileCommands {
  constructor(private readonly supabase: SupabaseClient) {}
  async createPatient(data: RegisterPatientDto): Promise<PatientProfileDto> {
    return createPatientCommand(this.supabase)(data);
  }
}
