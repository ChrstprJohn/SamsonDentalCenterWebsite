// src/app/(portals)/secretary/inquiries/page.tsx
'use client';

import React, { useState } from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function InquiriesQueuePage() {
  const {
    inquiries,
    selectedInquiryId,
    setSelectedInquiryId,
    stagedInquiryAction,
    setStagedInquiryAction,
    stagedInquiryService,
    setStagedInquiryService,
    stagedInquiryDoctor,
    setStagedInquiryDoctor,
    stagedInquiryDate,
    setStagedInquiryDate,
    stagedInquiryTime,
    setStagedInquiryTime,
    stagedInquiryNote,
    setStagedInquiryNote,
    linkedPatientId,
    setLinkedPatientId,
    handleFinishInquiryReview,
    isSubmitting,
    patients,
  } = useSecretary();

  const activeInqs = inquiries.filter((i) => i.status === 'NEW');
  const selectedInq = inquiries.find((i) => i.id === selectedInquiryId);

  // Accordion open states
  const [isServiceOpen, setIsServiceOpen] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);

  // Guest edit profile state local sync
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestMiddleName, setGuestMiddleName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestSuffix, setGuestSuffix] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Calendar render states (June 2026 for mock consistency)
  const daysInJune = Array.from({ length: 30 }, (_, i) => i + 1);

  // Doctor mock list with shift schedules
  const getAvailableDoctors = (dateStr: string) => {
    if (!dateStr) return [];
    return [
      { id: 'doc-1', name: 'Dr. Christopher Samson', shift: 'M/W/F (08:00 AM - 05:00 PM)' },
      { id: 'doc-2', name: 'Dr. Sarah Samson', shift: 'T/Th/S (09:00 AM - 06:00 PM)' }
    ];
  };

  const availableDoctors = getAvailableDoctors(stagedInquiryDate);

  // Timeslots list with simulated status states (Active/Booked)
  const getDailyTimeslots = (docId: string, dateStr: string) => {
    if (!docId || !dateStr) return [];
    // Base timeslots
    const baseSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];
    
    // Simulate some booked/disabled slots based on day number
    const day = new Date(dateStr).getDate();
    return baseSlots.map((slot, index) => {
      const isBooked = (day + index) % 3 === 0;
      return { time: slot, isAvailable: !isBooked };
    });
  };

  const timeslots = getDailyTimeslots(stagedInquiryDoctor, stagedInquiryDate);

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Inquiries Queue</h1>
        <p className="text-xs text-text-muted">
          Manage guest inquiries. Convert them directly into appointments or drop/archive the records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Column - Inquiries Table */}
        <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="text-sm font-bold text-text-primary mb-3">Active Inquiries ({activeInqs.length})</div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Guest Name</th>
                  <th className="py-3 px-2">Service</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {activeInqs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      No active inquiries.
                    </td>
                  </tr>
                ) : (
                  activeInqs.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => {
                        setSelectedInquiryId(inq.id);
                        setStagedInquiryAction('CONVERT');
                        setStagedInquiryService(inq.preferredServiceId);
                        setStagedInquiryDate(inq.preferredDate);
                        setStagedInquiryDoctor('');
                        setStagedInquiryTime('');
                        setStagedInquiryNote(inq.patientNote || '');
                        setLinkedPatientId(null);
                        setGuestFirstName(inq.firstName);
                        setGuestMiddleName(inq.middleName || '');
                        setGuestLastName(inq.lastName);
                        setGuestSuffix(inq.suffix || '');
                        setGuestPhone(inq.phoneNumber);
                        setGuestEmail(inq.email);
                        setIsServiceOpen(true);
                        setIsScheduleOpen(true);
                      }}
                      className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                        selectedInquiryId === inq.id ? 'bg-secondary-bg/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-2 font-semibold text-text-primary">
                        {inq.firstName} {inq.middleName ? `${inq.middleName} ` : ''}{inq.lastName} {inq.suffix || ''}
                      </td>
                      <td className="py-3.5 px-2 text-text-secondary">{inq.preferredServiceName}</td>
                      <td className="py-3.5 px-2 text-text-muted">
                        {inq.preferredDate}
                      </td>
                      <td className="py-3.5 px-2 text-text-muted">
                        {inq.email}
                      </td>
                      <td className="py-3.5 px-2 text-text-muted">
                        {inq.phoneNumber}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Details Pane with Accordions */}
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md overflow-y-auto max-h-[75vh] flex flex-col gap-4 justify-between">
          {selectedInq ? (
            <div className="flex flex-col gap-4 h-full justify-between">
              <div className="flex flex-col gap-4">
                
                {/* 1. Guest Profile Card */}
                <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex justify-between items-center">
                    <span>👤 Guest Profile</span>
                    <span className="text-[9px] bg-primary-start/15 text-primary-start px-2 py-0.5 rounded-md font-black uppercase">
                      Editable
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-text-muted uppercase">First Name</label>
                      <Input
                        type="text"
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Middle Name</label>
                      <Input
                        type="text"
                        value={guestMiddleName}
                        onChange={(e) => setGuestMiddleName(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Last Name</label>
                      <Input
                        type="text"
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Suffix</label>
                      <Input
                        type="text"
                        value={guestSuffix}
                        onChange={(e) => setGuestSuffix(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Phone</label>
                      <Input
                        type="text"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Email</label>
                      <Input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Dominant Staged Action Selector (Action-First Flow) */}
                <div className="border border-card-border/80 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2">
                  <span className="text-xs font-black text-text-primary uppercase tracking-wider">🎯 Review Action Decision</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStagedInquiryAction('CONVERT')}
                      className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all flex items-center justify-center gap-2 ${
                        stagedInquiryAction === 'CONVERT'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50 shadow-sm font-black'
                          : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <span>🔄</span> Convert to Appointment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStagedInquiryAction('DROP');
                        setLinkedPatientId(null);
                        setStagedInquiryNote(''); // Reset note for drop justification
                      }}
                      className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all flex items-center justify-center gap-2 ${
                        stagedInquiryAction === 'DROP'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/50 shadow-sm font-black'
                          : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <span>🗑️</span> Drop Inquiry
                    </button>
                  </div>
                </div>

                {/* 3. Initial Request Details Card */}
                <div className="border border-card-border bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2 text-xs">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    📋 Initial Request Context
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-secondary">
                    <div>
                      <span className="text-text-muted">Requested Service:</span>{' '}
                      <span className="font-semibold text-text-primary">{selectedInq.preferredServiceName}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Requested Date:</span>{' '}
                      <span className="font-semibold text-text-primary">{selectedInq.preferredDate}</span>
                    </div>
                  </div>
                  {selectedInq.patientNote && (
                    <div className="mt-1 text-[11px] italic text-text-muted bg-card p-2 rounded-lg border border-card-border/40">
                      "{selectedInq.patientNote}"
                    </div>
                  )}
                </div>

                {/* Dynamic Content based on selected Action */}
                {stagedInquiryAction === 'CONVERT' ? (
                  <div className="flex flex-col gap-3 animate-fadeIn">
                    
                    {/* Service Selection Accordion */}
                    <div className="border border-card-border/60 rounded-2xl overflow-hidden bg-secondary-bg/10">
                      <button
                        type="button"
                        onClick={() => setIsServiceOpen(!isServiceOpen)}
                        className="w-full px-4 py-3 flex justify-between items-center text-xs font-bold text-text-primary bg-secondary-bg/25 border-b border-card-border/40 hover:bg-secondary-bg/40 transition-colors"
                      >
                        <span>🩺 Service Selection</span>
                        <span>{isServiceOpen ? '▾' : '▸'}</span>
                      </button>
                      {isServiceOpen && (
                        <div className="p-4 flex flex-col gap-2">
                          <label className="text-[9px] font-bold text-text-secondary uppercase">Select Service</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'srv-1', label: 'Routine Cleaning' },
                              { id: 'srv-2', label: 'Root Canal' },
                              { id: 'srv-3', label: 'Implant Consult' },
                            ].map((srv) => (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() => setStagedInquiryService(srv.id)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                  stagedInquiryService === srv.id
                                    ? 'bg-primary-start text-white border-primary-start shadow-sm'
                                    : 'bg-card border-card-border text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                {srv.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Schedule Details Accordion */}
                    <div className="border border-card-border/60 rounded-2xl overflow-hidden bg-secondary-bg/10">
                      <button
                        type="button"
                        onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                        className="w-full px-4 py-3 flex justify-between items-center text-xs font-bold text-text-primary bg-secondary-bg/25 border-b border-card-border/40 hover:bg-secondary-bg/40 transition-colors"
                      >
                        <span>📅 Schedule & Availability</span>
                        <span>{isScheduleOpen ? '▾' : '▸'}</span>
                      </button>
                      {isScheduleOpen && (
                        <div className="p-4 flex flex-col gap-5">
                          
                          {/* Step A: Visual Calendar Grid */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Select Booking Date</label>
                            <div className="p-3 bg-card border border-card-border rounded-2xl">
                              <div className="text-center font-bold text-xs text-text-primary mb-2">June 2026</div>
                              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
                                  <div key={`${d}-${index}`} className="font-bold text-text-muted py-1">{d}</div>
                                ))}
                                {daysInJune.map((d) => {
                                  const fullDate = `2026-06-${d.toString().padStart(2, '0')}`;
                                  const isSelected = stagedInquiryDate === fullDate;
                                  return (
                                    <button
                                      key={d}
                                      type="button"
                                      onClick={() => {
                                        setStagedInquiryDate(fullDate);
                                        setStagedInquiryDoctor('');
                                        setStagedInquiryTime('');
                                      }}
                                      className={`py-1.5 rounded-lg font-semibold hover:bg-secondary-bg transition-colors ${
                                        isSelected
                                          ? 'bg-primary-start text-white hover:bg-primary-start'
                                          : 'text-text-secondary'
                                      }`}
                                    >
                                      {d}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Step B: Doctor cards with Shift Indicators */}
                          {stagedInquiryDate && (
                            <div className="flex flex-col gap-2 animate-fadeIn">
                              <label className="text-[10px] font-bold text-text-secondary uppercase">Available Dentists</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {availableDoctors.map((doc) => {
                                  const isSelected = stagedInquiryDoctor === doc.id;
                                  return (
                                    <div
                                      key={doc.id}
                                      onClick={() => {
                                        setStagedInquiryDoctor(doc.id);
                                        setStagedInquiryTime('');
                                      }}
                                      className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col gap-1 ${
                                        isSelected
                                          ? 'bg-primary-start/10 border-primary-start/50'
                                          : 'bg-card border-card-border hover:border-text-muted/30'
                                      }`}
                                    >
                                      <span className="text-xs font-bold text-text-primary">{doc.name}</span>
                                      <span className="text-[9px] text-text-muted">{doc.shift}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Step C: Full Timeslots Grid with Active/Disabled states */}
                          {stagedInquiryDoctor && timeslots.length > 0 && (
                            <div className="flex flex-col gap-2 animate-fadeIn">
                              <label className="text-[10px] font-bold text-text-secondary uppercase">Timeslot Availability</label>
                              <div className="grid grid-cols-3 gap-2">
                                {timeslots.map((slot) => {
                                  const isSelected = stagedInquiryTime === slot.time;
                                  return (
                                    <button
                                      key={slot.time}
                                      type="button"
                                      disabled={!slot.isAvailable}
                                      onClick={() => setStagedInquiryTime(slot.time)}
                                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                                        isSelected
                                          ? 'bg-primary-start text-white border-primary-start shadow-sm'
                                          : slot.isAvailable
                                          ? 'border-card-border bg-card text-text-secondary hover:text-text-primary'
                                          : 'border-card-border bg-secondary-bg/30 text-text-muted opacity-50 cursor-not-allowed'
                                      }`}
                                    >
                                      {slot.time}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Patient identity linking card */}
                    <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Link to Patient Profile</label>
                      <Select
                        value={linkedPatientId || ''}
                        onChange={(e) => setLinkedPatientId(e.target.value || null)}
                        className="text-xs"
                        options={[
                          { value: '', label: 'Register as Guest (userId: null)' },
                          ...patients.map((pat) => ({
                            value: pat.id,
                            label: `${pat.firstName} ${pat.lastName} (${pat.email})`,
                          })),
                        ]}
                      />
                    </div>
                  </div>
                ) : stagedInquiryAction === 'DROP' ? (
                  <div className="flex flex-col gap-3 animate-fadeIn">
                    {/* Reason for dropping */}
                    <div className="border border-card-border bg-rose-500/5 rounded-2xl p-4 flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-primary uppercase">Reason for Dropping *</label>
                      <textarea
                        value={stagedInquiryNote}
                        onChange={(e) => setStagedInquiryNote(e.target.value)}
                        placeholder="Please specify why this inquiry is being dropped/rejected..."
                        rows={4}
                        className="w-full text-xs p-3 rounded-xl border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50"
                      />
                      <span className="text-[10px] text-text-muted">
                        * Required to justify dropping unauthenticated inquiries.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-card-border rounded-2xl p-8 text-center text-xs text-text-muted">
                    Choose a review action above to begin processing this inquiry.
                  </div>
                )}
              </div>

              {/* Action Form Footer */}
              <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3 mt-auto">
                <Button
                  onClick={() => handleFinishInquiryReview(selectedInq.id)}
                  disabled={
                    isSubmitting ||
                    !stagedInquiryAction ||
                    (stagedInquiryAction === 'CONVERT' && (!stagedInquiryService || !stagedInquiryDate || !stagedInquiryDoctor || !stagedInquiryTime)) ||
                    (stagedInquiryAction === 'DROP' && !stagedInquiryNote.trim())
                  }
                  variant="primary"
                  className="w-full text-xs font-bold py-3 mt-2"
                >
                  {isSubmitting ? 'Processing...' : 'Finish Inquiry Review'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select an active guest inquiry from the table to start reviewing details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
