'use client';

import React from 'react';
import { Doctor } from '../hooks/use-doctor-management';
import { DoctorReadPane } from './doctor-read-pane';
import { DoctorEditForm } from './doctor-edit-form';
import { Button } from '@/components/ui/button';
import { updateDoctorAction } from '../actions/update-doctor.action';
import { useToast } from '@/components/feedback/toast-container';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
}

interface DoctorDetailsPaneProps {
  doctor: Doctor | null;
  allServices: Service[];
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isAddingNew: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export function DoctorDetailsPane({
  doctor,
  allServices,
  isEditing,
  setIsEditing,
  isAddingNew,
  onCancel,
  onSuccess,
}: DoctorDetailsPaneProps) {
  const { addToast } = useToast();
  const router = useRouter();

  if (!doctor && !isAddingNew) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-text-muted border border-dashed border-card-border rounded-3xl h-full min-h-[300px]">
        Select a doctor card from the roster list or click "+ Add Doctor" to begin configuration.
      </div>
    );
  }

  const handleStatusToggle = async (statusVal: string) => {
    if (!doctor) return;
    const response = await updateDoctorAction({
      id: doctor.id,
      firstName: doctor.firstName,
      middleName: doctor.middleName || null,
      lastName: doctor.lastName,
      suffix: doctor.suffix || null,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber || '',
      specialization: doctor.specialization,
      serviceIds: doctor.services || [],
      isActive: statusVal === 'ACTIVE',
    });

    if (response.success) {
      addToast('Status toggled successfully!', 'success');
      router.refresh();
      onSuccess();
    } else {
      addToast(response.error || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Actions Header */}
      {doctor && (
        <div className="flex items-center justify-between gap-4 p-4 bg-card border border-card-border rounded-2xl">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-text-secondary uppercase">Quick Status:</label>
            <select
              value={doctor.isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={(e) => handleStatusToggle(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
            className="text-[11px] h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            ✏️ Edit Profile
          </Button>
        </div>
      )}

      {/* Details Pane Layout Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Sub-Pane: Read-only details */}
        <div className="h-full">
          <DoctorReadPane doctor={doctor} />
        </div>

        {/* Right Sub-Pane: Form / Interactive edit */}
        <div className="h-full">
          {isEditing || isAddingNew ? (
            <DoctorEditForm
              doctor={doctor}
              allServices={allServices}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-text-muted border border-dashed border-card-border rounded-2xl h-full bg-slate-50/20 dark:bg-slate-900/10 min-h-[300px]">
              Click &quot;Edit Profile&quot; to toggle editor interactive form state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
