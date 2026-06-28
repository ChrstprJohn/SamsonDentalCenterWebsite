import { z } from 'zod';
import { invoiceStatusEnum } from './invoice-response.dto';

export const GetInvoicesSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  status: invoiceStatusEnum.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type GetInvoicesDto = z.infer<typeof GetInvoicesSchema>;
