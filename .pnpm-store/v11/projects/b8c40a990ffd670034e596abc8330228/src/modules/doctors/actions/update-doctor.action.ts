'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { doctorFormSchema } from '../hooks/use-doctor-form-schema';
import { ActionResponse } from '@/shared/utils/action-response';

const updateDoctorSchema = doctorFormSchema.extend({
  id: z.string().uuid(),
});

export async function updateDoctorAction(
  payload: z.infer<typeof updateDoctorSchema>
): Promise<ActionResponse<any>> {
  try {
    const validatedData = updateDoctorSchema.parse(payload);
    const supabaseAdmin = await createAdminClient();
    const doctorId = validatedData.id;

    // 1. Update Auth user metadata & email
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      doctorId,
      {
        email: validatedData.email,
        email_confirm: true,
        user_metadata: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          middle_name: validatedData.middleName || null,
          suffix: validatedData.suffix || null,
          phone: validatedData.phoneNumber,
          specialization: validatedData.specialization,
          status: validatedData.status,
          is_active: validatedData.status !== 'ARCHIVED',
          // Trigger compatibility keys:
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          middleName: validatedData.middleName || null,
          phoneNumber: validatedData.phoneNumber,
        },
      }
    );

    if (authUpdateError) {
      return {
        success: false,
        error: authUpdateError.message || 'Failed to update authentication metadata',
      };
    }

    // 2. Update users profile row
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        email: validatedData.email,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        middle_name: validatedData.middleName || null,
        suffix: validatedData.suffix || null,
        phone_number: validatedData.phoneNumber,
        status: validatedData.status,
        is_active: validatedData.status !== 'ARCHIVED',
      })
      .eq('id', doctorId);

    if (userUpdateError) {
      return {
        success: false,
        error: userUpdateError.message || 'Failed to update database profile',
      };
    }

    // 3. Update services mapping (clear + insert new mappings)
    const { error: deleteServicesError } = await supabaseAdmin
      .from('doctor_services')
      .delete()
      .eq('doctor_id', doctorId);

    if (deleteServicesError) {
      return {
        success: false,
        error: deleteServicesError.message || 'Failed to clear doctor services mappings',
      };
    }

    if (validatedData.serviceIds && validatedData.serviceIds.length > 0) {
      const servicesPayload = validatedData.serviceIds.map((serviceId) => ({
        doctor_id: doctorId,
        service_id: serviceId,
      }));

      const { error: insertServicesError } = await supabaseAdmin
        .from('doctor_services')
        .insert(servicesPayload);

      if (insertServicesError) {
        return {
          success: false,
          error: insertServicesError.message || 'Failed to map new doctor services',
        };
      }
    }

    return {
      success: true,
      data: {
        id: doctorId,
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    console.error('UPDATE DOCTOR ERROR:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}
