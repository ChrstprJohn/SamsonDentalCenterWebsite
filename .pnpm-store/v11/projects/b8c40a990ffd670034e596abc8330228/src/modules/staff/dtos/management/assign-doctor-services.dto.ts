import { z } from 'zod';

export const assignDoctorServicesSchema = z.object({
  doctorId: z.string().uuid('Doctor ID must be a valid UUID'),
  serviceIds: z.array(z.string().uuid('Service IDs must be valid UUIDs')),
});

export type AssignDoctorServicesDto = z.infer<typeof assignDoctorServicesSchema>;
