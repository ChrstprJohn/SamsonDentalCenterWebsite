'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';

const updateGuestContactSchema = z.object({
  appointmentId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().default(''),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().default(''),
});

export type UpdateGuestContactDto = z.infer<typeof updateGuestContactSchema>;

export async function updateGuestContactAction(data: UpdateGuestContactDto) {
  try {
    await authorizeRole('SECRETARY');

    const parsed = updateGuestContactSchema.parse(data);
    const supabase = await createClient();

    const { error } = await supabase
      .from('guest_contacts')
      .update({
        first_name: parsed.firstName,
        middle_name: parsed.middleName || null,
        last_name: parsed.lastName,
        suffix: parsed.suffix || null,
        email: parsed.email || null,
        phone_number: parsed.phone,
      })
      .eq('appointment_id', parsed.appointmentId);

    if (error) {
      throw new DomainError(`Failed to update guest contact: ${error.message}`, 'DATABASE_ERROR');
    }

    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (updateGuestContact):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
