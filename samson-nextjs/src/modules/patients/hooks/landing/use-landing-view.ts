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
  isAuthenticated: boolean;
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
  phone: z.string().trim().min(1, 'Phone number is required'),
  pathway: z.string().trim().min(1, 'Treatment service is required'),
  targetDate: z.string().trim().min(1, 'Target date is required'),
  notes: z.string().trim().optional(),
});

type ContactInquiryFormValues = z.infer<typeof contactInquirySchema>;

export function useLandingView({ isAuthenticated, services }: UseLandingViewProps) {
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
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
    },
  });

  const firstName = form.watch('firstName');
  const middleName = form.watch('middleName') ?? '';
  const lastName = form.watch('lastName');
  const suffix = form.watch('suffix') ?? '';
  const contactEmail = form.watch('contactEmail');
  const contactMessage = form.watch('contactMessage') ?? '';
  const setField = <TName extends keyof ContactInquiryFormValues>(name: TName) =>
    (value: ContactInquiryFormValues[TName]) =>
      form.setValue(name, value as PathValue<ContactInquiryFormValues, TName>, {
        shouldDirty: true,
        shouldValidate: false,
      });

  const handleBookingCTA = (serviceId?: string) => {
    setSelectedService(null);
    const targetUrl = serviceId ? `/user?service=${serviceId}` : '/user';

    if (isAuthenticated) {
      router.push(targetUrl);
    } else {
      router.push(`/auth/login?redirect=${encodeURIComponent(targetUrl)}`);
    }
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
      const cleanedPhone = values.phone.replace(/[^\d+]/g, '');
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
    contactForm: {
      firstName,
      setFirstName: setField('firstName'),
      middleName,
      setMiddleName: setField('middleName'),
      lastName,
      setLastName: setField('lastName'),
      suffix,
      setSuffix: setField('suffix'),
      contactEmail,
      setContactEmail: setField('contactEmail'),
      contactMessage,
      setContactMessage: setField('contactMessage'),
      isContactSubmitting,
      handleRealInquirySubmit,
    },
    handleBookingCTA,
  };
}
