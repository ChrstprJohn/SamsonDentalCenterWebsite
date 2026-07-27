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

  const handleStatusToggle = async (statusVal: any) => {
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
      status: statusVal,
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
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {isEditing || isAddingNew ? (
        <DoctorEditForm
          doctor={doctor}
          allServices={allServices}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      ) : (
        <DoctorReadPane
          doctor={doctor}
          allServices={allServices}
          onEdit={() => setIsEditing(true)}
          onStatusToggle={handleStatusToggle}
        />
      )}
    </div>
  );
}

