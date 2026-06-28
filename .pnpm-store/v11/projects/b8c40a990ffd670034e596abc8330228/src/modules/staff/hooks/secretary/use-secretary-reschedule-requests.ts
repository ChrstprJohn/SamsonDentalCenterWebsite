'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDoctorScheduleAction } from '@/modules/appointments/actions/availability/get-doctor-schedule.action';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';

export type RescheduleDecision = 'APPROVED' | 'REJECTED' | '';

export const CLINIC_HOURS = [
  '8:00 AM',
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
] as const;

export function useSecretaryRescheduleRequests() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [doctorSchedule, setDoctorSchedule] = useState<any[]>([]);
  const [stagedStatus, setStagedStatus] = useState<RescheduleDecision>('');
  const [stagedReason, setStagedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const [appRes, docListRes] = await Promise.all([
      getClinicAppointmentsAction({ status: 'RESCHEDULE_REQUESTED' }),
      getDoctorsAction(),
    ]);

    if (appRes.success && appRes.data) {
      setAppointments(appRes.data);
    } else {
      console.error(appRes.error);
    }

    if (docListRes.success && docListRes.data) {
      setDoctorsList(docListRes.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId),
    [appointments, selectedAppointmentId]
  );

  useEffect(() => {
    if (!selectedAppointment) {
      setPatientDetails(null);
      setDoctorSchedule([]);
      return;
    }

    async function loadDetails() {
      setIsLoadingDetails(true);
      const targetDoctorId = selectedAppointment.proposedDoctorId || selectedAppointment.doctorId;
      const targetDate = selectedAppointment.proposedDate || selectedAppointment.date;
      const [patientRes, doctorRes] = await Promise.all([
        getPatientDetailsForStaffAction(selectedAppointment.patientId, selectedAppointment.dependentId || undefined),
        getDoctorScheduleAction(targetDoctorId, targetDate),
      ]);

      if (patientRes.success && patientRes.data) setPatientDetails(patientRes.data);
      if (doctorRes.success && doctorRes.data) setDoctorSchedule(doctorRes.data);
      setIsLoadingDetails(false);
    }

    loadDetails();
  }, [selectedAppointment]);

  const selectAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setStagedStatus('');
    setStagedReason('');
    setCustomReason('');
  };

  const setDecision = (status: Exclude<RescheduleDecision, ''>) => {
    setStagedStatus(status);
    setStagedReason('');
  };

  const setReason = (reason: string) => {
    setStagedReason(reason);
    setCustomReason('');
  };

  const finishReviewDecision = async (appointmentId: string) => {
    if (!stagedStatus) return alert('Please select a decision (Approve or Reject) first!');
    const finalReason = stagedReason === 'CUSTOM' ? customReason : stagedReason;
    if (!finalReason || !finalReason.trim()) return alert('Please select or write a reason/remark!');

    setIsSubmitting(true);
    const res = await updateAppointmentStatusAction({
      appointmentId,
      status: stagedStatus as any,
      statusReason: finalReason.trim(),
    });

    if (res.success) {
      alert('Review decision completed successfully.');
      setSelectedAppointmentId(null);
      setStagedStatus('');
      setStagedReason('');
      setCustomReason('');
      fetchRequests();
    } else {
      alert(res.error || 'Failed to update appointment status');
    }
    setIsSubmitting(false);
  };

  const getDoctorName = (docId: string | null) => {
    if (!docId) return 'No doctor assigned';
    const doc = doctorsList.find((doctor) => doctor.id === docId);
    if (!doc) return 'Doctor';
    return `${doc.prefix || 'Dr.'} ${doc.firstName} ${doc.lastName}`;
  };

  return {
    appointments,
    selectedAppointment,
    selectedAppointmentId,
    patientDetails,
    doctorSchedule,
    stagedStatus,
    stagedReason,
    customReason,
    isLoading,
    isSubmitting,
    isLoadingDetails,
    selectAppointment,
    setDecision,
    setReason,
    setCustomReason,
    finishReviewDecision,
    getDoctorName,
  };
}
