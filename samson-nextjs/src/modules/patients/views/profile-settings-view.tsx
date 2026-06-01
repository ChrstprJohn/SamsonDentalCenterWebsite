'use client';

import React from 'react';
import { useProfileSettingsView } from '../hooks/profile/use-profile-settings-view.hook';
import { ProfileDetailsForm } from '../components/profile/profile-details-form';
import { ProfilePreferencesForm } from '../components/profile/profile-preferences-form';

interface ProfileSettingsViewProps {
  initialUser: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
  };
}

export function ProfileSettingsView({ initialUser }: ProfileSettingsViewProps) {
  const {
    profileDetails,
    preferences,
    isSubmitting,
    handleProfileSubmit,
  } = useProfileSettingsView(initialUser);

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h2>
        <p className="text-xs text-slate-500">Edit your contact details and customize notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <ProfileDetailsForm
          profileDetails={profileDetails}
          isSubmitting={isSubmitting}
          onSubmit={handleProfileSubmit}
        />
        <ProfilePreferencesForm preferences={preferences} />
      </div>
    </div>
  );
}
