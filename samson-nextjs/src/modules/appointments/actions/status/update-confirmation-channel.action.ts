'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';

const updateConfirmationChannelSchema = z.object({
  appointmentId: z.string().uuid(),
  confirmationChannel: z.enum(['EMAIL', 'SMS', 'BOTH', 'NONE']),
});

export async function updateConfirmationChannelAction(input: {
  appointmentId: string;
  confirmationChannel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
}) {
  try {
    const parsed = updateConfirmationChannelSchema.parse(input);
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;

    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    const supabaseAdmin = await createAdminClient();
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({ confirmation_channel: parsed.confirmationChannel })
      .eq('id', parsed.appointmentId);

    if (error) {
      throw new DomainError(`Failed to update confirmation channel: ${error.message}`, 'DATABASE_ERROR');
    }

    return { success: true };
  } catch (error: any) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
}
