'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doctorFormSchema, DoctorFormValues } from './use-doctor-form-schema';
import { createDoctorAction } from '../actions/create-doctor.action';
import { updateDoctorAction } from '../actions/update-doctor.action';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';

interface UseDoctorFormProps {
  doctor?: any | null; // Passed when editing
  onSuccess?: () => void;
}

export function useDoctorForm({ doctor, onSuccess }: UseDoctorFormProps = {}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema) as any,
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      email: '',
      phoneNumber: '',
      specialization: '',
      defaultPassword: 'Welcome@Samson2026',
      serviceIds: [],
      status: 'ACTIVE',
    },
  });

  const { reset } = form;
  const lastDoctorIdRef = useRef<string | null | undefined>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastDoctorIdRef.current = doctor?.id;
      if (doctor) {
        reset({
          firstName: doctor.firstName || '',
          middleName: doctor.middleName || '',
          lastName: doctor.lastName || '',
          suffix: doctor.suffix || '',
          email: doctor.email || '',
          phoneNumber: doctor.phoneNumber || '',
          specialization: doctor.specialization || '',
          defaultPassword: '',
          serviceIds: doctor.services || [],
          status: doctor.status === 'FORCE_PASSWORD_CHANGE' ? 'ACTIVE' : (doctor.status || 'ACTIVE'),
        });
      }
      return;
    }

    if (lastDoctorIdRef.current !== doctor?.id) {
      lastDoctorIdRef.current = doctor?.id;
      if (doctor) {
        reset({
          firstName: doctor.firstName || '',
          middleName: doctor.middleName || '',
          lastName: doctor.lastName || '',
          suffix: doctor.suffix || '',
          email: doctor.email || '',
          phoneNumber: doctor.phoneNumber || '',
          specialization: doctor.specialization || '',
          defaultPassword: '',
          serviceIds: doctor.services || [],
          status: doctor.status === 'FORCE_PASSWORD_CHANGE' ? 'ACTIVE' : (doctor.status || 'ACTIVE'),
        });
      } else {
        reset({
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          email: '',
          phoneNumber: '',
          specialization: '',
          defaultPassword: 'Welcome@Samson2026',
          serviceIds: [],
          status: 'ACTIVE',
        });
      }
    }
  }, [doctor?.id, reset]);

  const onSubmit = async (values: DoctorFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      let result;
      if (doctor?.id) {
        result = await updateDoctorAction({
          id: doctor.id,
          ...values,
        });
      } else {
        result = await createDoctorAction(values);
      }

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            form.setError(field as any, {
              type: 'server',
              message: Array.isArray(errors) ? errors[0] : (errors as string),
            });
          });
        }
        setServerError(result.error || 'Failed to save doctor details');
        addToast(result.error || 'Failed to save doctor details', 'error');
      } else {
        addToast(
          doctor?.id
            ? 'Doctor profile updated successfully!'
            : 'Doctor account created successfully!',
          'success'
        );
        form.reset();
        router.refresh();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred');
      addToast(err.message || 'An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    serverError,
  };
}
