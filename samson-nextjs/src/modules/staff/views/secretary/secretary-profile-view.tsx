// src/app/(portals)/secretary/profile/page.tsx
'use client';

import React from 'react';
import { useSecretaryProfile } from '@/modules/staff/hooks/secretary/use-secretary-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SecretaryProfileView() {
  const { profileForm, updateProfileField, handleUpdateProfile, isSubmitting } = useSecretaryProfile();

  return (
    <div className="border border-card-border bg-card rounded-3xl p-8 max-w-xl mx-auto shadow-md flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <h1 className="text-xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-xs text-text-muted">Manage your personal staff registry details.</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase">First Name</label>
            <Input
              type="text"
              value={profileForm.firstName}
              onChange={(e) => updateProfileField('firstName', e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Last Name</label>
            <Input
              type="text"
              value={profileForm.lastName}
              onChange={(e) => updateProfileField('lastName', e.target.value)}
              className="text-xs"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Middle Name</label>
            <Input
              type="text"
              value={profileForm.middleName}
              onChange={(e) => updateProfileField('middleName', e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Suffix</label>
            <Input
              type="text"
              value={profileForm.suffix}
              onChange={(e) => updateProfileField('suffix', e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-text-secondary uppercase">Email Address (Read-Only)</label>
          <Input
            type="email"
            value={profileForm.email}
            disabled
            className="text-xs opacity-60 cursor-not-allowed bg-secondary-bg/30"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-text-secondary uppercase">Phone Number</label>
          <Input
            type="text"
            value={profileForm.phoneNumber}
            onChange={(e) => updateProfileField('phoneNumber', e.target.value)}
            className="text-xs"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          className="w-full text-xs font-bold py-3 mt-4"
        >
          {isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}
        </Button>
      </form>
    </div>
  );
}
