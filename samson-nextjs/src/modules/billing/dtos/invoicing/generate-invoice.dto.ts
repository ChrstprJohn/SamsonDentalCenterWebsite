import { z } from "zod";
import { invoiceStatusEnum } from "./invoice-response.dto";

export const GenerateInvoiceSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().nonnegative(),
  status: invoiceStatusEnum.default("DRAFT"),
});

export type GenerateInvoiceDto = z.infer<typeof GenerateInvoiceSchema>;
