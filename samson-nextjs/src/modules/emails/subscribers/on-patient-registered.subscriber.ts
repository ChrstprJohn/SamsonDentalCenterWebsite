import { ResendService } from '@/shared/services/email/resend.service';
import { patientRegisteredEventSchema } from '../dtos/events/patient-registered.event.dto';

export const onPatientRegisteredSubscriber = {
  /**
   * Handles the PATIENT_REGISTERED event by sending an OTP email.
   * Validates the payload against the DTO contract.
   * Throws an error if Resend API fails so the dispatcher can retry.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    // Contract Validation
    const { email, firstName, otpCode } = patientRegisteredEventSchema.parse(payload);

    await ResendService.sendTemplatedEmail(
      email,
      'Your Samson Dental Center Verification Code',
      'signup_otp',
      { firstName, otpCode }
    );
  }
};
