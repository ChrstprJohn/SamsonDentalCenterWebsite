'use client';

import React from 'react';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';
import { AdminAnalyticsSummary } from '../components/sub-components/admin-analytics-summary';
import { ClinicConfigForm } from '../components/sub-components/clinic-config-form';
import { ServicesCrudPanel } from '../components/sub-components/services-crud-panel';
import { DoctorsCrudPanel } from '../components/sub-components/doctors-crud-panel';
import { AdminAuditLogs } from '../components/sub-components/admin-audit-logs';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

interface AdminDashboardViewProps {
  initialConfig: ClinicConfigResponseDto;
}

export function AdminDashboardView({ initialConfig }: AdminDashboardViewProps) {
  const {
    config,
    setConfig,
    services,
    doctors,
    audits,
    activeTab,
    setActiveTab,
    isSavingConfig,
    newSvcName,
    setNewSvcName,
    newSvcDuration,
    setNewSvcDuration,
    newSvcPrice,
    setNewSvcPrice,
    newDocName,
    setNewDocName,
    newDocSpec,
    setNewDocSpec,
    handleConfigSave,
    handleAddService,
    handleAddDoctor,
  } = useAdminDashboard({ initialConfig });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Admin Portal</h2>
        <p className="text-xs text-text-muted">
          Configure operational thresholds, update clinic hours, and manage service rosters CRUD panels.
        </p>
      </div>

      <AdminAnalyticsSummary
        passedBookingsCount={404}
        activeServicesCount={services.length}
        rosteredDoctorsCount={doctors.length}
      />

      {/* Roster Tabs */}
      <div className="flex gap-2 border-b border-card-border pb-2">
        {(['CONFIG', 'SERVICES', 'DOCTORS', 'AUDITS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-md shadow-primary-start/10'
                : 'text-text-secondary hover:bg-secondary-bg'
            }`}
          >
            {tab === 'CONFIG'
              ? '🔧 Global Config'
              : tab === 'SERVICES'
              ? '🧼 Manage Services'
              : tab === 'DOCTORS'
              ? '👨‍⚕️ Manage Doctors'
              : '📜 System Audits'}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex flex-col gap-6">
        {activeTab === 'CONFIG' && (
          <ClinicConfigForm
            config={config}
            setConfig={setConfig}
            isSavingConfig={isSavingConfig}
            handleConfigSave={handleConfigSave}
          />
        )}

        {activeTab === 'SERVICES' && (
          <ServicesCrudPanel
            services={services}
            newSvcName={newSvcName}
            setNewSvcName={setNewSvcName}
            newSvcDuration={newSvcDuration}
            setNewSvcDuration={setNewSvcDuration}
            newSvcPrice={newSvcPrice}
            setNewSvcPrice={setNewSvcPrice}
            handleAddService={handleAddService}
          />
        )}

        {activeTab === 'DOCTORS' && (
          <DoctorsCrudPanel
            doctors={doctors}
            newDocName={newDocName}
            setNewDocName={setNewDocName}
            newDocSpec={newDocSpec}
            setNewDocSpec={setNewDocSpec}
            handleAddDoctor={handleAddDoctor}
          />
        )}

        {activeTab === 'AUDITS' && <AdminAuditLogs audits={audits} />}
      </div>
    </div>
  );
}
