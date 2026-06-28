'use client';

import React from 'react';
import { useDoctorManagement, Doctor } from '../hooks/use-doctor-management';
import { DoctorList } from './doctor-list';
import { DoctorDetailsPane } from './doctor-details-pane';

interface Service {
  id: string;
  name: string;
}

interface DoctorManagementViewProps {
  initialDoctors: Doctor[];
  allServices: Service[];
}

export function DoctorManagementView({ initialDoctors, allServices }: DoctorManagementViewProps) {
  const {
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
  } = useDoctorManagement({ initialDoctors });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* Left Roster Column */}
      <div className="lg:col-span-5 border-r border-card-border/50 pr-0 lg:pr-6">
        <DoctorList
          doctors={filteredDoctors}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={handleSelectDoctor}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAddDoctorClick={handleStartAddDoctor}
          isAddingNew={isAddingNew}
        />
      </div>

      {/* Right Details Column */}
      <div className="lg:col-span-7">
        <DoctorDetailsPane
          doctor={selectedDoctor}
          allServices={allServices}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isAddingNew={isAddingNew}
          onCancel={handleCancel}
          onSuccess={handleCancel}
        />
      </div>
    </div>
  );
}
