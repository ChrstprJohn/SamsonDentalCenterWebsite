import { z } from 'zod';

export const terminateStaffSchema = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
});

export type TerminateStaffDto = z.infer<typeof terminateStaffSchema>;
