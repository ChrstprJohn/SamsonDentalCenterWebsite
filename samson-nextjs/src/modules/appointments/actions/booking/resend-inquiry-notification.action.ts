'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { outboxCommands } from '@/shared/outbox/outbox.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

const resendInquiryNotificationSchema = z.object({
  inquiryId: z.string().uuid(),
  eventType: z.enum(['APPOINTMENT_INQUIRY_RECEIVED', 'REJECT_INQUIRY']),
});

export async function resendInquiryNotificationAction(input: {
  inquiryId: string;
  eventType: 'APPOINTMENT_INQUIRY_RECEIVED' | 'REJECT_INQUIRY';
}) {
  try {
    const { inquiryId, eventType } = resendInquiryNotificationSchema.parse(input);
    await authorizeRole('SECRETARY');

    const supabaseAdmin = await createAdminClient();

    const { data: inquiry, error: fetchErr } = await supabaseAdmin
      .from('appointment_inquiries')
      .select('*')
      .eq('id', inquiryId)
      .maybeSingle();

    if (fetchErr || !inquiry) {
      return { success: false, error: 'Inquiry not found.' };
    }

    if (!inquiry.email?.trim()) {
      return { success: false, error: 'Inquiry has no contact email.' };
    }

    const outbox = outboxCommands(supabaseAdmin);
    let eventPayload: Record<string, any> = {};

    if (eventType === 'APPOINTMENT_INQUIRY_RECEIVED') {
      eventPayload = {
        inquiryId: inquiry.id,
        firstName: inquiry.first_name || '',
        lastName: inquiry.last_name || '',
        email: inquiry.email,
        phoneNumber: inquiry.phone_number || '',
        preferredServiceId: inquiry.preferred_service_id,
        preferredDate: inquiry.preferred_date,
        preferredStartTime: inquiry.preferred_start_time,
      };
    } else {
      const patientName = `${inquiry.first_name || ''} ${inquiry.last_name || ''}`.trim() || 'Valued Patient';
      const reason = inquiry.secretary_notes || 'Unfortunately, we are unable to accommodate your inquiry at this time.';
      eventPayload = {
        inquiryId: inquiry.id,
        recipientEmail: inquiry.email,
        patientName,
        rejectionReason: reason,
      };
    }

    const event = await outbox.emitEvent(eventType, eventPayload);
    bootstrapEventSubscribers();
    await globalOutboxDispatcher(supabaseAdmin, false, event.id)();

    return {
      success: true,
      message: `${eventType === 'REJECT_INQUIRY' ? 'Rejection' : 'Inquiry receipt'} email sent to ${inquiry.email}.`,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: `Validation failed: ${error.issues[0].message}` };
    }
    console.error('[resendInquiryNotificationAction] Error:', error);
    return { success: false, error: error.message || 'Failed to resend inquiry notification.' };
  }
}
