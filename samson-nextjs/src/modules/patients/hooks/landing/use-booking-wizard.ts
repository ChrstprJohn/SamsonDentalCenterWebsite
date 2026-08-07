'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type PathValue } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/components/feedback/toast-container';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { submitInquiryAction } from '@/modules/appointments/actions/booking/submit-inquiry.action';
import { useContactSection } from './use-contact-section';

const uuidSchema = z.string().uuid();

const wizardSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'Last name is required'),
  suffix: z.string().trim().optional(),
  contactEmail: z.string().trim().email('A valid email is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  pathway: z.string().trim().min(1, 'Treatment service is required'),
  targetDate: z.string().trim().min(1, 'Target date is required'),
  notes: z.string().trim().optional(),
  preferredStartTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Preferred start time must be in HH:MM format').or(z.literal('')).optional(),
});

type WizardFormValues = z.infer<typeof wizardSchema>;

interface UseBookingWizardProps {
  services: ServiceResponseDto[];
  initialServiceId?: string;
}

export function useBookingWizard({ services, initialServiceId }: UseBookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<1 | 2 | 3>(1);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const contactSection = useContactSection({
    services,
    initialPathway: initialServiceId || '',
    handleRealInquirySubmit: async (data) => {
      return handleFinalSubmit(data);
    },
  });

  useEffect(() => {
    if (initialServiceId && !contactSection.pathway) {
      const matched = services.find((s) => s.id === initialServiceId);
      if (matched) {
        contactSection.setPathway(matched.id);
      }
    }
  }, [initialServiceId, services, contactSection.pathway, contactSection.setPathway]);

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      contactEmail: '',
      phone: '',
      pathway: initialServiceId || '',
      targetDate: '',
      notes: '',
      preferredStartTime: '',
    },
  });

  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const contactEmail = form.watch('contactEmail');
  const preferredStartTime = form.watch('preferredStartTime') ?? '';

  const setField = <TName extends keyof WizardFormValues>(name: TName) =>
    (value: WizardFormValues[TName]) =>
      form.setValue(name, value as PathValue<WizardFormValues, TName>, {
        shouldDirty: true,
        shouldValidate: false,
      });

  const validateStep1 = (): boolean => {
    if (!contactSection.pathway) {
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!contactSection.targetDate || !preferredStartTime) {
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!firstName || !lastName || !contactEmail || !contactSection.phone) {
      return false;
    }
    return true;
  };

  const selectService = (serviceId: string) => {
    contactSection.setPathway(serviceId);
  };

  const goToStep1 = () => setStep(1);

  const goToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
      setMaxReachedStep((prev) => (prev < 2 ? 2 : prev));
    }
  };

  const goToStep3 = () => {
    if (validateStep1() && validateStep2()) {
      setStep(3);
      setMaxReachedStep(3);
    }
  };

  const handleStepClick = (targetStep: 1 | 2 | 3) => {
    if (targetStep === 1) {
      setStep(1);
      return;
    }
    if (targetStep === 2) {
      if (maxReachedStep >= 2 || validateStep1()) {
        setStep(2);
      }
      return;
    }
    if (targetStep === 3) {
      if (maxReachedStep >= 3) {
        setStep(3);
      } else if (validateStep1() && validateStep2()) {
        setStep(3);
        setMaxReachedStep(3);
      }
    }
  };

  // Auto redirect countdown timer after successful submission
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectCountdown, router]);

  const handleFinalSubmit = async (data: {
    phone: string;
    pathway: string;
    targetDate: string;
    notes: string;
  }): Promise<boolean> => {
    const values = form.getValues();
    const parsed = wizardSchema.safeParse({
      ...values,
      phone: data.phone,
      pathway: data.pathway,
      targetDate: data.targetDate,
      notes: data.notes,
    });

    if (!parsed.success) {
      return false;
    }

    setIsSubmitting(true);

    try {
      const validData = parsed.data;
      const cleanedPhone = validData.phone.replace(/[^\d+]/g, '');
      let serviceId = validData.pathway;

      if (!uuidSchema.safeParse(serviceId).success) {
        const dbService = services.find((service) => uuidSchema.safeParse(service.id).success);
        if (dbService) {
          serviceId = dbService.id;
        } else {
          addToast('Please select a valid treatment service.', 'error');
          setIsSubmitting(false);
          return false;
        }
      }

      const res = await submitInquiryAction({
        firstName: validData.firstName,
        middleName: validData.middleName || undefined,
        lastName: validData.lastName,
        suffix: validData.suffix || undefined,
        email: validData.contactEmail,
        phoneNumber: cleanedPhone,
        preferredServiceId: serviceId,
        preferredDate: validData.targetDate,
        patientNote: validData.notes || undefined,
        preferredStartTime: validData.preferredStartTime || '',
      });

      if (res.success) {
        addToast('Your appointment request has been successfully submitted!', 'success');
        setIsSubmitting(false);
        setSubmittedReference(res.data?.id ? `REF-${res.data.id.replace(/-/g, '').slice(-8).toUpperCase()}` : null);
        setRedirectCountdown(15);
        return true;
      }

      addToast(res.error || 'Failed to submit appointment request.', 'error');
      setIsSubmitting(false);
      return false;
    } catch (err: any) {
      addToast(err.message || 'An unexpected error occurred.', 'error');
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    step,
    maxReachedStep,
    goToStep1,
    goToStep2,
    goToStep3,
    handleStepClick,
    selectService,
    redirectCountdown,
    submittedReference,
    services,
    contactSection,
    isSubmitting,
    fields: {
      firstName,
      setFirstName: setField('firstName'),
      lastName,
      setLastName: setField('lastName'),
      contactEmail,
      setContactEmail: setField('contactEmail'),
      preferredStartTime,
      setPreferredStartTime: setField('preferredStartTime'),
      isContactSubmitting: isSubmitting,
      contactMessage: '',
      setContactMessage: () => {},
    },
  };
}
