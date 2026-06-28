'use client';

import React, { useState } from 'react';
import type { Service } from '../types';
import { useServicesView } from '../hooks/services/use-services-view';
import { useServiceForm } from '../hooks/services/use-service-form';
import { useServiceDetail } from '../hooks/services/use-service-detail';
import { ServiceListHeader } from '../components/service-list-header';
import { ServiceList } from '../components/service-list';
import { ServiceDetailPanel } from '../components/service-detail-panel';
import { ServiceForm } from '../components/service-form';
import { ArchiveConfirmModal } from '../components/archive-confirm-modal';

interface ServicesViewProps {
  initialServices: Service[];
}

export function ServicesView({ initialServices }: ServicesViewProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const {
    selectedServiceId,
    setSelectedServiceId,
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    searchQuery,
    setSearchQuery,
    filteredServices,
  } = useServicesView(initialServices);

  const selectedService = filteredServices.find((s) => s.id === selectedServiceId) || null;

  // Hooks for detail & actions
  const {
    isEditing,
    setIsEditing,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    isPending,
    serverError: detailError,
    handleArchive,
    handleToggleVisibility,
  } = useServiceDetail({
    service: selectedService,
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  // Hooks for creation/updating forms
  const {
    form: createForm,
    onSubmit: onCreateSubmit,
    isSubmitting: isCreating,
    serverError: createError,
  } = useServiceForm({
    service: null,
    onSuccess: () => {
      setIsAddingNew(false);
    },
  });

  const {
    form: editForm,
    onSubmit: onEditSubmit,
    isSubmitting: isEditingSubmit,
    serverError: editError,
  } = useServiceForm({
    service: selectedService,
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const handleSelectService = (svc: Service) => {
    setIsAddingNew(false);
    setIsEditing(false);
    setSelectedServiceId(svc.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto p-4">
      {/* Left List Pane */}
      <div className="lg:col-span-5 flex flex-col">
        <ServiceListHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          onAddService={() => {
            setSelectedServiceId(null);
            setIsEditing(false);
            setIsAddingNew(true);
          }}
        />
        <ServiceList
          services={filteredServices}
          selectedId={selectedServiceId}
          onSelect={handleSelectService}
        />
      </div>

      {/* Right Details/Form Pane */}
      <div className="lg:col-span-7">
        {isAddingNew ? (
          <ServiceForm
            form={createForm}
            onSubmit={onCreateSubmit}
            onCancel={() => setIsAddingNew(false)}
            isSubmitting={isCreating}
            serverError={createError}
            isEditMode={false}
          />
        ) : isEditing && selectedService ? (
          <ServiceForm
            form={editForm}
            onSubmit={onEditSubmit}
            onCancel={() => setIsEditing(false)}
            isSubmitting={isEditingSubmit}
            serverError={editError}
            isEditMode={true}
          />
        ) : (
          <ServiceDetailPanel
            service={selectedService}
            onToggleVisibility={handleToggleVisibility}
            onArchive={() => setIsArchiveModalOpen(true)}
            onEdit={() => setIsEditing(true)}
            isPending={isPending}
          />
        )}
      </div>

      {/* Archive Modal */}
      <ArchiveConfirmModal
        isOpen={isArchiveModalOpen}
        onConfirm={handleArchive}
        onCancel={() => setIsArchiveModalOpen(false)}
        isPending={isPending}
      />
    </div>
  );
}
