import React from 'react';
import { Input } from '@/components/ui/input';
import { PRESET_SCENARIOS } from './constants';
import { SampleData } from './types';

export interface DynamicDataControlsProps {
  sample: SampleData;
  visibleFields: Set<string>;
  onUpdateField: <K extends keyof SampleData>(key: K, value: SampleData[K]) => void;
  onApplyPreset: (presetData: SampleData) => void;
  onClearAll: () => void;
}

export function DynamicDataControls({
  sample,
  visibleFields,
  onUpdateField,
  onApplyPreset,
  onClearAll,
}: DynamicDataControlsProps) {
  return (
    <aside className="hidden h-full min-h-0 flex-col border-t border-border bg-sidebar xl:flex xl:border-l xl:border-t-0 overflow-hidden">
      <div className="flex h-[61px] items-center border-b border-border p-4 shrink-0 bg-sidebar">
        <div>
          <div className="text-base font-medium text-foreground">Dynamic Data Controls</div>
          <p className="text-[11px] text-muted-foreground">Edit sample data fields live</p>
        </div>
      </div>

      <div
        data-lenis-prevent
        style={{ scrollbarWidth: 'thin' }}
        className="flex-1 min-h-0 !overflow-y-auto space-y-4 p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Presets</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onApplyPreset(preset.data)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-[11px] font-medium text-destructive transition hover:bg-destructive/20"
            >
              Clear All
            </button>
          </div>
        </div>

        <hr className="border-border/60" />

        <div className="space-y-3">
          {visibleFields.has('patientName') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Guest / Patient Name</label>
              <Input
                value={sample.patientName}
                onChange={(event) => onUpdateField('patientName', event.target.value)}
                placeholder="e.g. Alice Guest"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('serviceName') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Treatment Service</label>
              <Input
                value={sample.serviceName}
                onChange={(event) => onUpdateField('serviceName', event.target.value)}
                placeholder="e.g. Dental Cleaning"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('doctorName') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Assigned Doctor</label>
              <Input
                value={sample.doctorName}
                onChange={(event) => onUpdateField('doctorName', event.target.value)}
                placeholder="e.g. Dr. Adrian Samson"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('dateStr') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Appointment Date</label>
              <Input
                value={sample.dateStr}
                onChange={(event) => onUpdateField('dateStr', event.target.value)}
                placeholder="e.g. Monday, June 22, 2026"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('timeRangeStr') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Time Range</label>
              <Input
                value={sample.timeRangeStr}
                onChange={(event) => onUpdateField('timeRangeStr', event.target.value)}
                placeholder="e.g. 2:00 PM – 2:45 PM"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('oldDoctorName') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Previous Doctor</label>
              <Input
                value={sample.oldDoctorName}
                onChange={(event) => onUpdateField('oldDoctorName', event.target.value)}
                placeholder="e.g. Dr. Adrian Samson"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('oldServiceName') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Previous Service</label>
              <Input
                value={sample.oldServiceName}
                onChange={(event) => onUpdateField('oldServiceName', event.target.value)}
                placeholder="e.g. General Consultation"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('oldDateStr') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Previous Appointment Date</label>
              <Input
                value={sample.oldDateStr}
                onChange={(event) => onUpdateField('oldDateStr', event.target.value)}
                placeholder="e.g. Monday, June 15, 2026"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('oldTimeRangeStr') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Previous Time Range</label>
              <Input
                value={sample.oldTimeRangeStr}
                onChange={(event) => onUpdateField('oldTimeRangeStr', event.target.value)}
                placeholder="e.g. 9:00 AM – 9:30 AM"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('appointmentId') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Reference ID</label>
              <Input
                value={sample.appointmentId}
                onChange={(event) => onUpdateField('appointmentId', event.target.value)}
                placeholder="e.g. APT-GUEST-2026"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('referenceCode') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Reference Code (short)</label>
              <Input
                value={sample.referenceCode}
                onChange={(event) => onUpdateField('referenceCode', event.target.value)}
                placeholder="e.g. SDC-8921"
                className="h-9 text-xs rounded-lg bg-background"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Falls back to the first 8 chars of the Reference ID when empty.
              </span>
            </div>
          )}

          {visibleFields.has('calendarAddUrl') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Add-to-Calendar Link</label>
              <Input
                value={sample.calendarAddUrl}
                onChange={(event) => onUpdateField('calendarAddUrl', event.target.value)}
                placeholder="e.g. https://calendar.google.com/calendar/render?action=TEMPLATE&text=..."
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('googleMapsUrl') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Google Maps Link</label>
              <Input
                value={sample.googleMapsUrl}
                onChange={(event) => onUpdateField('googleMapsUrl', event.target.value)}
                placeholder="e.g. https://maps.google.com/?q=Samson+Dental+Center"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('rebookUrl') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Rebook Link</label>
              <Input
                value={sample.rebookUrl}
                onChange={(event) => onUpdateField('rebookUrl', event.target.value)}
                placeholder="e.g. https://samson-dental.com/book"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('baseUrl') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Base URL (Chat Redirect Link)</label>
              <Input
                value={sample.baseUrl}
                onChange={(event) => onUpdateField('baseUrl', event.target.value)}
                placeholder="e.g. http://localhost:3000"
                className="h-9 text-xs rounded-lg bg-background"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block font-mono">
                Action Link Target: {sample.baseUrl || 'http://localhost:3000'}/manage?token=...
              </span>
            </div>
          )}

          {visibleFields.has('rejectionReason') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Rejection Reason</label>
              <textarea
                value={sample.rejectionReason}
                onChange={(event) => onUpdateField('rejectionReason', event.target.value)}
                placeholder="e.g. The requested time slot is no longer available..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          )}

          {visibleFields.has('cancellationReason') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Cancellation Reason</label>
              <textarea
                value={sample.cancellationReason}
                onChange={(event) => onUpdateField('cancellationReason', event.target.value)}
                placeholder="e.g. This appointment has been cancelled as requested..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          )}

          {visibleFields.has('approvalReason') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Approval Reason / Note</label>
              <textarea
                value={sample.approvalReason}
                onChange={(event) => onUpdateField('approvalReason', event.target.value)}
                placeholder="e.g. Slot confirmed by clinic..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          )}

          {visibleFields.has('rescheduleReason') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Reschedule Reason</label>
              <textarea
                value={sample.rescheduleReason}
                onChange={(event) => onUpdateField('rescheduleReason', event.target.value)}
                placeholder="e.g. Patient requested new date..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          )}

          {visibleFields.has('checkoutNote') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Visit / Checkout Note</label>
              <textarea
                value={sample.checkoutNote}
                onChange={(event) => onUpdateField('checkoutNote', event.target.value)}
                placeholder="e.g. Treatment completed and reviewed with patient..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          )}

          {visibleFields.has('preferredStartTimeStr') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Preferred Time</label>
              <Input
                value={sample.preferredStartTimeStr}
                onChange={(event) => onUpdateField('preferredStartTimeStr', event.target.value)}
                placeholder="e.g. 2:00 PM"
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>
          )}

          {visibleFields.has('patientNote') && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Patient Note</label>
              <textarea
                value={sample.patientNote}
                onChange={(event) => onUpdateField('patientNote', event.target.value)}
                placeholder="e.g. Prefer mornings if possible..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
