'use client';

import React from 'react';
import { useSecretaryPendingRequests, PENDING_CLINIC_HOURS } from '../../hooks/secretary/use-secretary-pending-requests';
import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { PendingDecisionForm } from './sub-components/pending-decision-form';
import { PendingDoctorSchedule } from './sub-components/pending-doctor-schedule';
import { PendingEditPanel } from './sub-components/pending-edit-panel';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { PendingRequestOverview } from './sub-components/pending-request-overview';
import { formatClinicTime, formatShortDate, formatTimeString } from '@/shared/utils/date.util';

import { InquiryDecisionCard } from './sub-components/inquiry-decision-card';
import { InquiryDropReason, InquirySecretaryNotes } from './sub-components/inquiry-notes-panels';
import { InquiryGuestProfile } from './sub-components/inquiry-guest-profile';
import { InquiryPatientLinking } from './sub-components/inquiry-patient-linking';
import { InquiryRequestContext } from './sub-components/inquiry-request-context';
import { InquirySchedulePanel } from './sub-components/inquiry-schedule-panel';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

function getDayOfWeek(dateStr: string) {
  if (!dateStr) return '';
  // Avoid time-zone offset issue by replacing hyphens and creating local date
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

function convertTo24h(time12h: string): string {
  if (!time12h) return '';
  const match = time12h.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return time12h;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function convertTo12h(time24h: string): string {
  if (!time24h) return '';
  if (time24h.toUpperCase().includes('AM') || time24h.toUpperCase().includes('PM')) {
    return time24h;
  }
  const [hoursStr, minutesStr] = time24h.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return time24h;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

function calculateEndTime(startTime24: string, durationMinutes: number): string {
  if (!startTime24) return '';
  const [hoursStr, minutesStr] = startTime24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return startTime24;
  
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  
  const period = endHours >= 12 ? 'PM' : 'AM';
  const displayHours = endHours % 12 === 0 ? 12 : endHours % 12;
  return `${displayHours}:${String(endMinutes).padStart(2, '0')} ${period}`;
}

function ConflictBanner({ conflictingAppointment }: { conflictingAppointment: any }) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 text-xs leading-relaxed text-rose-600 dark:text-rose-450">
      <strong className="font-black uppercase tracking-wider block mb-0.5">Booking Conflict Detected</strong>
      This patient already has an active appointment for <span className="font-bold underline">{conflictingAppointment.service?.name || 'treatment'}</span> scheduled at the same time: <span className="font-bold">{formatClinicTime(conflictingAppointment.startTime)} - {formatClinicTime(conflictingAppointment.endTime)}</span>.
    </div>
  );
}

export function SecretaryPendingRequestsViewV2() {
  const view = useSecretaryPendingRequests();
  const inquiriesView = useSecretaryInquiriesQueue();
  const [activeTab, setActiveTab] = React.useState<'registered' | 'guest'>('registered');
  const [activeAccordion, setActiveAccordion] = React.useState<'service' | 'doctor' | 'date' | 'time' | null>(null);
  const [isEditingGuest, setIsEditingGuest] = React.useState(false);

  const doctorSchedule = view.doctorSchedule || [];
  const availableStartSlots = PENDING_CLINIC_HOURS.filter((hour) => {
    const matched = doctorSchedule.find((s: any) => formatClinicTime(s.startTime) === hour);
    return !matched || (view.selectedAppointment && matched.id === view.selectedAppointment.id);
  });

  const handleStartSlotSelect = (val12h: string) => {
    const val24h = convertTo24h(val12h);
    view.setEditStartTime(val24h);
  };

  React.useEffect(() => {
    if (view.selectedAppointment) {
      if (!view.isEditing) {
        view.toggleEditing();
      }
      
      const appt = view.selectedAppointment;
      const serviceId = appt.serviceId || '';
      const doctorId = appt.doctorAssignmentSource === 'SYSTEM' ? '' : appt.doctorId || '';
      const date = appt.date || '';

      if (!serviceId) setActiveAccordion('service');
      else if (!doctorId) setActiveAccordion('doctor');
      else if (!date) setActiveAccordion('date');
      else setActiveAccordion('time');
    } else {
      setActiveAccordion(null);
    }
  }, [view.selectedAppointmentId, view.isEditing]);

  React.useEffect(() => {
    if (inquiriesView.selectedInquiry) {
      setIsEditingGuest(false);
      if (!inquiriesView.stagedInquiryService) setActiveAccordion('service');
      else if (!inquiriesView.stagedInquiryDate) setActiveAccordion('date');
      else if (!inquiriesView.stagedInquiryDoctor) setActiveAccordion('doctor');
      else setActiveAccordion('time');
    }
  }, [inquiriesView.selectedInquiryId]);

  return (
    <div className="flex-1 min-h-0 w-full overflow-hidden flex">
      {/* Left List Sidebar */}
      <PendingRequestListV2
        appointments={view.appointments}
        selectedAppointmentId={view.selectedAppointmentId}
        isLoadingAppointments={view.isLoading}
        onSelectAppointment={view.selectAppointment}

        inquiries={inquiriesView.inquiries}
        selectedInquiryId={inquiriesView.selectedInquiryId}
        isLoadingInquiries={inquiriesView.isLoadingInquiries}
        onSelectInquiry={(inq) => inquiriesView.selectInquiry(inq)}

        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Right Details Column (occupies remaining width) - data-lenis-prevent stops Lenis from hijacking nested scroll wheel events */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background/50 overflow-y-auto p-6 md:p-8" data-lenis-prevent>
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
          {activeTab === 'registered' ? (
            view.selectedAppointment ? (
              view.isLoadingDetails ? (
                <div className="h-full flex items-center justify-center text-xs text-text-muted py-12">Loading request details...</div>
              ) : (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  {/* Top Nav Header */}
                  <div className="flex items-center justify-between border-b border-card-border pb-3">
                    <h2 className="text-base font-semibold text-foreground">Request Details</h2>
                  </div>

                  {view.conflictingAppointment && <ConflictBanner conflictingAppointment={view.conflictingAppointment} />}

                  {/* PART 1: The Account Identity Card (Top Block) - Account Owner first */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 flex flex-col gap-3">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      💳 1. ACCOUNT OWNER (Primary Contact & Billing)
                    </h4>
                    <div className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-sm">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {view.patientDetails?.profile?.firstName} {view.patientDetails?.profile?.middleName ? `${view.patientDetails.profile.middleName} ` : ''}{view.patientDetails?.profile?.lastName}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suffix:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {view.patientDetails?.profile?.suffix || 'N/A'}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date of Birth:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {(() => {
                          const dob = view.patientDetails?.profile?.dateOfBirth;
                          if (!dob) return 'N/A';
                          const birthDate = new Date(dob);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const formattedDob = `${monthNames[birthDate.getMonth()]} ${birthDate.getDate()}, ${birthDate.getFullYear()}`;
                          return `${formattedDob} (Age: ${age})`;
                        })()}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {view.patientDetails?.profile?.phoneNumber || view.patientDetails?.profile?.phone || 'No phone'}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {view.patientDetails?.profile?.email || 'No email'}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Track Record:</span>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold items-center">
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          🟢 {view.patientDetails?.reliability?.completedCount || 0} Completed
                        </span>
                        <span className="text-rose-650 dark:text-rose-450 bg-rose-500/10 px-1.5 py-0.5 rounded">
                          🔴 {view.patientDetails?.reliability?.noShowCount || 0} No-Shows
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          🟡 {view.patientDetails?.reliability?.cancelCount || 0} Cancels
                        </span>
                        <span className="text-sky-650 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          🔵 {view.patientDetails?.reliability?.rescheduleCount || 0} Resched
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Downward Arrow */}
                  <div className="flex justify-center text-slate-400 py-1">
                    <span>⬇️ [ MANAGES ]</span>
                  </div>

                  {/* PART 2: Target Patient Context */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      👤 2. PATIENT INFORMATION & BOOKING TYPE
                    </h4>
                    <div className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-sm">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Booking Type:</span>
                      <div>
                        {view.selectedAppointment.dependent ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded">
                            👶 DEPENDENT BOOKING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded">
                            👨 SELF BOOKING
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {view.selectedAppointment.dependent ? (
                          <>
                            {view.selectedAppointment.dependent.firstName} {view.selectedAppointment.dependent.middleName ? `${view.selectedAppointment.dependent.middleName} ` : ''}{view.selectedAppointment.dependent.lastName}
                          </>
                        ) : (
                          <>
                            {view.patientDetails?.profile?.firstName} {view.patientDetails?.profile?.middleName ? `${view.patientDetails.profile.middleName} ` : ''}{view.patientDetails?.profile?.lastName}
                          </>
                        )}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suffix:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {view.selectedAppointment.dependent 
                          ? (view.selectedAppointment.dependent.suffix || 'N/A') 
                          : (view.patientDetails?.profile?.suffix || 'N/A')}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date of Birth:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {(() => {
                          const dob = view.selectedAppointment.dependent?.dateOfBirth || view.selectedAppointment.patient?.dateOfBirth || view.patientDetails?.profile?.dateOfBirth;
                          if (!dob) return '—';
                          const birthDate = new Date(dob);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const formattedDob = `${monthNames[birthDate.getMonth()]} ${birthDate.getDate()}, ${birthDate.getFullYear()}`;
                          return `${formattedDob} (Age: ${age})`;
                        })()}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patient Note:</span>
                      <span className="italic text-slate-700 dark:text-slate-300">
                        &quot;{view.selectedAppointment.userNote || 'No special instructions provided'}&quot;
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Downward Arrow */}
                  <div className="flex justify-center text-slate-400 py-1">
                    <span>⬇️ [ REQUESTS ]</span>
                  </div>

                  {/* PART 3: Requested Appointment Info Card */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
                    <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        📅 REQUESTED APPOINTMENT (INITIAL)
                      </h4>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Service */}
                      <div>
                        <div 
                          onClick={() => setActiveAccordion(activeAccordion === 'service' ? null : 'service')}
                          className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs shrink-0">{view.editServiceId ? '🟢' : '🔴'}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Service:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {view.editServices.find((s: any) => s.id === view.editServiceId)?.name || 'Unassigned'}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary hover:underline shrink-0">
                            {view.editServiceId ? '[ Edit ]' : '[ Set ]'}
                          </span>
                        </div>
                        {activeAccordion === 'service' && (
                          <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                            <Select
                              value={view.editServiceId}
                              onChange={(e) => {
                                view.setEditService(e.target.value);
                                setActiveAccordion('date');
                              }}
                              options={[
                                { value: '', label: 'Select Service...' },
                                ...view.editServices.map((s: any) => ({ value: s.id, label: s.name }))
                              ]}
                              className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div>
                        <div 
                          onClick={() => setActiveAccordion(activeAccordion === 'date' ? null : 'date')}
                          className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs shrink-0">{view.editDate ? '🟢' : '🔴'}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Date:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {view.editDate ? `${formatShortDate(view.editDate)} (${getDayOfWeek(view.editDate)})` : 'Unassigned'}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary hover:underline shrink-0">
                            {view.editDate ? '[ Edit ]' : '[ Set ]'}
                          </span>
                        </div>
                        {activeAccordion === 'date' && (
                          <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                            <input
                              type="date"
                              value={view.editDate}
                              onChange={(e) => {
                                view.setEditAppointmentDate(e.target.value);
                                view.setEditEndTime('');
                                setActiveAccordion('doctor');
                              }}
                              className="px-3 py-1.5 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-ring border-slate-200 dark:border-slate-800 w-full max-w-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Dentist */}
                      <div>
                        <div 
                          onClick={() => setActiveAccordion(activeAccordion === 'doctor' ? null : 'doctor')}
                          className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs shrink-0">{view.editDoctorId ? '🟢' : '🔴'}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Dentist:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {(() => {
                                const doc = view.editDoctors.find((d: any) => d.id === view.editDoctorId);
                                return doc ? `Dr. ${doc.firstName} ${doc.lastName}` : 'Unassigned';
                              })()}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary hover:underline shrink-0">
                            {view.editDoctorId ? '[ Edit ]' : '[ Set ]'}
                          </span>
                        </div>
                        {activeAccordion === 'doctor' && (
                          <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                            <Select
                              value={view.editDoctorId}
                              onChange={(e) => {
                                view.setEditDoctor(e.target.value);
                                view.setEditEndTime('');
                                setActiveAccordion('time');
                              }}
                              options={[
                                { value: '', label: 'Select Doctor...' },
                                ...view.editDoctors.map((d: any) => ({
                                  value: d.id,
                                  label: `Dr. ${d.firstName} ${d.lastName}`
                                }))
                              ]}
                              className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Time */}
                      <div>
                        <div 
                          onClick={() => setActiveAccordion(activeAccordion === 'time' ? null : 'time')}
                          className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs shrink-0">
                              {view.editStartTime && view.editEndTime 
                                ? '🟢' 
                                : (view.editStartTime || view.editEndTime || view.selectedAppointment.preferredStartTime) 
                                  ? '🟡' 
                                  : '🔴'}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Time Slot:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {view.editStartTime && view.editEndTime 
                                ? `${convertTo12h(view.editStartTime)} - ${convertTo12h(view.editEndTime)}` 
                                : view.editStartTime 
                                  ? `${convertTo12h(view.editStartTime)} (Pending End Time...)` 
                                  : view.editEndTime 
                                    ? `(Pending Start Time...) - ${convertTo12h(view.editEndTime)}` 
                                    : view.selectedAppointment.preferredStartTime 
                                      ? `${convertTo12h(convertTo24h(view.selectedAppointment.preferredStartTime))} (Pending End Time...)` 
                                      : 'Unassigned'}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary hover:underline shrink-0">
                            {(view.editStartTime && view.editEndTime) ? '[ Edit ]' : '[ Set ]'}
                          </span>
                        </div>
                        {activeAccordion === 'time' && (
                          <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                            <div className="flex items-center gap-2 max-w-md">
                              <Select
                                value={convertTo12h(view.editStartTime)}
                                onChange={(e) => handleStartSlotSelect(e.target.value)}
                                options={[
                                  { value: '', label: 'Select Start Time...' },
                                  ...availableStartSlots.map((slot) => ({ value: slot, label: slot }))
                                ]}
                                className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg flex-1"
                              />
                              <span className="text-xs text-text-muted">to</span>
                              <Select
                                value={convertTo12h(view.editEndTime)}
                                onChange={(e) => {
                                  view.setEditEndTime(convertTo24h(e.target.value));
                                  setActiveAccordion(null);
                                }}
                                options={[
                                  { value: '', label: 'Select End Time...' },
                                  ...PENDING_CLINIC_HOURS.map((hour) => ({ value: hour, label: hour }))
                                ]}
                                className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg flex-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Downward Arrow */}
                  <div className="flex justify-center text-slate-400 py-1">
                    <span>⬇️ [ DECISION ]</span>
                  </div>

                  {/* PART 4: Processing Actions */}
                  {(() => {
                    const isMissingDoctor = !view.editDoctorId;
                    const isMissingTime = !view.editStartTime || !view.editEndTime;
                    const isLocked = isMissingDoctor || isMissingTime;
                    
                    return (
                      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex flex-col gap-1">
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">🛠️ 4. ACTION CENTER</h4>
                          {isLocked && (
                            <span className="text-[10px] text-rose-500 font-semibold mt-1">
                              ⚠️ Please finish assigning {isMissingDoctor && isMissingTime ? 'the Dentist and Time Slot' : isMissingDoctor ? 'the Dentist' : 'the Time Slot'} to process this request.
                            </span>
                          )}
                        </div>

                        <PendingDecisionForm
                          stagedStatus={view.stagedStatus}
                          stagedReason={view.stagedReason}
                          customReason={view.customReason}
                          isSubmitting={view.isSubmitting}
                          onDecisionChange={view.setDecision}
                          onReasonChange={view.setReason}
                          onCustomReasonChange={view.setCustomReason}
                          onConfirm={() => view.finishAppointmentReview(view.selectedAppointment.id)}
                          isLockedForApproval={isLocked}
                        />
                      </div>
                    );
                  })()}
                </div>
              )
            ) : (
              <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20">
                <span className="text-3xl mb-3">📋</span>
                <h3 className="text-sm font-bold text-text-primary">No Selection</h3>
                <p className="text-xs text-text-muted max-w-xs mt-1">
                  Select a pending appointment request from the left column to view schedules, patient histories, and process booking reviews.
                </p>
              </div>
            )
          ) : (
            inquiriesView.selectedInquiry ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                {inquiriesView.inlineError && (
                  <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    Error: {inquiriesView.inlineError}
                  </div>
                )}
                
                {/* PART 1: Guest Profile Card */}
                <InquiryGuestProfile
                  firstName={inquiriesView.guestFirstName}
                  setFirstName={inquiriesView.setGuestFirstName}
                  middleName={inquiriesView.guestMiddleName}
                  setMiddleName={inquiriesView.setGuestMiddleName}
                  lastName={inquiriesView.guestLastName}
                  setLastName={inquiriesView.setGuestLastName}
                  suffix={inquiriesView.guestSuffix}
                  setSuffix={inquiriesView.setGuestSuffix}
                  phone={inquiriesView.guestPhone}
                  setPhone={inquiriesView.setGuestPhone}
                  email={inquiriesView.guestEmail}
                  setEmail={inquiriesView.setEmail}
                  patientNote={inquiriesView.selectedInquiry.patientNote || ''}
                  isEditing={isEditingGuest}
                  onToggle={() => setIsEditingGuest(!isEditingGuest)}
                />

                {/* Dynamic Downward Arrow */}
                <div className="flex justify-center text-slate-400 py-1">
                  <span>⬇️ [ REQUESTS ]</span>
                </div>

                {/* PART 3: Requested Appointment Info Card (Guest) */}
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      📅 3. REQUESTED APPOINTMENT (INITIAL)
                    </h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Service Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'service' ? null : 'service')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">{inquiriesView.stagedInquiryService ? '🟢' : '🔴'}</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Service:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.services.find((s) => s.id === inquiriesView.stagedInquiryService)?.name || 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {inquiriesView.stagedInquiryService ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'service' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <Select
                            value={inquiriesView.stagedInquiryService}
                            onChange={(e) => {
                              inquiriesView.selectService(e.target.value);
                              setActiveAccordion('date');
                            }}
                            options={[
                              { value: '', label: 'Select Service...' },
                              ...inquiriesView.services.map((s) => ({ value: s.id, label: s.name }))
                            ]}
                            className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Date Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'date' ? null : 'date')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">{inquiriesView.stagedInquiryDate ? '🟢' : '🔴'}</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Date:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.stagedInquiryDate ? `${formatShortDate(inquiriesView.stagedInquiryDate)} (${getDayOfWeek(inquiriesView.stagedInquiryDate)})` : 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {inquiriesView.stagedInquiryDate ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'date' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <input
                            type="date"
                            value={inquiriesView.stagedInquiryDate}
                            onChange={(e) => {
                              inquiriesView.selectDate(e.target.value);
                              setActiveAccordion('doctor');
                            }}
                            className="px-3 py-1.5 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-ring border-slate-200 dark:border-slate-800 w-full max-w-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Dentist Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'doctor' ? null : 'doctor')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">{inquiriesView.stagedInquiryDoctor ? '🟢' : '🔴'}</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Dentist:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.availableDoctors.find((d) => d.doctorId === inquiriesView.stagedInquiryDoctor)?.doctorName || 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {inquiriesView.stagedInquiryDoctor ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'doctor' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <Select
                            value={inquiriesView.stagedInquiryDoctor}
                            onChange={(e) => {
                              inquiriesView.selectDoctor(e.target.value);
                              setActiveAccordion('time');
                            }}
                            options={[
                              { value: '', label: 'Select Doctor...' },
                              ...inquiriesView.availableDoctors.map((d) => ({ value: d.doctorId, label: d.doctorName }))
                            ]}
                            className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Time Slot Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'time' ? null : 'time')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">
                            {inquiriesView.stagedInquiryTime && inquiriesView.stagedInquiryEndTime 
                              ? '🟢' 
                              : (inquiriesView.stagedInquiryTime || inquiriesView.stagedInquiryEndTime || inquiriesView.selectedInquiry.preferredStartTime) 
                                ? '🟡' 
                                : '🔴'}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Time Slot:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.stagedInquiryTime && inquiriesView.stagedInquiryEndTime 
                              ? `${convertTo12h(inquiriesView.stagedInquiryTime)} - ${convertTo12h(inquiriesView.stagedInquiryEndTime)}` 
                              : inquiriesView.stagedInquiryTime 
                                ? `${convertTo12h(inquiriesView.stagedInquiryTime)} (Pending End Time...)` 
                                : inquiriesView.stagedInquiryEndTime 
                                  ? `(Pending Start Time...) - ${convertTo12h(inquiriesView.stagedInquiryEndTime)}` 
                                  : inquiriesView.selectedInquiry.preferredStartTime 
                                    ? `${convertTo12h(convertTo24h(inquiriesView.selectedInquiry.preferredStartTime))} (Pending End Time...)` 
                                    : 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {(inquiriesView.stagedInquiryTime && inquiriesView.stagedInquiryEndTime) ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'time' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <div className="flex items-center gap-2 max-w-md">
                            <Select
                              value={convertTo12h(inquiriesView.stagedInquiryTime)}
                              onChange={(e) => inquiriesView.setStagedInquiryTime(convertTo24h(e.target.value))}
                              options={[
                                { value: '', label: 'Select Start Time...' },
                                ...PENDING_CLINIC_HOURS.map((hour) => ({ value: hour, label: hour }))
                              ]}
                              className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg flex-1"
                            />
                            <span className="text-xs text-text-muted">to</span>
                            <Select
                              value={convertTo12h(inquiriesView.stagedInquiryEndTime)}
                              onChange={(e) => {
                                inquiriesView.setStagedInquiryEndTime(convertTo24h(e.target.value));
                                setActiveAccordion(null);
                              }}
                              options={[
                                { value: '', label: 'Select End Time...' },
                                ...PENDING_CLINIC_HOURS.map((hour) => ({ value: hour, label: hour }))
                              ]}
                              className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg flex-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PART 4: PATIENT LINKING & NOTES (Guest) */}
                {inquiriesView.stagedInquiryAction === 'CONVERT' && (
                  <>
                    {/* Dynamic Downward Arrow */}
                    <div className="flex justify-center text-slate-400 py-1">
                      <span>⬇️ [ MANAGES ]</span>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          👤 4. PATIENT LINKING & NOTES
                        </h4>
                      </div>
                      <InquiryPatientLinking
                        patientMode={inquiriesView.patientMode}
                        setPatientMode={inquiriesView.setPatientMode}
                        patientSearchQuery={inquiriesView.patientSearchQuery}
                        setPatientSearchQuery={inquiriesView.setPatientSearchQuery}
                        patientSearchResults={inquiriesView.patientSearchResults}
                        isSearchingPatients={inquiriesView.isSearchingPatients}
                        selectedPatient={inquiriesView.selectedPatient}
                        onSelectPatient={inquiriesView.selectPatient}
                        onClearPatient={inquiriesView.clearPatient}
                      />
                      <InquirySecretaryNotes
                        value={inquiriesView.stagedSecretaryNotes}
                        onChange={inquiriesView.setSecretaryNotes}
                      />
                    </div>
                  </>
                )}

                {/* Dynamic Downward Arrow */}
                <div className="flex justify-center text-slate-400 py-1">
                  <span>⬇️ [ DECISION ]</span>
                </div>

                {/* PART 5: ACTION CENTER (Guest) */}
                {(() => {
                  const isMissingDoctor = !inquiriesView.stagedInquiryDoctor;
                  const isMissingTime = !inquiriesView.stagedInquiryTime || !inquiriesView.stagedInquiryEndTime;
                  const isLocked = isMissingDoctor || isMissingTime;
                  
                  return (
                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex flex-col gap-1">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">🛠️ 5. ACTION CENTER</h4>
                        {isLocked && (
                          <span className="text-[10px] text-rose-500 font-semibold mt-1">
                            ⚠️ Please finish assigning the Dentist and Time Slot to approve this request.
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          disabled={isLocked}
                          onClick={() => inquiriesView.setDecision('CONVERT')} 
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                            isLocked 
                              ? 'opacity-40 cursor-not-allowed bg-secondary-bg/5 border-card-border text-text-muted' 
                              : inquiriesView.stagedInquiryAction === 'CONVERT' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                                : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                          }`}
                        >
                          🟢 Approve Booking{isLocked ? ' (Locked)' : ''}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => inquiriesView.setDecision('DROP')} 
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                            inquiriesView.stagedInquiryAction === 'DROP' 
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
                              : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                          }`}
                        >
                          🔴 Reject Booking
                        </button>
                      </div>

                      {inquiriesView.stagedInquiryAction === 'DROP' && (
                        <div className="flex flex-col gap-2 mt-2">
                          <span className="text-xs font-bold text-text-secondary">Rejection Reason / Remarks (Required)</span>
                          <textarea
                            value={inquiriesView.stagedInquiryNote}
                            onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                            placeholder="Enter reason for dropping/archiving this inquiry..."
                            rows={3}
                            className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary resize-none focus:outline-none focus:border-primary-start/60"
                          />
                        </div>
                      )}

                      <Button
                        onClick={() => inquiriesView.submitReview(inquiriesView.selectedInquiry.id)}
                        disabled={!inquiriesView.canSubmit}
                        variant="primary"
                        className="w-full text-xs font-bold py-3 mt-2"
                      >
                        {inquiriesView.isSubmitting ? 'Saving Review...' : 'Finish Review Decision'}
                      </Button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20">
                <span className="text-3xl mb-3">📋</span>
                <h3 className="text-sm font-bold text-text-primary">No Selection</h3>
                <p className="text-xs text-text-muted max-w-xs mt-1">
                  Select an active guest inquiry from the left column to view details, link patients, and process booking reviews.
                </p>
              </div>
            )
          )}
        </div>
      </div>
      <InquiryToast toast={inquiriesView.toast} />
    </div>
  );
}
