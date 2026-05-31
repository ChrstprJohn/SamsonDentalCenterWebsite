import React from 'react';
import { createClient } from '@/shared/database/server';
import { ProfileSettingsView } from '@/modules/patients/views/profile-settings-view';

export const metadata = {
  title: 'Profile Settings | Patient Portal',
  description: 'Manage your contact fields, E.164 phone formats, birthday records, and SMS/Email preference thresholds.',
};

export default async function UserSettingsPage() {
  let initialUser = {
    firstName: 'Patient',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
  };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      initialUser = {
        firstName: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Patient',
        middleName: user.user_metadata?.middle_name || user.user_metadata?.middleName || '',
        lastName: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        dob: user.user_metadata?.dob || user.user_metadata?.birthday || '',
      };
    }
  } catch (err) {
    console.error('Failed to load user metadata in settings:', err);
  }

  return (
    <ProfileSettingsView initialUser={initialUser} />
  );
}
