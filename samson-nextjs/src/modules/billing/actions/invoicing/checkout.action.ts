"use server";

import { z } from 'zod';
import { after } from 'next/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { FinalizeInvoiceDto, finalizeInvoiceSchema } from '../../dtos/exports';
import { finalizeInvoiceCommand } from '../../repositories/exports';
import { finalizeInvoiceUseCase } from '../../use-cases/exports';
import { updateAppointmentStatusUseCase } from '@/modules/appointments/use-cases/exports';
import { getAppointmentByIdQuery, updateStatusCommand, incrementUserCredibilityMetricCommand, insertLedgerEntryCommand } from '@/modules/appointments/repositories/status/exports';
import { createAuditLogUseCase } from '@/modules/audit-logs/use-cases/exports';
import { createAuditLogCommand } from '@/modules/audit-logs/repositories/logs/audit-log.commands';
import { checkoutOrchestrator } from '@/orchestrators/checkout.orchestrator';

// Background task trigger (e.g. Email Receipt)
async function sendBackgroundReceipt(invoiceId: string, email: string) {
  console.log(`[BACKGROUND] Sending email receipt for invoice ${invoiceId} to ${email}`);
}

export async function checkoutAction(data: FinalizeInvoiceDto) {
  try {
    // Only SECRETARY or ADMIN can perform checkout
    await authorizeRole("SECRETARY");

    const parsed = finalizeInvoiceSchema.parse(data);
    const supabase = await createClient();

    const orchestratorDeps = {
      supabase,
      finalizeInvoice: finalizeInvoiceUseCase(finalizeInvoiceCommand(supabase)),
      updateAppointmentStatus: async (id: string, status: any, reason?: string) => {
        const user = await getAuthenticatedUser();
        return updateAppointmentStatusUseCase({
          getAppointmentById: getAppointmentByIdQuery(supabase),
          updateStatus: updateStatusCommand(supabase),
          incrementUserCredibilityMetric: incrementUserCredibilityMetricCommand(supabase),
          insertLedgerEntry: insertLedgerEntryCommand(supabase),
        })(id, user?.id || null, 'STAFF', status, reason);
      },
      createAuditLog: createAuditLogUseCase(createAuditLogCommand(supabase)),
      getCurrentUser: async () => {
        try {
          return await getAuthenticatedUser();
        } catch {
          return null;
        }
      },
    };

    const runOrchestrator = checkoutOrchestrator(orchestratorDeps);
    const result = await runOrchestrator(parsed);

    // Queue asynchronous background tasks using Next.js after()
    try {
      const user = await getAuthenticatedUser();
      if (user?.email) {
        after(() => {
          sendBackgroundReceipt(result.invoice.id, user.email!).catch((err) => {
            console.error("Failed to send background email receipt:", err);
          });
        });
      }
    } catch (e) {
      console.warn("Could not queue background email receipt task:", e);
    }

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: `Validation failed: ${error.issues[0].message}` };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to perform checkout" };
  }
}
