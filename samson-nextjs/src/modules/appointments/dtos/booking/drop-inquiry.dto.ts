import { z } from 'zod';

const cleanOptionalString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .optional();

export const dropInquirySchema = z.object({
  inquiryId: z.string().uuid('Invalid inquiry format'),
  secretaryNotes: cleanOptionalString,
});

export type DropInquiryDto = z.infer<typeof dropInquirySchema>;
