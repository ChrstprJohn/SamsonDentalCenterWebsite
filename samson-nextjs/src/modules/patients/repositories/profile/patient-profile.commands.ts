import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import {
  RegisterPatientDto,
  PatientProfileDto,
  patientProfileSchema,
} from '../../dtos';

export const createPatientCommand = (supabase: SupabaseClient) => {
  return async (userId: string, data: RegisterPatientDto): Promise<PatientProfileDto> => {
    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        id: userId,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phoneNumber,
        date_of_birth: data.dateOfBirth,
      })
      .select('*')
      .single();

    if (error || !patient) {
      throw new DomainError(
        `Failed to register patient: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return patientProfileSchema.parse(patient);
  };
};

// Deprecated class for backwards compatibility
export class PatientProfileCommands {
  constructor(private readonly supabase: SupabaseClient) {}
  async createPatient(userId: string, data: RegisterPatientDto): Promise<PatientProfileDto> {
    return createPatientCommand(this.supabase)(userId, data);
  }
}

