import { z } from 'zod';

export const registerPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  middleName: z.string().trim().optional(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  suffix: z.string().trim().optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  // E.164-like validation: optional '+' followed by 10-15 digits
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  dateOfBirth: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    // Check if format is MM/DD/YY, MM/DD/YYYY, MM-DD-YY, or MM-DD-YYYY
    const mdYRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2}|\d{4})$/;
    const match = val.match(mdYRegex);
    if (match) {
      const [_, month, day, yearStr] = match;
      let year = yearStr;
      if (yearStr.length === 2) {
        const yearNum = parseInt(yearStr, 10);
        // If year is <= 26 (current year 2026), assume 2000s, else 1900s
        year = yearNum <= 26 ? `20${yearStr}` : `19${yearStr}`;
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return val;
  }, z.string().date('Invalid date format. Expected YYYY-MM-DD')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterPatientDto = z.infer<typeof registerPatientSchema>;