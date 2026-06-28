import { z } from 'zod';
import { registerPatientSchema } from '../profile/register-patient.dto';

// Extend the core patient registration schema with frontend-specific requirements (like accepting terms)
export const signUpSchema = registerPatientSchema.extend({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms and Privacy Policy',
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
