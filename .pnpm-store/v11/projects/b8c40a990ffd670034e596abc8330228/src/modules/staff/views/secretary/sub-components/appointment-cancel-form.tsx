'use client';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AppointmentCancelFormProps {
  reasonPreset: string;
  setReasonPreset: (value: string) => void;
  reasonCustom: string;
  setReasonCustom: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function AppointmentCancelForm(props: AppointmentCancelFormProps) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); props.onSubmit(); }} className="flex flex-col gap-3 border-t border-card-border/60 pt-3">
      <h4 className="text-xs font-bold text-red-500">Cancel Appointment Slot</h4>
      <div>
        <label className="text-[10px] text-text-muted mb-0.5 block">Select Reason</label>
        <Select value={props.reasonPreset} onChange={(event) => props.setReasonPreset(event.target.value)} className="text-xs w-full" options={[{ value: '', label: 'Select cancellation reason...' }, { value: 'Patient requested reschedule / cancellation', label: 'Patient requested' }, { value: 'Assigned dentist unavailable today', label: 'Dentist unavailable' }, { value: 'Unexpected clinic emergency / closure', label: 'Clinic emergency/holiday' }, { value: 'CUSTOM', label: 'Other (write below)' }]} />
      </div>
      {props.reasonPreset === 'CUSTOM' && (
        <div>
          <label className="text-[10px] text-text-muted mb-0.5 block">Details</label>
          <Textarea placeholder="Write custom cancellation reason..." value={props.reasonCustom} onChange={(event) => props.setReasonCustom(event.target.value)} className="text-xs w-full min-h-[60px]" required />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={props.isSubmitting} className="text-xs py-1.5 flex-1 bg-red-500 text-white hover:bg-red-600">{props.isSubmitting ? 'Processing...' : 'Cancel Appointment'}</Button>
        <Button type="button" onClick={props.onBack} className="text-xs py-1.5 flex-1 border border-card-border text-text-primary bg-transparent">Back</Button>
      </div>
    </form>
  );
}
