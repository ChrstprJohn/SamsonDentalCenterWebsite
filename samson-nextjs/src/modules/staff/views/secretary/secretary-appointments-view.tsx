'use client';

import { useSecretaryAppointments } from '../../hooks/secretary/use-secretary-appointments';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { AppointmentsTable } from './sub-components/appointments-table';
import { AppointmentsTabsFilters } from './sub-components/appointments-tabs-filters';

export function SecretaryAppointmentsView() {
  const view = useSecretaryAppointments();

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointments Directory</h1>
        <p className="text-xs text-text-muted">
          Search and manage all clinic bookings, past records, and status change history ledger logs.
        </p>
      </div>
      <AppointmentsTabsFilters
        activeTab={view.activeTab}
        onTabChange={view.selectTab}
        searchTerm={view.searchTerm}
        setSearchTerm={view.setSearchTerm}
        dateFilter={view.dateFilter}
        setDateFilter={view.setDateFilter}
        doctorFilter={view.doctorFilter}
        setDoctorFilter={view.setDoctorFilter}
        historyStatusFilter={view.historyStatusFilter}
        setHistoryStatusFilter={view.setHistoryStatusFilter}
        doctors={view.doctors}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        <AppointmentsTable
          appointments={view.filteredAppointments}
          selectedAppointmentId={view.selectedAppointmentId}
          isLoading={view.isLoading}
          formatPatientName={view.formatPatientName}
          onSelect={view.setSelectedAppointmentId}
        />
        <AppointmentDetailPane view={view} />
      </div>
    </div>
  );
}
