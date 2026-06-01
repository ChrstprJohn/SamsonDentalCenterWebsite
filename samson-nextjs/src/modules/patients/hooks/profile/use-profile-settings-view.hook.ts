'use client';

import { useState } from 'react';
import { useToast } from '@/components/feedback/toast-container';

interface InitialUser {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
}

export function useProfileSettingsView(initialUser: InitialUser) {
  const [firstName, setFirstName] = useState(initialUser.firstName);
  const [middleName, setMiddleName] = useState(initialUser.middleName || '');
  const [lastName, setLastName] = useState(initialUser.lastName);
  const [phone, setPhone] = useState(initialUser.phone);
  const [dob, setDob] = useState(initialUser.dob);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [bellAlerts, setBellAlerts] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !dob) {
      addToast('Please fill out all mandatory fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate server action profile update
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    addToast('Profile records updated successfully.', 'success');
  };

  return {
    profileDetails: {
      firstName, setFirstName,
      middleName, setMiddleName,
      lastName, setLastName,
      phone, setPhone,
      dob, setDob,
      email: initialUser.email,
    },
    preferences: {
      emailAlerts, setEmailAlerts,
      smsAlerts, setSmsAlerts,
      bellAlerts, setBellAlerts,
    },
    isSubmitting,
    handleProfileSubmit,
  };
}
