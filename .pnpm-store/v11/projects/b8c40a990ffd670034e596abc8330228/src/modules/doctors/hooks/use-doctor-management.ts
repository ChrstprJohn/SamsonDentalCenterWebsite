'use client';

import { useState, useMemo } from 'react';

export interface DoctorSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

export interface Doctor {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  status: 'ACTIVE' | 'FORCE_PASSWORD_CHANGE' | 'HIDDEN' | 'ARCHIVED';
  isActive: boolean;
  services: string[];
  schedules?: DoctorSchedule[];
  createdAt?: string;
}

interface UseDoctorManagementProps {
  initialDoctors: Doctor[];
}

export function useDoctorManagement({ initialDoctors }: UseDoctorManagementProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(
    initialDoctors.length > 0 ? initialDoctors[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const selectedDoctor = useMemo(() => {
    if (isAddingNew) return null;
    return initialDoctors.find((d) => d.id === selectedDoctorId) || null;
  }, [selectedDoctorId, initialDoctors, isAddingNew]);

  const filteredDoctors = useMemo(() => {
    return initialDoctors.filter((doc) => {
      const fullName = `${doc.firstName} ${doc.middleName || ''} ${doc.lastName}`.toLowerCase();
      const email = doc.email.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && (doc.status === 'ACTIVE' || doc.status === 'FORCE_PASSWORD_CHANGE')) ||
        (statusFilter === 'HIDDEN' && doc.status === 'HIDDEN') ||
        (statusFilter === 'ARCHIVED' && doc.status === 'ARCHIVED');

      return matchesSearch && matchesStatus;
    });
  }, [initialDoctors, searchQuery, statusFilter]);

  const handleSelectDoctor = (id: string) => {
    setSelectedDoctorId(id);
    setIsEditing(false);
    setIsAddingNew(false);
  };

  const handleStartAddDoctor = () => {
    setIsAddingNew(true);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAddingNew(false);
  };

  return {
    selectedDoctorId,
    selectedDoctor,
    filteredDoctors,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isEditing,
    setIsEditing,
    isAddingNew,
    handleSelectDoctor,
    handleStartAddDoctor,
    handleCancel,
  };
}
