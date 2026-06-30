'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TimeStringSchema } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export const timeBlockFormSchema = z
  .object({
    scope: z.enum(['DOCTOR', 'CLINIC']),
    doctorId: z.string().uuid().nullable().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a valid date'),
    startTime: TimeStringSchema,
    endTime: TimeStringSchema,
    isAllDay: z.boolean().default(false),
    reason: z.string().trim().min(3, 'Reason must be at least 3 characters'),
  })
  .refine(
    (data) => {
      if (data.scope === 'DOCTOR' && !data.doctorId) {
        return false;
      }
      return true;
    },
    {
      message: 'Please select a specific doctor',
      path: ['doctorId'],
    }
  )
  .refine(
    (data) => {
      return data.startTime <= data.endTime;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export type TimeBlockFormValues = z.infer<typeof timeBlockFormSchema>;

interface UseTimeBlockFormProps {
  onSubmit: (values: TimeBlockFormValues) => Promise<void>;
  defaultValues?: Partial<TimeBlockFormValues>;
}

export function useTimeBlockForm({ onSubmit, defaultValues }: UseTimeBlockFormProps) {
  const form = useForm<TimeBlockFormValues>({
    resolver: zodResolver(timeBlockFormSchema),
    defaultValues: {
      scope: 'CLINIC',
      doctorId: null,
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      isAllDay: false,
      reason: '',
      ...defaultValues,
    },
  });

  const handleAllDayChange = (checked: boolean) => {
    form.setValue('isAllDay', checked);
    if (checked) {
      form.setValue('startTime', '00:00');
      form.setValue('endTime', '23:59');
    } else {
      form.setValue('startTime', '08:00');
      form.setValue('endTime', '17:00');
    }
  };

  const handleScopeChange = (scope: 'DOCTOR' | 'CLINIC') => {
    form.setValue('scope', scope);
    if (scope === 'CLINIC') {
      form.setValue('doctorId', null);
    }
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    watch: form.watch,
    setValue: form.setValue,
    handleAllDayChange,
    handleScopeChange,
    reset: form.reset,
  };
}
