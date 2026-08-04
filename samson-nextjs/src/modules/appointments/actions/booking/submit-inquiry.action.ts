'use server';

import { createAdminClient } from '@/shared/database/server';
import { submitInquirySchema, SubmitInquiryDto } from '../../dtos/booking/submit-inquiry.dto';
import { createInquiryCommand } from '../../repositories/booking/appointment-inquiries.commands';
import { submitInquiryUseCase } from '../../use-cases/booking/submit-inquiry.use-case';

export async function submitInquiryAction(data: SubmitInquiryDto) {
  try {
    // 1. Zod input validation
    const parsed = submitInquirySchema.parse(data);

    // 2. DI Setup (Functional)
    const supabase = await createAdminClient();
    const repoCommand = createInquiryCommand(supabase);
    const useCase = submitInquiryUseCase({ createInquiry: repoCommand });

    // 3. Execution
    const result = await useCase(parsed);

    // 4. Emit APPOINTMENT_INQUIRY_RECEIVED event and dispatch "Booking Request Received" email
    try {
      const { outboxCommands } = await import('@/shared/outbox/outbox.commands');
      const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
      const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');

      const outbox = outboxCommands(supabase);
      const event = await outbox.emitEvent('APPOINTMENT_INQUIRY_RECEIVED', {
        inquiryId: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        phoneNumber: result.phoneNumber,
        preferredServiceId: result.preferredServiceId,
        preferredDate: result.preferredDate,
        preferredStartTime: result.preferredStartTime,
      });

      bootstrapEventSubscribers();
      await globalOutboxDispatcher(supabase, false, event.id)();
    } catch (outboxErr) {
      console.warn('Failed to emit inquiry outbox event:', outboxErr);
    }

    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to submit booking inquiry',
    };
  }
}
