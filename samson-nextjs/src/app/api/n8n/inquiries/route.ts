import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { decodeServiceId, encodeServiceId } from '@/shared/utils/service-short-id';
import { submitInquirySchema } from '@/modules/appointments/dtos/booking/submit-inquiry.dto';
import { createInquiryCommand } from '@/modules/appointments/repositories/booking/appointment-inquiries.commands';
import { submitInquiryUseCase } from '@/modules/appointments/use-cases/booking/submit-inquiry.use-case';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function unauthorized(req: NextRequest): boolean {
  const secret = process.env.N8N_TOOL_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') !== `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  try {
    if (unauthorized(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Accept short id or full uuid
    if (typeof body.preferredServiceId !== 'string') {
      return Response.json(
        { error: 'preferredServiceId is required' },
        { status: 400 },
      );
    }
    try {
      const rawId = String(body.preferredServiceId).trim().replace(/^=+|=+$/g, '');
      body.preferredServiceId = UUID_REGEX.test(rawId)
        ? rawId
        : decodeServiceId(rawId);
    } catch (error: any) {
      return Response.json(
        { error: `Invalid preferredServiceId "${body.preferredServiceId}": ${error.message}` },
        { status: 400 },
      );
    }

    const parsed = submitInquirySchema.parse(body);

    const supabase = await createAdminClient();
    const repoCommand = createInquiryCommand(supabase);
    const useCase = submitInquiryUseCase({ createInquiry: repoCommand });
    const result = await useCase(parsed);

    // Emit APPOINTMENT_INQUIRY_RECEIVED event and dispatch "Booking Request Received" email
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

    return Response.json({
      id: encodeServiceId(result.id),
      status: result.status,
      createdAt: result.createdAt,
    });
  } catch (error: any) {
    const status = error instanceof z.ZodError ? 400 : 500;
    const message = error instanceof z.ZodError
      ? error.issues[0]?.message ?? error.message
      : error.message || 'Failed to submit booking inquiry';
    return Response.json({ error: message }, { status });
  }
}
