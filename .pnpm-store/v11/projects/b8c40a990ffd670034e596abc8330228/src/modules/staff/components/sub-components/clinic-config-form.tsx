import React from 'react';
import { Button } from '@/components/ui/button';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

interface ClinicConfigFormProps {
  config: ClinicConfigResponseDto;
  setConfig: (config: ClinicConfigResponseDto) => void;
  isSavingConfig: boolean;
  handleConfigSave: (e: React.FormEvent) => void;
}

export function ClinicConfigForm({
  config,
  setConfig,
  isSavingConfig,
  handleConfigSave,
}: ClinicConfigFormProps) {
  return (
    <form onSubmit={handleConfigSave} className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Clinic Operation Rules</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Clinic Name</label>
          <input
            type="text"
            required
            value={config.clinicName}
            onChange={(e) => setConfig({ ...config, clinicName: e.target.value })}
            className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Operating Address</label>
          <input
            type="text"
            required
            value={config.address}
            onChange={(e) => setConfig({ ...config, address: e.target.value })}
            className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Same-Day Booking Policies</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={config.allowSameDayBooking}
              onChange={(e) => setConfig({ ...config, allowSameDayBooking: e.target.checked })}
            />
            <span className="text-xs text-text-secondary">Allow same-day slot bookings</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Max Reschedules Allowed Per Appointment</label>
          <input
            type="number"
            min="0"
            required
            value={config.maxReschedules}
            onChange={(e) => setConfig({ ...config, maxReschedules: parseInt(e.target.value) || 0 })}
            className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          />
        </div>
      </div>

      <div className="border-t border-card-border pt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-text-secondary">Online Scheduler Switch</span>
            <span className="text-[10px] text-text-muted">Open or close online booking portal</span>
          </div>
          <input
            type="checkbox"
            checked={config.isBookingOpen}
            onChange={(e) => setConfig({ ...config, isBookingOpen: e.target.checked })}
          />
        </div>

        {!config.isBookingOpen && (
          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-semibold text-text-secondary">Scheduler Maintenance Message</label>
            <textarea
              required
              value={config.maintenanceMessage || ''}
              onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
              placeholder="Enter custom maintenance banner text..."
              rows={3}
              className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSavingConfig} className="self-start mt-2">
        {isSavingConfig ? 'Saving Settings...' : 'Save Global Config'}
      </Button>
    </form>
  );
}
