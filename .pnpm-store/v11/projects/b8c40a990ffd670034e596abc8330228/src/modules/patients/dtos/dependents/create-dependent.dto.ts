import { z } from 'zod';

export const dependentRelationshipEnum = z.enum(['CHILD', 'SPOUSE', 'PARENT', 'SIBLING', 'OTHER']);
export type DependentRelationship = z.infer<typeof dependentRelationshipEnum>;

export const createDependentSchema = z.object({
  patientId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  dateOfBirth: z.string(),
  relationship: dependentRelationshipEnum,
});

export type CreateDependentDto = z.infer<typeof createDependentSchema>;
