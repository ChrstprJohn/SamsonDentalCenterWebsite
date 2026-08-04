import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onInquirySubmittedSubscriber = {
  /**
   * Handles the APPOINTMENT_INQUIRY_RECEIVED event by sending a "Booking Request Received" email to guest/patient.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { inquiryId, firstName, lastName, email, preferredServiceId, preferredDate, preferredStartTime } = payload;

    if (!email) {
      console.warn('[Inquiry Submitted Email] Skipping: No email provided in payload', payload);
      return;
    }

    const supabaseAdmin = await createAdminClient();

    let serviceName = 'General Inquiry & Consultation';
    if (preferredServiceId) {
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('name')
        .eq('id', preferredServiceId)
        .maybeSingle();

      if (service?.name) {
        serviceName = service.name;
      }
    }

    const patientName = `${firstName || ''} ${lastName || ''}`.trim() || 'Valued Patient';
    const dateStr = preferredDate ? formatShortDate(preferredDate) : 'To be confirmed';
    const timeRangeStr = preferredStartTime ? formatClinicTime(preferredStartTime) : 'Flexible Time';
    const baseUrl = getBaseUrl();

    await ResendService.sendTemplatedEmail(
      email,
      "We've Received Your Booking Request",
      'appointment_request_received',
      {
        accountHolderName: patientName,
        patientType: 'SELF',
        patientName,
        serviceName,
        doctorName: 'Assigned Dentist',
        dateStr,
        timeRangeStr,
        appointmentId: inquiryId || 'INQUIRY',
        dashboardUrl: `${baseUrl}/`,
      }
    );
  },
};
