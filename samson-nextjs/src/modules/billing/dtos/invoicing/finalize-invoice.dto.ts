import { z } from "zod";
import { paymentMethodEnum } from "./invoice-response.dto";

export const finalizeInvoiceSchema = z.object({
  invoiceId: z.string().uuid("Invoice ID must be a valid UUID"),
  paymentMethod: paymentMethodEnum,
  discountApplied: z.number().nonnegative("Discount must be non-negative").optional().nullable(),
  amount: z.number().nonnegative("Amount must be non-negative").optional(),
});

export type FinalizeInvoiceDto = z.infer<typeof finalizeInvoiceSchema>;
