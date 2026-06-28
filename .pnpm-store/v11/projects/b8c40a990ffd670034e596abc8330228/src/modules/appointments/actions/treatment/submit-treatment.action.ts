"use server";

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { SubmitTreatmentDto, submitTreatmentSchema } from '../../dtos/treatment/submit-treatment.dto';
import { submitTreatmentCommand } from '../../repositories/treatment/treatment.commands';
import { generateInvoiceCommand } from '@/modules/billing/repositories/invoicing/invoice.commands';
import { submitTreatmentUseCase } from '../../use-cases/treatment/submit-treatment.use-case';
import { getServicesByIdsQuery } from '@/modules/services/exports';

export async function submitTreatmentAction(formData: SubmitTreatmentDto) {
  try {
    const validData = submitTreatmentSchema.parse(formData);

    // Only doctors are authorized to submit treatment
    await authorizeRole('DOCTOR');

    const supabase = await createClient();
    const useCase = submitTreatmentUseCase({
      getServicesDetails: getServicesByIdsQuery(supabase),
      submitTreatment: submitTreatmentCommand(supabase),
      generateInvoice: generateInvoiceCommand(supabase),
    });


    await useCase(validData);
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
