'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type PathValue } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/components/feedback/toast-container';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { submitInquiryAction } from '@/modules/appointments/actions/booking/submit-inquiry.action';

interface UseLandingViewProps {
  services: ServiceResponseDto[];
}

const uuidSchema = z.string().uuid();

const contactInquirySchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'Last name is required'),
  suffix: z.string().trim().optional(),
  contactEmail: z.string().trim().email('A valid email is required'),
  contactMessage: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => /^09\d{9}$/.test(val), 'Enter a valid 09XX XXX XXXX phone number'),
  pathway: z.string().trim().min(1, 'Treatment service is required'),
  targetDate: z.string().trim().min(1, 'Target date is required'),
  notes: z.string().trim().optional(),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .or(z.literal(''))
    .optional(),
  preferredStartTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Preferred start time must be in HH:MM format').or(z.literal('')).optional(),
});

type ContactInquiryFormValues = z.infer<typeof contactInquirySchema>;

export function useLandingView({ services }: UseLandingViewProps) {
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const { addToast } = useToast();
  const form = useForm<ContactInquiryFormValues>({
    resolver: zodResolver(contactInquirySchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      contactEmail: '',
      contactMessage: '',
      phone: '',
      pathway: '',
      targetDate: '',
      notes: '',
      dateOfBirth: '',
      preferredStartTime: '',
    },
  });

  const firstName = form.watch('firstName');
  const middleName = form.watch('middleName') ?? '';
  const lastName = form.watch('lastName');
  const suffix = form.watch('suffix') ?? '';
  const contactEmail = form.watch('contactEmail');
  const contactMessage = form.watch('contactMessage') ?? '';
  const dateOfBirth = form.watch('dateOfBirth') ?? '';
  const preferredStartTime = form.watch('preferredStartTime') ?? '';
  const setField = <TName extends keyof ContactInquiryFormValues>(name: TName) =>
    (value: ContactInquiryFormValues[TName]) =>
      form.setValue(name, value as PathValue<ContactInquiryFormValues, TName>, {
        shouldDirty: true,
        shouldValidate: false,
      });

  const router = useRouter();
  const [isNavigatingBooking, setIsNavigatingBooking] = useState(false);
  const [pendingServiceName, setPendingServiceName] = useState<string | null>(null);

  // Redirect to dedicated 2-Step Booking Wizard page with loading state
  const requestAppt = (serviceId?: string, serviceName?: string) => {
    setSelectedService(null);
    setIsNavigatingBooking(true);
    if (serviceName) {
      setPendingServiceName(serviceName);
    } else if (serviceId) {
      const found = services.find((s) => s.id === serviceId);
      setPendingServiceName(found?.name ?? null);
    } else {
      setPendingServiceName(null);
    }

    setTimeout(() => {
      if (serviceId) {
        router.push(`/book?serviceId=${encodeURIComponent(serviceId)}`);
      } else {
        router.push('/book');
      }
    }, 600);
  };

  const handleRealInquirySubmit = async ({
    phone,
    pathway,
    targetDate,
    notes,
  }: {
    phone: string;
    pathway: string;
    targetDate: string;
    notes: string;
  }) => {
    const parsed = contactInquirySchema.safeParse({
      ...form.getValues(),
      phone,
      pathway,
      targetDate,
      notes,
    });

    if (!parsed.success) {
      addToast(parsed.error.issues[0]?.message || 'Please fill out all required fields.', 'error');
      return false;
    }

    setIsContactSubmitting(true);

    try {
      const values = parsed.data;
      const cleanedPhone = values.phone.replace(/\D/g, '');
      let serviceId = values.pathway;

      if (!uuidSchema.safeParse(serviceId).success) {
        const dbService = services.find((service) => uuidSchema.safeParse(service.id).success);
        if (dbService) {
          serviceId = dbService.id;
        } else {
          addToast('Please select a valid treatment service.', 'error');
          setIsContactSubmitting(false);
          return false;
        }
      }

      const res = await submitInquiryAction({
        firstName: values.firstName,
        middleName: values.middleName || undefined,
        lastName: values.lastName,
        suffix: values.suffix || undefined,
        email: values.contactEmail,
        phoneNumber: cleanedPhone,
        preferredServiceId: serviceId,
        preferredDate: values.targetDate,
        patientNote: values.notes || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        preferredStartTime: values.preferredStartTime || '',
      });

      if (res.success) {
        addToast('Your consultation request has been submitted successfully!', 'success');
        form.reset();
        setIsContactSubmitting(false);
        return true;
      }

      addToast(res.error || 'Failed to submit request.', 'error');
      setIsContactSubmitting(false);
      return false;
    } catch (err: any) {
      addToast(err.message || 'An unexpected error occurred.', 'error');
      setIsContactSubmitting(false);
      return false;
    }
  };

  return {
    selectedService,
    setSelectedService,
    isNavigatingBooking,
    pendingServiceName,
    contactForm: {
      firstName,
      setFirstName: setField('firstName'),
      lastName,
      setLastName: setField('lastName'),
      contactEmail,
      setContactEmail: setField('contactEmail'),
      contactMessage,
      setContactMessage: setField('contactMessage'),
      preferredStartTime,
      setPreferredStartTime: setField('preferredStartTime'),
      isContactSubmitting,
      handleRealInquirySubmit,
    },
    requestAppt,
  };
}
