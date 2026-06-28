'use client';

import { Input } from '@/components/ui/input';
import type { InquiryPatientMode } from '@/modules/staff/hooks/secretary/use-secretary-inquiries-queue';

interface InquiryPatientLinkingProps {
  patientMode: InquiryPatientMode;
  setPatientMode: (mode: InquiryPatientMode) => void;
  patientSearchQuery: string;
  setPatientSearchQuery: (value: string) => void;
  patientSearchResults: any[];
  isSearchingPatients: boolean;
  selectedPatient: any | null;
  onSelectPatient: (patient: any) => void;
  onClearPatient: () => void;
}

export function InquiryPatientLinking(props: InquiryPatientLinkingProps) {
  return (
    <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3">
      <label className="text-[10px] font-bold text-text-secondary uppercase">Patient Linking Options</label>
      <div className="flex bg-secondary-bg/25 p-1 rounded-xl gap-1">
        <ModeButton label="Continue as Guest" active={props.patientMode === 'GUEST'} onClick={() => props.setPatientMode('GUEST')} />
        <ModeButton label="Search Existing Patient" active={props.patientMode === 'SEARCH'} onClick={() => props.setPatientMode('SEARCH')} />
      </div>
      {props.patientMode === 'SEARCH' && (
        <div className="flex flex-col gap-3 mt-1">
          {!props.selectedPatient ? <PatientSearch {...props} /> : <LinkedPatient patient={props.selectedPatient} onClear={props.onClearPatient} />}
        </div>
      )}
    </div>
  );
}

function ModeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${active ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>{label}</button>;
}

function PatientSearch(props: InquiryPatientLinkingProps) {
  return (
    <>
      <div className="relative">
        <Input type="search" placeholder="Search name or email..." value={props.patientSearchQuery} onChange={(event) => props.setPatientSearchQuery(event.target.value)} className="text-xs pr-8" />
        {props.isSearchingPatients && <span className="absolute right-2.5 top-2.5 text-xs text-text-muted animate-spin">...</span>}
      </div>
      {props.patientSearchResults.length > 0 ? (
        <div className="max-h-48 overflow-y-auto border border-card-border/60 rounded-xl bg-card divide-y divide-card-border/40 text-xs">
          {props.patientSearchResults.map((patient) => (
            <div key={patient.id} onClick={() => props.onSelectPatient(patient)} className="p-2.5 hover:bg-secondary-bg/20 cursor-pointer flex justify-between items-center transition-colors">
              <div><div className="font-semibold text-text-primary">{patient.firstName} {patient.lastName}</div><div className="text-[10px] text-text-muted">{patient.email}</div></div>
              <div className="text-[10px] text-text-muted font-mono">{patient.phoneNumber}</div>
            </div>
          ))}
        </div>
      ) : props.patientSearchQuery.trim().length >= 2 && !props.isSearchingPatients ? (
        <div className="text-center py-4 text-xs text-text-muted bg-card border border-card-border/40 rounded-xl">No patient accounts found.</div>
      ) : null}
    </>
  );
}

function LinkedPatient({ patient, onClear }: { patient: any; onClear: () => void }) {
  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
      <div><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Linked Account</span><span className="text-xs font-semibold text-text-primary">{patient.firstName} {patient.lastName}</span><span className="text-[10px] text-text-muted block">{patient.email}</span></div>
      <button type="button" onClick={onClear} className="text-xs font-bold text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">Clear</button>
    </div>
  );
}
