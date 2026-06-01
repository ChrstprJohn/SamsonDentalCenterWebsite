import { ResendService } from '@/shared/services/email/resend.service';
import { passwordResetRequestedEventSchema } from '../dtos/events/password-reset-requested.event.dto';

export const onPasswordResetRequestedSubscriber = {
  /**
   * Handles the PASSWORD_RESET_REQUESTED event by sending a recovery OTP email.
   * Validates the payload against the DTO contract.
   * Throws an error if Resend API fails so the dispatcher can retry.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    // Contract Validation
    const { email, firstName, otpCode } = passwordResetRequestedEventSchema.parse(payload);

    await ResendService.sendTemplatedEmail(
      email,
      'Your Samson Dental Center Password Reset Code',
      'reset_password_otp',
      { firstName, otpCode }
    );
  }
};
