'use client';

import React, { useMemo, useState } from 'react';
import { useDoctorManagement, Doctor } from '../hooks/use-doctor-management';
import { DoctorList } from './doctor-list';
import { DoctorDetailsPane } from './doctor-details-pane';
import { ArrowLeft, UserCheck, Plus, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarHeader, SidebarInput, SidebarTrigger } from '@/components/ui/sidebar';

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

  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const colMobile = (v: 'list' | 'detail') => (mobileView === v ? 'flex' : 'hidden');
  const hasSelection = !!selectedDoctor || isAddingNew;

  const handleSelect = (id: string) => {
    handleSelectDoctor(id);
    setMobileView('detail');
  };

  const handleAdd = () => {
    handleStartAddDoctor();
    setMobileView('detail');
  };

  const activeCount = useMemo(() => initialDoctors.filter((d) => d.status === 'ACTIVE' || d.status === 'FORCE_PASSWORD_CHANGE').length, [initialDoctors]);
  const archivedCount = useMemo(() => initialDoctors.filter((d) => d.status === 'ARCHIVED').length, [initialDoctors]);

  const TABS = [
    { key: 'ACTIVE', label: 'Active', count: activeCount },
    { key: 'ARCHIVED', label: 'Archived', count: archivedCount },
  ];

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      {/* Left Roster Sidebar Pane */}
      <Sidebar
        collapsible="none"
        className={`flex-col lg:w-[350px] flex-1 lg:flex-none border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${colMobile('list')} lg:flex`}
      >
        <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
          <div className="flex w-full h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
              <div className="text-base font-medium text-foreground">
                Dentists List
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={isAddingNew}
              className="h-8 px-2.5 text-xs rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 outline-none select-none active:scale-[0.98] flex items-center gap-1 shadow-sm"
            >
              <UserPlus className="size-3.5" />
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
              <Button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                variant="ghost"
                size="sm"
                className={`flex-1 h-8 text-xs font-semibold rounded-xl transition-all ${
                  statusFilter === tab.key
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>
        </SidebarHeader>

        <DoctorList
          doctors={filteredDoctors}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={handleSelect}
          isAddingNew={isAddingNew}
        />
      </Sidebar>

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
                    ? 'Add New Doctor'
                    : 'Doctor Details'}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {selectedDoctor ? 'Dentist Profile Details' : 'Account creation & clinician profile setup'}
                </span>
              </div>
            </div>
          </div>
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
      ) : (
        <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 max-lg:hidden flex p-6 text-center">
          <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
            <Users className="size-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No Doctor Selected</p>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">Select a doctor from the list to view clinician profile details and shifts.</p>
        </div>
      )}
    </div>
  );
}

