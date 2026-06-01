import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { emailOutboxCommands } from '../../../emails';
import {
  RegisterPatientDto,
  PatientProfileDto,
  patientProfileSchema,
} from '../../dtos';

export const createPatientCommand = (supabaseAdmin: SupabaseClient) => {
  return async (data: RegisterPatientDto): Promise<PatientProfileDto> => {
    // 1. Sign up the user via Supabase Auth Admin and generate OTP (Link)
    // We use the admin client so we can generate the token without sending the native email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
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

    // 2. Queue the OTP email in the transactional outbox
    const otpCode = authData.properties?.email_otp;
    if (otpCode) {
      const outbox = emailOutboxCommands(supabaseAdmin);
      await outbox.queueEmail(
        data.email,
        'Your Samson Dental Center Verification Code',
        'signup_otp',
        { firstName: data.firstName, otpCode }
      );
    }

    // 3. Fetch the newly created profile from the 'users' table (inserted via Postgres Trigger)
    const { data: userProfile, error: profileError } = await supabaseAdmin
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
