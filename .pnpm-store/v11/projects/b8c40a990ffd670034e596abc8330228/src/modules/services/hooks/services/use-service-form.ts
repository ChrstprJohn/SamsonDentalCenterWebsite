'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServiceFormSchema, CreateServiceFormValues } from '../use-service-form-schema';
import { createServiceAction } from '../../actions/management/create-service.action';
import { updateServiceAction } from '../../actions/management/update-service.action';
import { uploadServiceImage } from '../../utils/upload-service-image';
import type { Service } from '../../types';
import { useRouter } from 'next/navigation';

interface UseServiceFormProps {
  service?: Service | null;
  onSuccess?: () => void;
}

export function useServiceForm({ service, onSuccess }: UseServiceFormProps = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceFormSchema) as any,
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      durationMinutes: service?.durationMinutes || 30,
      price: service?.price || 0,
      serviceType: service?.serviceType || 'GENERAL',
      isActive: service?.isActive ?? true,
      imageUrl: service?.imageUrl || null,
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || '',
        durationMinutes: service.durationMinutes,
        price: service.price || 0,
        serviceType: service.serviceType,
        isActive: service.isActive,
        imageUrl: service.imageUrl || null,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        durationMinutes: 30,
        price: 0,
        serviceType: 'GENERAL',
        isActive: true,
        imageUrl: null,
      });
    }
  }, [service, form]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setServerError(null);
    setIsSuccess(false);

    try {
      let imageUrl = service?.imageUrl || null;
      if (values.imageFile && values.imageFile[0]) {
        try {
          imageUrl = await uploadServiceImage(values.imageFile[0]);
        } catch (err: any) {
          setServerError(`Image upload failed: ${err.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        name: values.name,
        description: values.description,
        durationMinutes: values.durationMinutes,
        price: values.price,
        serviceType: values.serviceType,
        isActive: values.isActive,
        imageUrl,
      };

      let result;
      if (service?.id) {
        result = await updateServiceAction({
          id: service.id,
          ...payload,
        });
      } else {
        result = await createServiceAction(payload);
      }

      if (result.error) {
        setServerError(result.error);
      } else {
        setIsSuccess(true);
        form.reset();
        router.refresh();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    serverError,
    isSuccess,
  };
}
