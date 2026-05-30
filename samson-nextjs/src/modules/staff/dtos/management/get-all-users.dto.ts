import { z } from 'zod';

export const getAllUsersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export type GetAllUsersDto = z.input<typeof getAllUsersSchema>;

export const userProfileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable().optional(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  isActive: z.boolean(),
});

export type UserProfileResponseDto = z.infer<typeof userProfileResponseSchema>;
