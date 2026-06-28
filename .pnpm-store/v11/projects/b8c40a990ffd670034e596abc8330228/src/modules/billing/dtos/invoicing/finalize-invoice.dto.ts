import { z } from 'zod';
import { paymentMethodEnum } from './invoice-response.dto';

export const additionalItemSchema = z.object({
  serviceId: z.string().uuid("Service ID must be a valid UUID").optional().nullable(),
  description: z.string().min(1, "Description is required"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  quantity: z.number().int("Quantity must be an integer").positive("Quantity must be positive"),
});

export const finalizeInvoiceSchema = z.object({
  invoiceId: z.string().uuid("Invoice ID must be a valid UUID"),
  paymentMethod: paymentMethodEnum,
  discountPercent: z.number().min(0).max(100).optional(),
  discountApplied: z.number().nonnegative("Discount must be non-negative").optional().nullable(),
  amount: z.number().nonnegative("Amount must be non-negative").optional(),
  additionalItems: z.array(additionalItemSchema).optional(),
});

export type FinalizeInvoiceDto = z.infer<typeof finalizeInvoiceSchema>;

