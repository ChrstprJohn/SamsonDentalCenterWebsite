import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onRequestRejectedSubscriber = {
  /**
   * Handles REJECT_INQUIRY outbox events by sending a request rejected email.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, inquiryId, rejectionReason, recipientEmail: directEmail, patientName: directName } = payload;
    const supabaseAdmin = await createAdminClient();

    let recipientEmail = directEmail || '';
    let patientName = directName || '';
    let serviceName = payload.serviceName || '';
    let dateStr = payload.dateStr || (payload.preferredDate ? formatShortDate(payload.preferredDate) : '');
    let timeRangeStr = payload.timeRangeStr || (payload.preferredStartTime ? formatClinicTime(payload.preferredStartTime) : '');

    if (appointmentId && (!recipientEmail || !patientName || !serviceName)) {
      const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select(`
          patient_id,
          date,
          start_time,
          end_time,
          service:services(name),
          guest_contacts(first_name, last_name, email),
          patient:users!appointments_patient_id_fkey(first_name, last_name, email)
        `)
        .eq('id', appointmentId)
        .maybeSingle();

      if (appt) {
        if (!serviceName && (appt.service as any)?.name) {
          serviceName = (appt.service as any).name;
        }
        if (!dateStr && appt.date) {
          dateStr = formatShortDate(appt.date);
        }
        if (!timeRangeStr && appt.start_time) {
          timeRangeStr = formatClinicTime(appt.start_time);
        }

        const gcData = Array.isArray(appt.guest_contacts) ? appt.guest_contacts[0] : (appt.guest_contacts as any);
        if (gcData && (gcData.email || gcData.first_name)) {
          recipientEmail = recipientEmail || gcData.email || '';
          patientName = patientName || `${gcData.first_name || ''} ${gcData.last_name || ''}`.trim();
        } else if (appt.patient) {
          recipientEmail = recipientEmail || appt.patient.email || '';
          patientName = patientName || `${appt.patient.first_name || ''} ${appt.patient.last_name || ''}`.trim();
        }
      }
    }

    if (inquiryId && (!recipientEmail || !patientName || !serviceName)) {
      const { data: inq } = await supabaseAdmin
        .from('appointment_inquiries')
        .select(`
          first_name,
          last_name,
          email,
          preferred_date,
          preferred_start_time,
          service:services(name)
        `)
        .eq('id', inquiryId)
        .maybeSingle();

      if (inq) {
        if (!serviceName && (inq.service as any)?.name) {
          serviceName = (inq.service as any).name;
        }
        if (!dateStr && inq.preferred_date) {
          dateStr = formatShortDate(inq.preferred_date);
        }
        if (!timeRangeStr && inq.preferred_start_time) {
          timeRangeStr = formatClinicTime(inq.preferred_start_time);
        }
        recipientEmail = recipientEmail || inq.email || '';
        patientName = patientName || `${inq.first_name} ${inq.last_name}`;
      }
    }

    if (!recipientEmail) {
      console.warn(`[Request Rejected Email] Skipping: No recipient email found for payload`, payload);
      return;
    }

    const baseUrl = getBaseUrl();
    const reason = rejectionReason || payload.reason || 'Unfortunately, we are unable to accommodate your request at this time.';
    const idToFormat = appointmentId || inquiryId;
    const ref = formatRefId(idToFormat);
    const subject = `Update on Your Booking Request${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      recipientEmail,
      subject,
      'request_rejected',
      {
        patientName: patientName || 'Valued Patient',
        serviceName,
        dateStr,
        timeRangeStr,
        appointmentId: idToFormat,
        rejectionReason: reason,
        rebookUrl: `${baseUrl}/book`,
        baseUrl,
      }
    );
  },
};
