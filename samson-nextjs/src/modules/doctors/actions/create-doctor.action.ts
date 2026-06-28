'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { doctorFormSchema } from '../hooks/use-doctor-form-schema';
import { ActionResponse } from '@/shared/utils/action-response';

export async function createDoctorAction(
  payload: z.infer<typeof doctorFormSchema>
): Promise<ActionResponse<any>> {
  try {
    const validatedData = doctorFormSchema.parse(payload);
    const supabaseAdmin = await createAdminClient();

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.defaultPassword || 'Welcome@Samson2026',
      email_confirm: true,
      user_metadata: {
        role: 'DOCTOR',
        status: 'FORCE_PASSWORD_CHANGE',
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        middle_name: validatedData.middleName || null,
        suffix: validatedData.suffix || null,
        phone: validatedData.phoneNumber,
        specialization: validatedData.specialization,
        // Trigger compatibility keys:
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        middleName: validatedData.middleName || null,
        phoneNumber: validatedData.phoneNumber,
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Failed to create authentication account',
      };
    }

    const doctorId = authData.user.id;

    // 1.5 Update database profile role to DOCTOR and name/phone fields
    const { error: dbUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        role: 'DOCTOR',
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        middle_name: validatedData.middleName || null,
        suffix: validatedData.suffix || null,
        phone_number: validatedData.phoneNumber,
        is_active: true,
      })
      .eq('id', doctorId);

    if (dbUpdateError) {
      console.error('Failed to update doctor role in database:', dbUpdateError);
      return {
        success: false,
        error: dbUpdateError.message || 'Failed to update database profile role',
      };
    }

    // 2. Add services mapping
    if (validatedData.serviceIds && validatedData.serviceIds.length > 0) {
      const servicesPayload = validatedData.serviceIds.map((serviceId) => ({
        doctor_id: doctorId,
        service_id: serviceId,
      }));

      const { error: servicesError } = await supabaseAdmin
        .from('doctor_services')
        .insert(servicesPayload);

      if (servicesError) {
        console.error('Failed to map doctor services:', servicesError);
      }
    }

    // 3. Add default schedule (Mon-Fri 8am-5pm)
    const defaultSchedules = [1, 2, 3, 4, 5].map((day) => ({
      doctor_id: doctorId,
      day_of_week: day,
      start_time: '08:00:00',
      end_time: '17:00:00',
      break_start_time: '12:00:00',
      break_end_time: '13:00:00',
    }));

    const { error: scheduleError } = await supabaseAdmin
      .from('doctor_schedules')
      .insert(defaultSchedules);

    if (scheduleError) {
      console.error('Failed to initialize doctor schedules:', scheduleError);
    }

    return {
      success: true,
      data: {
        id: doctorId,
        email: validatedData.email,
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
    console.error('CREATE DOCTOR ERROR:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}
