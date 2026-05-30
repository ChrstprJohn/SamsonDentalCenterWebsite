import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export class DoctorServicesCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Maps a doctor ID to an array of service IDs in the database.
   */
  async assignDoctorServices(doctorId: string, serviceIds: string[]): Promise<boolean> {
    // 1. Delete all existing mappings for the doctor
    const { error: deleteError } = await this.supabase
      .from('doctor_services')
      .delete()
      .eq('doctor_id', doctorId);

    if (deleteError) {
      throw new DomainError(
        `Failed to clear existing doctor services: ${deleteError.message}`,
        'DATABASE_ERROR'
      );
    }

    // 2. If there are services to map, insert them
    if (serviceIds.length > 0) {
      const payload = serviceIds.map((serviceId) => ({
        doctor_id: doctorId,
        service_id: serviceId,
      }));

      const { error: insertError } = await this.supabase
        .from('doctor_services')
        .insert(payload);

      if (insertError) {
        throw new DomainError(
          `Failed to assign new doctor services: ${insertError.message}`,
          'DATABASE_ERROR'
        );
      }
    }

    return true;
  }
}
