'use client';

import { Input } from '@/components/ui/input';
import type { BookingFor, PatientMode } from '@/modules/staff/hooks/secretary/use-secretary-book-appointment';

interface BookPatientIdentityPanelProps {
  patientMode: PatientMode;
  switchPatientMode: (mode: PatientMode) => void;
  patientSearchQuery: string;
  setPatientSearchQuery: (value: string) => void;
  patientSearchResults: any[];
  isSearchingPatients: boolean;
  selectedPatient: any | null;
  selectPatient: (patient: any) => void;
  clearSelectedPatient: () => void;
  dependents: any[];
  isLoadingDependents: boolean;
  bookingFor: BookingFor;
  setBookingFor: (value: BookingFor) => void;
  selectedDependent: any | null;
  setSelectedDependent: (value: any | null) => void;
  resetNewDepForm: () => void;
  newDependent: NewDependentFields;
  guest: GuestFields;
}

interface NewDependentFields {
  firstName: string; setFirstName: (value: string) => void;
  middleName: string; setMiddleName: (value: string) => void;
  lastName: string; setLastName: (value: string) => void;
  suffix: string; setSuffix: (value: string) => void;
  dob: string; setDob: (value: string) => void;
  relationship: string; setRelationship: (value: string) => void;
}

interface GuestFields {
  firstName: string; setFirstName: (value: string) => void;
  middleName: string; setMiddleName: (value: string) => void;
  lastName: string; setLastName: (value: string) => void;
  suffix: string; setSuffix: (value: string) => void;
  phoneNumber: string; setPhoneNumber: (value: string) => void;
  email: string; setEmail: (value: string) => void;
}

export function BookPatientIdentityPanel(props: BookPatientIdentityPanelProps) {
  return (
    <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-text-secondary">Patient Identity</h2>
        <p className="text-xs text-text-muted">Search registered patient or fill guest info.</p>
      </div>
      <ModeToggle mode={props.patientMode} onChange={props.switchPatientMode} />
      {props.patientMode === 'SEARCH' ? (
        <SearchPatientMode {...props} />
      ) : (
        <GuestForm fields={props.guest} />
      )}
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: PatientMode; onChange: (mode: PatientMode) => void }) {
  return (
    <div className="flex bg-secondary-bg/25 p-1 rounded-xl gap-1">
      <button type="button" onClick={() => onChange('SEARCH')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'SEARCH' ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Search Patient</button>
      <button type="button" onClick={() => onChange('GUEST')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'GUEST' ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Register Guest</button>
    </div>
  );
}

function SearchPatientMode(props: BookPatientIdentityPanelProps) {
  if (props.selectedPatient) return <SelectedPatientCard {...props} />;
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input type="search" placeholder="Search by name, email, or phone..." value={props.patientSearchQuery} onChange={(event) => props.setPatientSearchQuery(event.target.value)} className="text-xs pr-8" />
        {props.isSearchingPatients && <span className="absolute right-2.5 top-2.5 text-xs text-text-muted animate-spin">...</span>}
      </div>
      {props.patientSearchResults.length > 0 ? (
        <div className="max-h-48 overflow-y-auto border border-card-border/60 rounded-xl bg-card divide-y divide-card-border/40 text-xs">
          {props.patientSearchResults.map((patient) => (
            <div key={patient.id} onClick={() => props.selectPatient(patient)} className="p-2.5 hover:bg-secondary-bg/20 cursor-pointer flex justify-between items-center transition-colors">
              <div><div className="font-semibold text-text-primary">{patient.firstName} {patient.lastName}</div><div className="text-[10px] text-text-muted">{patient.email}</div></div>
              <div className="text-[10px] text-text-muted font-mono">{patient.phoneNumber}</div>
            </div>
          ))}
        </div>
      ) : props.patientSearchQuery.trim().length >= 2 && !props.isSearchingPatients ? (
        <div className="text-center py-4 text-xs text-text-muted bg-card border border-card-border/40 rounded-xl">No patient accounts found.</div>
      ) : null}
    </div>
  );
}

function SelectedPatientCard(props: BookPatientIdentityPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
        <div><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Linked Account</span><span className="text-xs font-semibold text-text-primary">{props.selectedPatient.firstName} {props.selectedPatient.lastName}</span><span className="text-[10px] text-text-muted block">{props.selectedPatient.email}</span></div>
        <button type="button" onClick={props.clearSelectedPatient} className="text-xs font-bold text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">Clear</button>
      </div>
      <DependentPicker {...props} />
    </div>
  );
}

