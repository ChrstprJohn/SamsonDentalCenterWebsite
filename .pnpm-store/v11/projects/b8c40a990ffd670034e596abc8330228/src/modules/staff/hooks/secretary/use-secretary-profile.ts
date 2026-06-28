'use client';

import type React from 'react';
import { useSecretary } from '../use-secretary';

type ProfileField = 'firstName' | 'middleName' | 'lastName' | 'suffix' | 'phoneNumber';

export function useSecretaryProfile() {
  const { profileForm, setProfileForm, handleUpdateProfile, isSubmitting } = useSecretary();

  const updateProfileField = (field: ProfileField, value: string) => {
    setProfileForm({ ...profileForm, [field]: value });
  };

  return {
    profileForm,
    isSubmitting,
    handleUpdateProfile: handleUpdateProfile as (event: React.FormEvent) => Promise<void>,
    updateProfileField,
  };
}
