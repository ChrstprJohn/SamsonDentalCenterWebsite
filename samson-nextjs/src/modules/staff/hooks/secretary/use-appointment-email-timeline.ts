'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getEmailLogsByAppointmentAction } from '@/modules/emails/actions/logs/get-email-logs-by-appointment.action';
import { resendEmailAction } from '@/modules/emails/actions/logs/resend-email.action';
import { getCommunicationActivityAction } from '@/modules/emails/actions/logs/get-communication-activity.action';
import type { CommunicationActivityMap } from '@/modules/emails/actions/logs/get-communication-activity.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';

export type LeftTab = 'all' | 'failed';

export interface TimelineEntry {
  id: string;
  channel: 'EMAIL' | 'SMS';
  eventType: string;
  status: string;
  rawStatus: string;
  recipient: string;
  timestamp: string;
  retryCount: number;
  errorLogs: string | null;
  payload: Record<string, any>;
}

export interface AppointmentCardData {
  id: string;
  patientName: string;
  treatmentName: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  doctorName: string;
  channelsUsed: {
    email: boolean;
    sms: boolean;
  };
  lastActivity: string | null;
  hasFailed: boolean;
  failureCount: number;
  latestEventPreview?: string;
}

export function useAppointmentEmailTimeline() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [activityMap, setActivityMap] = useState<CommunicationActivityMap>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [emailLogs, setEmailLogs] = useState<OutboxLogResponseDto[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('all');

  const fetchAppointments = useCallback(async () => {
    setIsLoadingApps(true);
    const [appRes, actRes] = await Promise.all([
      getClinicAppointmentsAction({}),
      getCommunicationActivityAction(),
    ]);
    if (appRes.success && appRes.data) {
      setAppointments(appRes.data as AppointmentDto[]);
    }
    if (actRes.success && actRes.data) {
      setActivityMap(actRes.data);
    }
    setIsLoadingApps(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const fetchEmailLogs = useCallback(async (appointmentId: string) => {
    setIsLoadingLogs(true);
    const res = await getEmailLogsByAppointmentAction(appointmentId);
    if (res.success && res.data) {
      setEmailLogs(res.data);
    } else {
      setEmailLogs([]);
    }
    setIsLoadingLogs(false);
  }, []);

  const resendEmail = useCallback(async (id: string) => {
    setResendingId(id);
    const res = await resendEmailAction({ id });
    if (res?.error) {
      console.error('Resend failed:', res.error);
    }
    setResendingId(null);
    if (selectedAppointmentId) fetchEmailLogs(selectedAppointmentId);
  }, [fetchEmailLogs, selectedAppointmentId]);

  useEffect(() => {
    if (selectedAppointmentId) {
      fetchEmailLogs(selectedAppointmentId);
    } else {
      setEmailLogs([]);
    }
  }, [selectedAppointmentId, fetchEmailLogs]);

  const selectedAppointment = useMemo(
    () => appointments.find((a) => a.id === selectedAppointmentId) ?? null,
    [appointments, selectedAppointmentId]
  );

  const formatPatientName = (app: AppointmentDto): string => {
    if (app.dependent) {
      const holder = app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Unknown';
      return `${app.dependent.firstName} ${app.dependent.lastName} (${holder})`;
    }
    if (app.source === 'STAFF_CREATED' && !app.patientId) {
      if (app.guestContact) {
        return `${app.guestContact.firstName ?? ''} ${app.guestContact.lastName ?? ''}`.trim() || 'Guest';
      }
      return 'Guest';
    }
    return app.patient
      ? `${app.patient.firstName} ${app.patient.lastName}`
      : app.guestContact
        ? `${app.guestContact.firstName ?? ''} ${app.guestContact.lastName ?? ''}`.trim() || 'Guest'
        : 'Patient';
  };

  const EVENT_LABELS: Record<string, string> = {
    'APPOINTMENT_BOOKED': 'Booking Confirmation',
    'APPOINTMENT_CONVERTED_FROM_INQUIRY': 'Inquiry Approved',
    'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS': 'Inquiry Approved SMS',
    'APPOINTMENT_MANUALLY_BOOKED_PATIENT': 'Manual Booking',
    'APPOINTMENT_MANUALLY_BOOKED_GUEST': 'Manual Booking',
    'APPOINTMENT_REMINDER_24H': '24-Hour Reminder',
    'APPOINTMENT_REMINDER_48H': '48-Hour Reminder',
    'RESCHEDULE_BOOKING': 'Rescheduled',
    'CANCEL_BOOKING': 'Cancelled',
    'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Manual Booking SMS',
    'APPOINTMENT_REMINDER_48H_SMS': '48-Hour Reminder SMS',
    'APPOINTMENT_REMINDER_24H_SMS': '24-Hour Reminder SMS',
    'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Post-Care SMS',
  };

  const allCards: AppointmentCardData[] = useMemo(() => {
    return appointments.map((app) => {
      const act = activityMap[app.id];
      const latestLabel = act?.latestEventType ? (EVENT_LABELS[act.latestEventType] || act.latestEventType) : undefined;
      return {
        id: app.id,
        patientName: formatPatientName(app),
        treatmentName: app.service?.name ?? 'Unknown',
        date: app.date,
        startTime: app.startTime,
        endTime: app.endTime,
        doctorName: app.doctor ? `Dr. ${app.doctor.firstName} ${app.doctor.lastName}` : '',
        channelsUsed: {
          email: !!(app.emailConfirmationSent || app.emailReminder48hSent || app.emailReminder24hSent || app.emailCheckoutSent),
          sms: !!(app.smsConfirmationSent || app.smsReminder48hSent || app.smsReminder24hSent || app.smsCheckoutSent),
        },
        lastActivity: act?.lastActivity ?? null,
        hasFailed: act?.hasFailed ?? false,
        failureCount: act?.failureCount ?? 0,
        latestEventPreview: act?.latestEventType ? `${latestLabel} → ${act.latestRecipient || 'system'}` : undefined,
      };
    });
  }, [appointments, activityMap]);

  const appointmentCards = useMemo(() => {
    let filtered = allCards;

    if (leftTab === 'all') {
      filtered = filtered.filter((c) => c.lastActivity !== null);
    } else if (leftTab === 'failed') {
      filtered = filtered.filter((c) => c.hasFailed);
    }

    return filtered.sort((a, b) => {
      if (!a.lastActivity && !b.lastActivity) return 0;
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return b.lastActivity.localeCompare(a.lastActivity);
    });
  }, [allCards, leftTab]);

  const timelineEntries: TimelineEntry[] = useMemo(() => {
    return emailLogs.map((log) => ({
      id: log.id,
      channel: log.eventType.endsWith('_SMS') ? 'SMS' as const : 'EMAIL' as const,
      eventType: log.eventType,
      status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
      rawStatus: log.status,
      recipient: (log.payload as any)?.email || (log.payload as any)?.guestEmail || (log.payload as any)?.phoneNumber || 'system',
      timestamp: log.createdAt,
      retryCount: log.retryCount,
      errorLogs: log.errorLogs || null,
      payload: log.payload,
    }));
  }, [emailLogs]);

  return {
    appointmentCards,
    timelineEntries,
    selectedAppointment,
    selectedAppointmentId,
    setSelectedAppointmentId,
    isLoadingApps,
    isLoadingLogs,
    resendEmail,
    resendingId,
    leftTab,
    setLeftTab,
    refresh: fetchAppointments,
  };
}
