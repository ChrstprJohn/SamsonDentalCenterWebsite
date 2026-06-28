"use server";

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { GenerateInvoiceDto, GenerateInvoiceSchema } from '../../dtos/exports';
import { generateInvoiceCommand } from '../../repositories/exports';
import { generateInvoiceUseCase } from '../../use-cases/exports';

export async function generateInvoiceAction(data: GenerateInvoiceDto) {
  try {
    await authorizeRole("SECRETARY");

    const parsed = GenerateInvoiceSchema.parse(data);
    const supabase = await createClient();
    
    const useCase = generateInvoiceUseCase(generateInvoiceCommand(supabase));

    const invoice = await useCase(parsed);
    return { success: true, data: invoice };
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
    return { success: false, error: "Failed to generate invoice" };
  }
}
