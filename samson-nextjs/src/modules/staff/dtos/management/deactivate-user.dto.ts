import { z } from 'zod';

export const deactivateUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().optional(),
});

export type DeactivateUserDto = z.infer<typeof deactivateUserSchema>;
