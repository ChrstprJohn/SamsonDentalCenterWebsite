import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import {
  RegisterPatientDto,
  PatientProfileDto,
  mapPatientProfile,
} from '../../dtos';

export class PatientProfileCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Registers a new patient record in the database.
   */
  async createPatient(userId: string, data: RegisterPatientDto): Promise<PatientProfileDto> {
    const { data: patient, error } = await this.supabase
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

    return mapPatientProfile(patient as Record<string, unknown>);
  }
}
