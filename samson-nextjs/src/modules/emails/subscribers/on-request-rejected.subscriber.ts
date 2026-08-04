import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
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

    if (appointmentId && (!recipientEmail || !patientName)) {
      const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('patient_id, guest_contacts(first_name, last_name, email), patient:users!appointments_patient_id_fkey(first_name, last_name, email)')
        .eq('id', appointmentId)
        .maybeSingle();

      if (appt) {
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

    if (inquiryId && (!recipientEmail || !patientName)) {
      const { data: inq } = await supabaseAdmin
        .from('appointment_inquiries')
        .select('first_name, last_name, email')
        .eq('id', inquiryId)
        .maybeSingle();
      if (inq) {
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

    await ResendService.sendTemplatedEmail(
      recipientEmail,
      'Update on Your Booking Request',
      'request_rejected',
      {
        patientName: patientName || 'Valued Patient',
        rejectionReason: reason,
        baseUrl,
      }
    );
  },
};
