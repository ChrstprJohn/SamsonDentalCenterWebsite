"use server";

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { SubmitTreatmentDto, submitTreatmentSchema } from '../../dtos/treatment/submit-treatment.dto';
import { TreatmentCommands } from '../../repositories/treatment/treatment.commands';
import { InvoiceCommandsRepository } from '@/modules/billing/repositories/invoicing/invoice.commands';
import { SubmitTreatmentUseCase } from '../../use-cases/treatment/submit-treatment.use-case';

export async function submitTreatmentAction(formData: SubmitTreatmentDto) {
  try {
    const validData = submitTreatmentSchema.parse(formData);

    // Only doctors are authorized to submit treatment
    await authorizeRole('DOCTOR');

    const supabase = await createClient();
    const treatmentRepo = new TreatmentCommands(supabase);
    const invoiceRepo = new InvoiceCommandsRepository(supabase);
    const useCase = new SubmitTreatmentUseCase(treatmentRepo, invoiceRepo, supabase);

    await useCase.execute(validData);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