function DependentPicker(props: BookPatientIdentityPanelProps) {
  return (
    <div className="border border-card-border/60 bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-2">
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Who is this appointment for?</span>
      {props.isLoadingDependents ? <div className="text-xs text-text-muted animate-pulse py-2">Loading dependents...</div> : (
        <div className="flex flex-col gap-1.5">
          <DependentOption label={`${props.selectedPatient.firstName} ${props.selectedPatient.lastName}`} caption="Account Holder" checked={props.bookingFor === 'SELF'} onChange={() => { props.setBookingFor('SELF'); props.setSelectedDependent(null); props.resetNewDepForm(); }} />
          {props.dependents.map((dependent) => (
            <DependentOption key={dependent.id} label={`${dependent.firstName}${dependent.middleName ? ` ${dependent.middleName}` : ''} ${dependent.lastName}`} caption={`${dependent.relationship?.toLowerCase()} | ${dependent.dateOfBirth}`} checked={props.bookingFor === 'EXISTING_DEP' && props.selectedDependent?.id === dependent.id} onChange={() => { props.setBookingFor('EXISTING_DEP'); props.setSelectedDependent(dependent); props.resetNewDepForm(); }} />
          ))}
          <NewDependentOption props={props} />
        </div>
      )}
    </div>
  );
}

function DependentOption({ label, caption, checked, onChange }: { label: string; caption: string; checked: boolean; onChange: () => void }) {
  return <label className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border transition-all ${checked ? 'bg-primary-start/10 border-primary-start/40' : 'border-transparent hover:bg-secondary-bg/30'}`}><input type="radio" name="bookingFor" checked={checked} onChange={onChange} className="accent-primary-start" /><div><div className="text-xs font-semibold text-text-primary">{label}</div><div className="text-[10px] text-text-muted capitalize">{caption}</div></div></label>;
}

function NewDependentOption({ props }: { props: BookPatientIdentityPanelProps }) {
  return (
    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer border transition-all ${props.bookingFor === 'NEW_DEP' ? 'bg-amber-500/10 border-amber-500/40' : 'border-transparent hover:bg-secondary-bg/30'}`}>
      <input type="radio" name="bookingFor" checked={props.bookingFor === 'NEW_DEP'} onChange={() => { props.setBookingFor('NEW_DEP'); props.setSelectedDependent(null); }} className="accent-primary-start mt-0.5" />
      <div className="flex-1"><div className="text-xs font-semibold text-amber-500">Add Dependent</div><div className="text-[10px] text-text-muted">Create and book for a new family member</div>{props.bookingFor === 'NEW_DEP' && <NewDependentFields fields={props.newDependent} />}</div>
    </label>
  );
}

function NewDependentFields({ fields }: { fields: NewDependentFields }) {
  return <div className="mt-3 flex flex-col gap-2"><div className="grid grid-cols-2 gap-2"><SmallInput label="First Name *" value={fields.firstName} onChange={fields.setFirstName} /><SmallInput label="Middle Name" value={fields.middleName} onChange={fields.setMiddleName} /><SmallInput label="Last Name *" value={fields.lastName} onChange={fields.setLastName} /><SmallInput label="Suffix" value={fields.suffix} onChange={fields.setSuffix} /></div><div className="grid grid-cols-2 gap-2"><SmallInput type="date" label="Date of Birth *" value={fields.dob} onChange={fields.setDob} /><div className="flex flex-col gap-1"><label className="text-[9px] font-bold text-text-muted uppercase">Relationship *</label><select value={fields.relationship} onChange={(event) => fields.setRelationship(event.target.value)} className="text-xs py-1.5 px-2.5 rounded-lg border border-card-border bg-card text-text-primary focus:outline-none focus:border-primary-start/50"><option value="">Select...</option><option value="CHILD">Child</option><option value="SPOUSE">Spouse</option><option value="SIBLING">Sibling</option><option value="PARENT">Parent</option><option value="OTHER">Other</option></select></div></div></div>;
}

function GuestForm({ fields }: { fields: GuestFields }) {
  return <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3"><div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Creating as Guest</div><div className="grid grid-cols-1 sm:grid-cols-4 gap-3"><SmallInput label="First Name *" value={fields.firstName} onChange={fields.setFirstName} className="sm:col-span-2" /><SmallInput label="Middle Name" value={fields.middleName} onChange={fields.setMiddleName} /><SmallInput label="Last Name *" value={fields.lastName} onChange={fields.setLastName} /><SmallInput label="Suffix" value={fields.suffix} onChange={fields.setSuffix} /><SmallInput label="Phone *" value={fields.phoneNumber} onChange={fields.setPhoneNumber} className="sm:col-span-2" placeholder="+639..." /><SmallInput type="email" label="Email (Optional)" value={fields.email} onChange={fields.setEmail} className="sm:col-span-2" /></div></div>;
}

function SmallInput({ label, value, onChange, type = 'text', className = '', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string; placeholder?: string }) {
  return <div className={`flex flex-col gap-1 ${className}`}><label className="text-[9px] font-bold text-text-muted uppercase">{label}</label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="text-xs py-1.5 px-2.5" placeholder={placeholder} /></div>;
}
