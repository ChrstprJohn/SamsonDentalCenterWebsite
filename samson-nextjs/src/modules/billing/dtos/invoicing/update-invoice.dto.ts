import { z } from "zod";
import { invoiceStatusEnum } from "./invoice-response.dto";

export const UpdateInvoiceSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative().optional(),
  status: invoiceStatusEnum.optional(),
});

export type UpdateInvoiceDto = z.infer<typeof UpdateInvoiceSchema>;
