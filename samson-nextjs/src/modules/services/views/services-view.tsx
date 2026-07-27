'use client';

import React, { useMemo, useState } from 'react';
import type { Service } from '../types';
import { useServicesView } from '../hooks/services/use-services-view';
import { useServiceForm } from '../hooks/services/use-service-form';
import { useServiceDetail } from '../hooks/services/use-service-detail';
import { ServiceList } from '../components/service-list';
import { ServiceDetailPanel } from '../components/service-detail-panel';
import { ServiceForm } from '../components/service-form';
import { ArchiveConfirmModal } from '../components/archive-confirm-modal';
import { ArrowLeft, Stethoscope, Plus, Layers } from 'lucide-react';
import { SidebarHeader, SidebarInput, SidebarTrigger } from '@/components/ui/sidebar';

interface ServicesViewProps {
  initialServices: Service[];
}

export function ServicesView({ initialServices }: ServicesViewProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

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

  const {
    isEditing,
    setIsEditing,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    isPending,
    handleArchive,
    handleToggleVisibility,
  } = useServiceDetail({
    service: selectedService,
    onSuccess: () => {
      setIsEditing(false);
    },
  });

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
    setMobileView('detail');
  };

  const handleAdd = () => {
    setSelectedServiceId(null);
    setIsEditing(false);
    setIsAddingNew(true);
    setMobileView('detail');
  };

  const colMobile = (v: 'list' | 'detail') => (mobileView === v ? 'flex' : 'hidden');
  const hasSelection = !!selectedService || isAddingNew;

  const activeCount = useMemo(() => initialServices.filter((s) => s.status === 'ACTIVE').length, [initialServices]);
  const hiddenCount = useMemo(() => initialServices.filter((s) => s.status === 'HIDDEN').length, [initialServices]);
  const archivedCount = useMemo(() => initialServices.filter((s) => s.status === 'ARCHIVED').length, [initialServices]);

  const TABS = [
    { key: 'ACTIVE' as const, label: 'Active', count: activeCount },
    { key: 'HIDDEN' as const, label: 'Hidden', count: hiddenCount },
    { key: 'ARCHIVED' as const, label: 'Archived', count: archivedCount },
  ];

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      {/* Left Roster Sidebar Pane */}
      <div className={`lg:w-[350px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar min-h-0 overflow-hidden ${colMobile('list')} lg:flex`}>
        <SidebarHeader className="gap-3.5 border-b border-card-border/40 p-4 shrink-0">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-base font-medium text-foreground">
              <div className="lg:hidden">
                <SidebarTrigger />
              </div>
              <span>Service Catalog</span>
            </div>
            <button
              onClick={handleAdd}
              className="h-8 px-2.5 text-xs rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 outline-none select-none active:scale-[0.98] flex items-center gap-1 shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="px-1">
            <SidebarInput
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md"
            />
          </div>

          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex-1 h-8 text-xs rounded-xl font-semibold transition-all duration-300 outline-none select-none active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                  statusFilter === tab.key
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </SidebarHeader>

        <ServiceList
          services={filteredServices}
          selectedId={selectedServiceId}
          onSelect={handleSelectService}
        />
      </div>

      {/* Right Detail Pane */}
      {hasSelection ? (
        <div className={`flex flex-1 flex-col min-w-0 min-h-0 h-full ${colMobile('detail')} lg:flex`}>
          <div className="p-4 border-b border-card-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileView('list')} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex-1 flex flex-col text-left min-w-0">
                <span className="text-base font-medium text-foreground truncate">
                  {isAddingNew
                    ? 'New Treatment Service'
                    : selectedService?.name}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {selectedService ? (selectedService.serviceType === 'SPECIALIZED' ? 'Specialized Service' : 'General Service') : 'Create practice catalog treatment item'}
                </span>
              </div>
            </div>
          </div>
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
      ) : (
        <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 max-lg:hidden flex p-6 text-center">
          <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
            <Stethoscope className="size-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No Service Selected</p>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">Select a treatment service from the catalog to view details, price, and booking rules.</p>
        </div>
      )}

      {/* Archive Modal */}
      <ArchiveConfirmModal
        isOpen={isArchiveModalOpen}
        onConfirm={handleArchive}
        onCancel={() => setIsArchiveModalOpen(false)}
        isPending={isPending}
        isArchived={selectedService?.status === 'ARCHIVED'}
      />
    </div>
  );
}
