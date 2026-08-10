'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const blockedDateFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a valid date'),
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters'),
});

export type BlockedDateFormValues = z.infer<typeof blockedDateFormSchema>;

interface UseBlockedDateFormProps {
  onSubmit: (values: BlockedDateFormValues) => Promise<void>;
  defaultValues?: Partial<BlockedDateFormValues>;
}

export function useBlockedDateForm({ onSubmit, defaultValues }: UseBlockedDateFormProps) {
  const form = useForm<BlockedDateFormValues>({
    resolver: zodResolver(blockedDateFormSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      reason: '',
      ...defaultValues,
    },
  });

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit as any),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    reset: form.reset,
  };
}
