"use server";

import { z } from "zod";
import { authorizeRole } from "@/shared/auth/auth.util";
import { createClient } from "@/shared/database/server";
import { DomainError } from "@/shared/errors";
import { GetInvoicesDto, GetInvoicesSchema } from "../../dtos";
import { InvoiceQueriesRepository } from "../../repositories";
import { GetInvoicesUseCase } from "../../use-cases";

export async function getInvoicesAction(params?: GetInvoicesDto) {
  try {
    await authorizeRole("SECRETARY");

    const parsed = GetInvoicesSchema.parse(params || {});
    const supabase = await createClient();
    const queries = new InvoiceQueriesRepository(supabase);
    const useCase = new GetInvoicesUseCase(queries);

    const invoices = await useCase.execute(parsed);
    return { success: true, data: invoices };
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
    return { success: false, error: "Failed to fetch invoices" };
  }
}
